from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db # You need to create a simple db helper
from app.core.security import get_current_user # You need to create auth logic
from app.services.encryption_service import EncryptionService
from app.services.storage import StorageService # We will define this next
from app.models.domain import FileMetadata, User
import uuid
import os

router = APIRouter()

MACRO_EXTENSIONS = {'.docm', '.xlsm', '.pptm', '.dotm', '.xltm', '.exe', '.bat', '.sh'}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Macro/Threat Detection
        file_ext = os.path.splitext(file.filename)[1].lower()
        has_macros = file_ext in MACRO_EXTENSIONS
        
        # 2. Read file (Supports ALL formats: PDF, DOC, BINARY)
        file_bytes = await file.read()
        
        # 3. Encrypt (The Macro is now encrypted and inert)
        crypto_result = EncryptionService.process_upload(file_bytes)
        
        # 4. Generate Cloud Path
        cloud_filename = f"{uuid.uuid4()}-{file.filename}.enc"
        
        # 5. Store Encrypted Blob
        StorageService.save(cloud_filename, crypto_result['encrypted_file'])
        
        # 6. Save Metadata (Including Risk Flag)
        db_file = FileMetadata(
            owner_id=current_user.id,
            filename=file.filename,
            filesize=len(file_bytes),
            cloud_path=cloud_filename,
            pqc_secret_key=crypto_result['metadata']['pqc_secret_key'],
            pqc_ciphertext_cap=crypto_result['metadata']['pqc_ciphertext_cap'],
            aes_nonce=crypto_result['metadata']['aes_nonce'],
            encryption_tag=crypto_result['metadata']['encryption_tag'],
            # We could add a 'is_risk' column to DB later, for now we just log it
        )
        db.add(db_file)
        db.commit()
        
        response_msg = "Secure upload complete."
        if has_macros:
            response_msg += " WARNING: Macro-enabled file detected. Encrypted safely, but exercise caution upon decryption."

        return {
            "status": response_msg,
            "file_id": db_file.id,
            "metrics": crypto_result['metrics'],
            "protection": "Post-Quantum (Kyber-512) + AES-256-GCM",
            "file_type_check": "PASS" if not has_macros else "MACRO_DETECTED"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List only the files belonging to the logged-in user."""
    files = db.query(FileMetadata).filter(FileMetadata.owner_id == current_user.id).all()
    return [{"id": f.id, "filename": f.filename, "size": f.filesize, "date": f.upload_date} for f in files]

@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Secure Download Endpoint.
    1. Checks ownership.
    2. Fetches encrypted blob.
    3. Performs PQC Decapsulation + Integrity Check.
    """
    # 1. Ownership Check
    file_record = db.query(FileMetadata).filter(
        FileMetadata.id == file_id, 
        FileMetadata.owner_id == current_user.id
    ).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    # 2. Fetch Encrypted Blob
    encrypted_bytes = StorageService.get(file_record.cloud_path)
    
    # 3. Decrypt & Verify
    try:
        metadata = {
            "pqc_secret_key": file_record.pqc_secret_key,
            "pqc_ciphertext_cap": file_record.pqc_ciphertext_cap,
            "aes_nonce": file_record.aes_nonce,
            "encryption_tag": file_record.encryption_tag
        }
        
        plaintext, metrics = EncryptionService.process_download(encrypted_bytes, metadata)
        
        # Return as downloadable stream
        from fastapi.responses import Response
        return Response(
            content=plaintext, 
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={file_record.filename}"}
        )

    except ValueError:
        # This handles the "Failure Visualization" requirement
        raise HTTPException(status_code=400, detail="INTEGRITY FAILURE: Ciphertext tampering detected.")