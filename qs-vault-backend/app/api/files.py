from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.encryption_service import EncryptionService
from app.services.storage import StorageService
from app.core.config import settings
from app.models.domain import FileMetadata, User
import uuid
import os

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), mode: str = Form("hybrid"),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        file_bytes = await file.read()
        res = EncryptionService.process_upload(file_bytes, mode=mode)

        c_path = f"{uuid.uuid4()}-{file.filename}.enc"
        StorageService.save(c_path, res['encrypted_file'])

        # We fill nonce/tag/salt with dummy data or simple bytes because
        # they are now INSIDE the file. We keep columns to avoid DB migration errors.
        db_file = FileMetadata(
            owner_id=current_user.id, filename=file.filename, filesize=len(
                file_bytes),
            cloud_path=c_path, algo_mode=mode,
            pqc_secret_key=res['metadata']['pqc_secret_key'],
            pqc_ciphertext_cap=res['metadata']['pqc_ciphertext_cap'],
            aes_nonce=b'stored_in_file',
            encryption_tag=b'stored_in_file',
            kdf_salt=b'stored_in_file',
            time_pqc=res['metrics']['pqc_encap_ms'],
            time_aes=res['metrics']['aes_enc_ms'],
            time_total=res['metrics']['total_ms']
        )
        db.add(db_file)
        db.commit()
        return {"status": "ok", "file_id": db_file.id, "metrics": res['metrics']}
    except Exception as e:
        print(f"UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
def list_files(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    files = db.query(FileMetadata).filter(
        FileMetadata.owner_id == current_user.id).all()
    return [{"id": f.id, "filename": f.filename, "size": f.filesize, "date": f.upload_date, "mode": f.algo_mode, "metrics": {"pqc": f.time_pqc, "aes": f.time_aes, "total": f.time_total}} for f in files]


@router.get("/download/{file_id}")
def download_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    f = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404)
    if f.algo_mode != "hybrid":
        raise HTTPException(status_code=400, detail="RSA Benchmark Only")

    try:
        # 1. Get the Self-Contained Blob
        file_blob = StorageService.get(f.cloud_path)

        # 2. Only need PQC keys from DB
        meta = {
            "pqc_secret_key": f.pqc_secret_key,
            "pqc_ciphertext_cap": f.pqc_ciphertext_cap
        }

        # 3. Decrypt (Service handles extraction)
        plain = EncryptionService.process_download(
            file_blob, meta, mode="hybrid")

        from fastapi.responses import Response
        return Response(content=plain, media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={f.filename}"})
    except ValueError as ve:
        print(f"DECRYPT ERROR: {ve}")
        raise HTTPException(status_code=400, detail="Integrity Check Failed")
    except Exception as e:
        print(f"UNKNOWN ERROR: {e}")
        raise HTTPException(status_code=500, detail="Server Error")


@router.get("/inspect/{file_id}")
def inspect_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    f = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not f:
        raise HTTPException(404)
    path = os.path.join(settings.UPLOAD_DIR, f.cloud_path)
    with open(path, "rb") as file:
        return {"filename": f.filename, "cloud_path": f.cloud_path, "hex_preview": file.read(64).hex().upper(), "size": f.filesize}


@router.delete("/delete/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    f = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not f:
        raise HTTPException(404)
    db.delete(f)
    db.commit()
    return {"status": "deleted"}
