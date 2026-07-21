import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
import httpx
import urllib.parse
from app.core.config import settings
from app.models.models import User
from app.api.dependencies import get_current_active_admin

router = APIRouter()

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY
SUPABASE_BUCKET = settings.SUPABASE_BUCKET

@router.post("/")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form(...),
    current_user: User = Depends(get_current_active_admin)
):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Storage configured incorrectly")

    ext = file.filename.split('.')[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only jpg, png, webp allowed.")
    
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    filename = f"{uuid.uuid4().hex[:8]}.{ext}"
    path = f"{folder}/{filename}"
    # Remove any duplicate slashes
    path = path.replace("//", "/")
    
    bucket_encoded = urllib.parse.quote(SUPABASE_BUCKET)
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket_encoded}/{path}"

    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": file.content_type,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, content=file_bytes)
        
    if resp.status_code >= 400:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {resp.text}")

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_encoded}/{path}"
    
    return {"url": public_url, "path": path}

@router.delete("/")
async def delete_image(
    path: str,
    current_user: User = Depends(get_current_active_admin)
):
    bucket_encoded = urllib.parse.quote(SUPABASE_BUCKET)
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket_encoded}/{path}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.delete(url, headers=headers)
        
    if resp.status_code >= 400:
        raise HTTPException(status_code=500, detail="Failed to delete from Supabase")
        
    return {"status": "deleted"}
