import uuid
import filetype
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile, HTTPException, status
from app.core.supabase import supabase_client
from app.core.config import settings
import structlog

storage_logger = structlog.get_logger("storage")

class StorageService:
    def __init__(self, bucket_name: str = settings.SUPABASE_BUCKET):
        self.bucket_name = bucket_name
        self.client = supabase_client

    async def validate_file(self, file: UploadFile, max_size_mb: int = 5, allowed_types: List[str] = None) -> bool:
        """Validate file size and MIME type (including Magic Bytes)."""
        if allowed_types is None:
            allowed_types = [
                "image/jpeg", "image/png", "image/webp", 
                "image/gif", "image/svg+xml", "image/x-icon", 
                "image/vnd.microsoft.icon", "image/ico", "application/octet-stream"
            ]
            
        # 1. Basic client content-type check
        if not (file.content_type in allowed_types or file.content_type.startswith("image/")):
            storage_logger.warning("upload_rejected", reason="invalid_content_type", content_type=file.content_type)
            print(f"Rejected file upload. Content-Type: {file.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Allowed types: {', '.join(allowed_types)}"
            )
            
        # 2. Check maximum file size
        file.file.seek(0, 2)
        size_bytes = file.file.tell()
        file.file.seek(0)
        
        max_bytes = max_size_mb * 1024 * 1024
        if size_bytes > max_bytes:
            storage_logger.warning("upload_rejected", reason="file_too_large", size_bytes=size_bytes)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {max_size_mb}MB"
            )
            
        # 3. Read first 2KB to verify magic bytes
        chunk = await file.read(2048)
        kind = filetype.guess(chunk)
        mime = kind.mime if kind else None
        
        if mime:
            if not (mime in allowed_types or mime.startswith("image/")):
                storage_logger.warning("upload_rejected", reason="malicious_magic_bytes", detected_mime=mime)
                raise HTTPException(status_code=400, detail=f"Malicious file type detected: {mime}")
        elif file.content_type == "image/svg+xml" and "image/svg+xml" in allowed_types:
            # SVG is XML text, filetype doesn't reliably guess it.
            pass
        elif "application/octet-stream" in allowed_types:
            pass
        else:
            storage_logger.warning("upload_rejected", reason="missing_magic_bytes", content_type=file.content_type)
            raise HTTPException(status_code=400, detail="Could not verify file signature (Magic Bytes).")
        
        # 4. Reset stream
        await file.seek(0)
        
        return True

    def generate_storage_path(self, filename: str, folder: str = "gallery") -> str:
        """Generate a unique storage path for the file."""
        ext = filename.split(".")[-1] if "." in filename else "bin"
        unique_id = str(uuid.uuid4())
        year = datetime.now().year
        return f"{folder}/{year}/{unique_id}.{ext}"

    async def upload_file(self, file: UploadFile, folder: str = "gallery") -> str:
        """Validate and upload file to Supabase Storage."""
        storage_logger.info("upload_started", filename=file.filename, folder=folder, content_type=file.content_type)
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
            storage_logger.error("upload_failed", filename=file.filename, folder=folder, error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file to storage: {str(e)}"
            )
            
        storage_logger.info("upload_completed", filename=file.filename, folder=folder, storage_path=storage_path)
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
