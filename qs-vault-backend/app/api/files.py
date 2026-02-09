import uuid
import logging
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, Response
from app.core.supabase import supabase_client
from app.services.encryption_service import EncryptionService

# Setup logging to see errors in the terminal
logger = logging.getLogger("uvicorn")

router = APIRouter()


def get_user_from_token(authorization: str):
    if not authorization:
        raise HTTPException(
            status_code=401, detail="Missing Authorization Header")
    try:
        token = authorization.split(" ")[1]
        supabase_client.postgrest.auth(token)
        user_response = supabase_client.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid Token")
        return user_response.user
    except Exception as e:
        logger.error(f"Auth Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication Failed")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    mode: str = Form("hybrid"),
    authorization: str = Header(None)
):
    user = get_user_from_token(authorization)

    try:
        # 1. Read & Encrypt
        file_bytes = await file.read()
        res = EncryptionService.process_upload(file_bytes, mode=mode)

        # 2. Upload to Supabase Storage
        # FIX: Clean filename to remove spaces/special chars which cause 502s
        clean_filename = "".join(
            x for x in file.filename if x.isalnum() or x in "._-")
        c_path = f"{user.id}/{uuid.uuid4()}-{clean_filename}.enc"

        logger.info(f"Attempting upload to: {c_path}")

        try:
            supabase_client.storage.from_("encrypted_vault").upload(
                path=c_path,
                file=res['encrypted_file'],
                file_options={"content-type": "application/octet-stream"}
            )
        except Exception as storage_err:
            # CHECK YOUR TERMINAL FOR THIS MESSAGE
            logger.error(f"CRITICAL STORAGE ERROR: {str(storage_err)}")
            raise HTTPException(
                status_code=502, detail=f"Storage Rejected Upload: {str(storage_err)}")

        # 3. Insert Metadata
        db_file = {
            "owner_id": user.id,
            "filename": file.filename,
            "file_size": len(file_bytes),
            "storage_path": c_path,
            "algo_mode": mode,
            "pqc_secret_key": res['metadata']['pqc_secret_key'],
            "pqc_ciphertext_cap": res['metadata']['pqc_ciphertext_cap'],
            "time_pqc": res['metrics'].get('pqc_encap_ms', 0),
            "time_aes": res['metrics'].get('aes_enc_ms', 0),
            "time_total": res['metrics'].get('total_ms', 0)
        }

        data, count = supabase_client.table("files").insert(db_file).execute()

        return {
            "status": "ok",
            "file_id": data[1][0]['id'],
            "metrics": res['metrics']
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"GENERAL UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ... (Keep your list/download/inspect endpoints the same) ...
# Just add "logger.error(str(e))" to their except blocks so you can debug them too.


@router.get("/list")
def list_files(authorization: str = Header(None)):
    get_user_from_token(authorization)
    response = supabase_client.table("files").select(
        "*").order("created_at", desc=True).execute()
    return [{
        "id": f['id'], "filename": f['filename'], "size": f['file_size'],
        "date": f['created_at'], "mode": f['algo_mode'],
        "metrics": {"pqc": f['time_pqc'], "aes": f['time_aes'], "total": f['time_total']}
    } for f in response.data]


# In app/api/files.py

# In app/api/files.py

@router.get("/download/decrypted/{file_id}")
def download_file(file_id: str, authorization: str = Header(None)):
    get_user_from_token(authorization)

    # 1. Get Record
    resp = supabase_client.table("files").select(
        "*").eq("id", file_id).execute()
    if not resp.data:
        raise HTTPException(404, "File not found")
    f = resp.data[0]

    # 2. RSA Check (Your screenshot shows RSA files!)
    if f['algo_mode'] != "hybrid":
        raise HTTPException(
            status_code=400, detail="RSA Benchmark Only - Cannot Decrypt")

    try:
        # 3. Download & Decrypt
        file_blob = supabase_client.storage.from_(
            "encrypted_vault").download(f['storage_path'])
        meta = {"pqc_secret_key": f['pqc_secret_key'],
                "pqc_ciphertext_cap": f['pqc_ciphertext_cap']}

        plain = EncryptionService.process_download(
            file_blob, meta, mode="hybrid")

        # 4. Return with Quotes around filename
        return Response(
            content=plain,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{f["filename"]}"'}
        )
    except Exception as e:
        print(f"DECRYPT FAIL: {e}")
        raise HTTPException(403, "Integrity Check Failed")


@router.delete("/delete/{file_id}")
def delete_file(file_id: str, authorization: str = Header(None)):
    get_user_from_token(authorization)

    try:
        # 1. Try to find the file
        resp = supabase_client.table("files").select(
            "storage_path").eq("id", file_id).execute()

        # If file is already gone from DB, just return success so Frontend clears it
        if not resp.data:
            return {"status": "deleted (already gone)"}

        path = resp.data[0]['storage_path']

        # 2. Try to delete from Storage (Ignore errors if missing)
        try:
            supabase_client.storage.from_("encrypted_vault").remove([path])
        except Exception as e:
            logger.warning(f"Storage delete failed (might be missing): {e}")

        # 3. Delete from DB
        supabase_client.table("files").delete().eq("id", file_id).execute()

        return {"status": "deleted"}

    except Exception as e:
        # If anything else fails, print it but allow the process to continue
        logger.error(f"Delete Logic Error: {e}")
        return {"status": "error_handled"}


@router.get("/inspect/{file_id}")
def inspect_file(file_id: str, authorization: str = Header(None)):
    get_user_from_token(authorization)
    f = supabase_client.table("files").select(
        "*").eq("id", file_id).execute().data[0]
    blob = supabase_client.storage.from_(
        "encrypted_vault").download(f['storage_path'])
    return {"filename": f['filename'], "cloud_path": f['storage_path'], "hex_preview": blob[:64].hex().upper(), "size": f['file_size']}


@router.get("/download/encrypted/{file_id}")
def download_encrypted(file_id: str, authorization: str = Header(None)):
    get_user_from_token(authorization)

    resp = supabase_client.table("files").select(
        "*").eq("id", file_id).execute()

    if not resp.data:
        raise HTTPException(404, "File not found")

    f = resp.data[0]

    blob = supabase_client.storage.from_(
        "encrypted_vault").download(f['storage_path'])

    return Response(
        content=blob,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{f["filename"]}.enc"'
        }
    )
