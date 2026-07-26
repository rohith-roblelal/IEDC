import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile, HTTPException, status
from app.core.supabase import supabase_client
from app.core.config import settings

class StorageService:
    def __init__(self, bucket_name: str = settings.SUPABASE_BUCKET):
        self.bucket_name = bucket_name
        self.client = supabase_client

    async def validate_file(self, file: UploadFile, max_size_mb: int = 5, allowed_types: List[str] = None) -> bool:
        """Validate file size and MIME type."""
        if allowed_types is None:
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Allowed types: {', '.join(allowed_types)}"
            )
            
        file.file.seek(0, 2)
        size_bytes = file.file.tell()
        file.file.seek(0)
        
        max_bytes = max_size_mb * 1024 * 1024
        if size_bytes > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {max_size_mb}MB"
            )
        
        return True

    def generate_storage_path(self, filename: str, folder: str = "gallery") -> str:
        """Generate a unique storage path for the file."""
        ext = filename.split(".")[-1] if "." in filename else "bin"
        unique_id = str(uuid.uuid4())
        year = datetime.now().year
        return f"{folder}/{year}/{unique_id}.{ext}"

    async def upload_file(self, file: UploadFile, folder: str = "gallery") -> str:
        """Validate and upload file to Supabase Storage."""
        await self.validate_file(file)
        storage_path = self.generate_storage_path(file.filename, folder)
        
        contents = await file.read()
        try:
            res = self.client.storage.from_(self.bucket_name).upload(
                file=contents,
                path=storage_path,
                file_options={"content-type": file.content_type}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file to storage: {str(e)}"
            )
            
        return storage_path

    async def delete_file(self, storage_path: str) -> bool:
        """Delete a file from Supabase Storage."""
        try:
            res = self.client.storage.from_(self.bucket_name).remove([storage_path])
            return True
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete file from storage: {str(e)}"
            )

    def get_public_url(self, storage_path: str) -> str:
        """Get the public URL for a file in Supabase Storage."""
        res = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
        return res

storage_service = StorageService()
