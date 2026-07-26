import uuid
import os
import magic
from typing import List
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.gallery import GalleryRepository
from app.models.models import Gallery
from app.core.config import settings
import httpx
import urllib.parse

class GalleryService:
    def __init__(self, session: AsyncSession):
        self.repo = GalleryRepository(session)
        self.bucket_name = settings.SUPABASE_BUCKET

    async def upload_image(self, file: UploadFile, folder: str = "general", event_id: uuid.UUID = None) -> Gallery:
        # 1. Validate file extension and size
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Invalid file format. Allowed: {allowed_extensions}")
            
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

        # 2. Generate unique filename
        if ".." in folder or folder.startswith("/") or "\\" in folder:
            raise HTTPException(status_code=400, detail="Invalid folder path")

        unique_filename = f"{folder}/{uuid.uuid4()}{ext}"
        unique_filename = unique_filename.replace("//", "/")
        
        # 3. Read file and validate magic bytes
        file_bytes = await file.read()
        mime = magic.from_buffer(file_bytes[:2048], mime=True)
        if mime not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Malicious or unsupported file type detected.")
        
        # Upload to Supabase using httpx
        
        supabase_url = settings.SUPABASE_URL
        supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY
        bucket_encoded = urllib.parse.quote(self.bucket_name)
        
        url = f"{supabase_url}/storage/v1/object/{bucket_encoded}/{unique_filename}"
        
        headers = {
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": file.content_type,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, content=file_bytes)
            
        if resp.status_code >= 400:
            raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {resp.text}")
        
        # 4. Get Public URL
        public_url = f"{supabase_url}/storage/v1/object/public/{bucket_encoded}/{unique_filename}"
        
        # 5. Save to database
        gallery_item = Gallery(
            image_url=public_url,
            event_id=event_id
        )
        return await self.repo.create(gallery_item)

    async def get_all_images(self, page: int = 1, page_size: int = 20) -> dict:
        items, total = await self.repo.get_all(page=page, page_size=page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_event_images(self, event_id: uuid.UUID) -> List[Gallery]:
        return await self.repo.get_by_event(event_id)

    async def delete_image(self, gallery_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(gallery_id)
        if not item:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Extract path from URL (naive approach, assume it's the part after bucket name)
        # url structure: .../storage/v1/object/public/IEDC gallary/folder/uuid.ext
        try:
            path = item.image_url.split(f"{self.bucket_name}/")[1]
            supabase_client.storage.from_(self.bucket_name).remove([path])
        except Exception as e:
            # Continue with db deletion even if storage fails to delete
            print(f"Failed to delete from storage: {e}")
            
        await self.repo.delete(gallery_id)
