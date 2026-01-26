from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.api.dependencies import get_current_user
from app.services.encryption_service import EncryptionService
from app.storage import get_storage
from app.utils.file_policy import is_macro_file
from app.core.config import settings

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    if is_macro_file(file.filename) and not settings.ALLOW_MACRO_FILES:
        raise HTTPException(
            status_code=400,
            detail="Macro-enabled files are not allowed"
        )

    file_bytes = await file.read()

    storage = get_storage()
    service = EncryptionService(storage, user_id)

    metadata = service.encrypt_and_store(
        file_bytes=file_bytes,
        filename=file.filename,
        mime_type=file.content_type
    )

    return {
        "file_id": metadata.file_id,
        "filename": metadata.original_filename,
        "warning": "Macro-enabled file"
        if is_macro_file(file.filename)
        else None
    }
