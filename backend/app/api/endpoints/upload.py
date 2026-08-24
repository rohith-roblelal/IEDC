import os
import uuid
import filetype
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.models.models import User
from app.models.enums import Role
from app.api.dependencies import get_current_super_admin, get_optional_current_user
from app.services.audit import log_audit_event
from app.core.supabase import supabase_client
from app.core.rate_limit import limiter

router = APIRouter()

SUPABASE_BUCKET = settings.SUPABASE_BUCKET
SUPABASE_PRIVATE_BUCKET = getattr(settings, "SUPABASE_PRIVATE_BUCKET", "iedc-private")

# Explicit Storage Namespace Map
# Resource Prefix -> (Bucket Name, Requires Super Admin Auth)
NAMESPACE_MAP = {
    "events/payments": (SUPABASE_PRIVATE_BUCKET, False),
    "events": (SUPABASE_BUCKET, True),
    "gallery": (SUPABASE_BUCKET, True),
    "team": (SUPABASE_BUCKET, True),
    "partners": (SUPABASE_BUCKET, True),
    "startups": (SUPABASE_BUCKET, True),
    "podcasts": (SUPABASE_BUCKET, True),
}

def get_namespace_config(path: str) -> tuple[str, bool]:
    # Reject explicitly malformed namespaces
    if not path or "//" in path or path.startswith("/") or path.endswith("/"):
        return None, True
        
    # Match the longest valid prefix
    for prefix in sorted(NAMESPACE_MAP.keys(), key=len, reverse=True):
        if path == prefix or path.startswith(prefix + "/"):
            return NAMESPACE_MAP[prefix]
            
    # Fail-closed: Do not default to a fallback. Reject unknown namespaces.
    return None, True

@router.post("")
@limiter.limit("20/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    folder: str = Form(...),
    current_user: User | None = Depends(get_optional_current_user)
):
    if ".." in folder or folder.startswith("/") or "\\" in folder:
        raise HTTPException(status_code=400, detail="Invalid folder path (directory traversal blocked)")
        
    bucket_to_use, requires_admin = get_namespace_config(folder)
    
    if not bucket_to_use:
        raise HTTPException(status_code=400, detail="Invalid resource namespace")
        
    if requires_admin and (not current_user or current_user.role != Role.SUPER_ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized to upload to this namespace")

    filename = file.filename or "upload.bin"
    ext = filename.split('.')[-1].lower() if '.' in filename else ""
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only jpg, png, webp allowed.")
    
    if file.size is not None and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    elif file.size is None:
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    
    # Read first 2KB to verify magic bytes
    chunk = await file.read(2048)
    kind = filetype.guess(chunk)
    mime = kind.mime if kind else None
    if mime not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Malicious or unsupported file type detected.")
    
    # Reset file pointer for the streaming upload
    await file.seek(0)
    file_bytes = await file.read()

    filename = f"{uuid.uuid4().hex[:8]}.{ext}"
    path = f"{folder}/{filename}"
    # Remove any duplicate slashes
    path = path.replace("//", "/")
    
    try:
        def _upload():
            return supabase_client.storage.from_(bucket_to_use).upload(
                file=file_bytes,
                path=path,
                file_options={"content-type": mime}
            )
        res = await run_in_threadpool(_upload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {str(e)}")

    if bucket_to_use == SUPABASE_PRIVATE_BUCKET:
        # Return a signed URL valid for 30 days so the admin can review it later
        res_url = supabase_client.storage.from_(bucket_to_use).create_signed_url(path, 60 * 60 * 24 * 30)
        public_url = res_url.get("signedURL") if res_url else ""
    else:
        public_url = supabase_client.storage.from_(bucket_to_use).get_public_url(path)
    
    await log_audit_event(db, "upload.create", user_id=current_user.id, resource_type="upload", resource_id=path, ip_address=request.client.host if request.client else None)
    return {"url": public_url, "path": path}

@router.delete("")
@limiter.limit("20/minute")
async def delete_image(
    request: Request,
    path: str,
    current_user: User = Depends(get_current_super_admin)
):
    if ".." in path or path.startswith("/") or "\\" in path:
        raise HTTPException(status_code=400, detail="Invalid path (directory traversal blocked)")
        
    bucket_to_use, _ = get_namespace_config(path)
    if not bucket_to_use:
        raise HTTPException(status_code=400, detail="Invalid resource namespace for deletion")

    try:
        def _remove():
            return supabase_client.storage.from_(bucket_to_use).remove([path])
        res = await run_in_threadpool(_remove)
        # Supabase API usually returns a list of deleted objects or an error
        if not res:
            raise Exception("File not found or couldn't be deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete from Supabase: {str(e)}")
        
    await log_audit_event(db, "upload.delete", user_id=current_user.id, resource_type="upload", resource_id=path, ip_address=request.client.host if request.client else None)
    return {"status": "deleted"}
