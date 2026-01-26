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
    file: UploadFile = File(...), 
    mode: str = Form("hybrid"), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        file_bytes = await file.read()
        crypto_result = EncryptionService.process_upload(file_bytes, mode=mode)
        
        cloud_filename = f"{uuid.uuid4()}-{file.filename}.enc"
        StorageService.save(cloud_filename, crypto_result['encrypted_file'])
        
        db_file = FileMetadata(
            owner_id=current_user.id,
            filename=file.filename,
            filesize=len(file_bytes),
            cloud_path=cloud_filename,
            algo_mode=mode,
            pqc_secret_key=crypto_result['metadata']['pqc_secret_key'],
            pqc_ciphertext_cap=crypto_result['metadata']['pqc_ciphertext_cap'],
            aes_nonce=crypto_result['metadata']['aes_nonce'],
            encryption_tag=crypto_result['metadata']['encryption_tag'],
            kdf_salt=crypto_result['metadata']['kdf_salt'], # CRITICAL FIX
            time_pqc=crypto_result['metrics']['pqc_encap_ms'],
            time_aes=crypto_result['metrics']['aes_enc_ms'],
            time_total=crypto_result['metrics']['total_ms']
        )
        db.add(db_file)
        db.commit()
        return {"status": "secure_upload_complete", "file_id": db_file.id, "metrics": crypto_result['metrics']}
    except Exception as e:
        print(f"UPLOAD ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file = db.query(FileMetadata).filter(FileMetadata.id == file_id, FileMetadata.owner_id == current_user.id).first()
    if not file: raise HTTPException(status_code=404, detail="File not found")
    db.delete(file)
    db.commit()
    return {"status": "deleted"}

@router.get("/list")
def list_files(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    files = db.query(FileMetadata).filter(FileMetadata.owner_id == current_user.id).order_by(FileMetadata.upload_date.desc()).all()
    return [{"id": f.id, "filename": f.filename, "size": f.filesize, "date": f.upload_date, "mode": f.algo_mode, "metrics": {"pqc": f.time_pqc, "aes": f.time_aes, "total": f.time_total}} for f in files]

@router.get("/download/{file_id}")
def download_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_record = db.query(FileMetadata).filter(FileMetadata.id == file_id, FileMetadata.owner_id == current_user.id).first()
    if not file_record: raise HTTPException(status_code=404, detail="File not found")
    if file_record.algo_mode != "hybrid": raise HTTPException(status_code=400, detail="BASELINE MODE: Files are for benchmarking only.")

    try:
        encrypted_bytes = StorageService.get(file_record.cloud_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Cloud Object Missing")
    
    metadata = {
        "pqc_secret_key": file_record.pqc_secret_key,
        "pqc_ciphertext_cap": file_record.pqc_ciphertext_cap,
        "aes_nonce": file_record.aes_nonce,
        "encryption_tag": file_record.encryption_tag,
        "kdf_salt": file_record.kdf_salt # CRITICAL FIX
    }
    try:
        plaintext = EncryptionService.process_download(encrypted_bytes, metadata, mode="hybrid")
        from fastapi.responses import Response
        return Response(content=plaintext, media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={file_record.filename}"})
    except ValueError:
        raise HTTPException(status_code=400, detail="INTEGRITY FAILURE: Ciphertext tampering detected.")

@router.get("/inspect/{file_id}")
def inspect_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_record = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not file_record: raise HTTPException(status_code=404, detail="File not found")
    try:
        path = os.path.join(settings.UPLOAD_DIR, file_record.cloud_path)
        with open(path, "rb") as f:
            raw_bytes = f.read(64)
        return {"filename": file_record.filename, "cloud_path": file_record.cloud_path, "hex_preview": raw_bytes.hex().upper(), "size": file_record.filesize}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))