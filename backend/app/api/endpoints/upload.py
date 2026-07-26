import os
import uuid
import magic
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from app.core.config import settings
from app.models.models import User
from app.api.dependencies import get_current_super_admin
from app.core.supabase import supabase_client
from app.core.rate_limit import limiter

router = APIRouter()

SUPABASE_BUCKET = settings.SUPABASE_BUCKET

@router.post("")
@limiter.limit("20/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    folder: str = Form(...),
    current_user: User = Depends(get_current_super_admin)
):
    if ".." in folder or folder.startswith("/") or "\\" in folder:
        raise HTTPException(status_code=400, detail="Invalid folder path")

    ext = file.filename.split('.')[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only jpg, png, webp allowed.")
    
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    
    # Read first 2KB to verify magic bytes
    chunk = await file.read(2048)
    mime = magic.from_buffer(chunk, mime=True)
    if mime not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Malicious or unsupported file type detected.")
    
    # Reset file pointer for the streaming upload
    await file.seek(0)

    filename = f"{uuid.uuid4().hex[:8]}.{ext}"
    path = f"{folder}/{filename}"
    # Remove any duplicate slashes
    path = path.replace("//", "/")
    
    try:
        res = supabase_client.storage.from_(SUPABASE_BUCKET).upload(
            file=file.file,
            path=path,
            file_options={"content-type": mime}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {str(e)}")

    public_url = supabase_client.storage.from_(SUPABASE_BUCKET).get_public_url(path)
    
    return {"url": public_url, "path": path}

@router.delete("")
@limiter.limit("20/minute")
async def delete_image(
    request: Request,
    path: str,
    current_user: User = Depends(get_current_super_admin)
):
    if ".." in path or path.startswith("/") or "\\" in path:
        raise HTTPException(status_code=400, detail="Invalid path")
    try:
        res = supabase_client.storage.from_(SUPABASE_BUCKET).remove([path])
        # Supabase API usually returns a list of deleted objects or an error
        if not res:
            raise Exception("File not found or couldn't be deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete from Supabase: {str(e)}")
        
    return {"status": "deleted"}
