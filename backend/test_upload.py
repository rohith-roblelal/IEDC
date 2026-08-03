import asyncio
from app.services.storage import storage_service
from fastapi import UploadFile
import io

class MockFile:
    def __init__(self, filename, content):
        self.filename = filename
        self.content_type = "image/png"
        self.file = io.BytesIO(content)

    async def read(self):
        self.file.seek(0)
        return self.file.read()

async def main():
    try:
        f = MockFile("test.png", b"dummydata")
        path = await storage_service.upload_file(f, "test_folder")
        print("Uploaded to:", path)
        url = storage_service.get_public_url(path)
        print("URL:", url)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
