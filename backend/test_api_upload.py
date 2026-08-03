import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as c:
        r = await c.post('http://127.0.0.1:8000/api/v1/auth/login', data={'username':'iedcsnmimt@gmail.com', 'password':'password'})
        cookie = r.json().get('access_token')
        
        # Valid PNG magic bytes + some dummy data
        file_content = b'\x89PNG\r\n\x1a\n' + b'dummy' * 100
        
        res = await c.post(
            'http://127.0.0.1:8000/api/v1/upload', 
            files={'file': ('test.png', file_content, 'image/png')}, 
            data={'folder':'gallery'}
        )
        print("Status code:", res.status_code)
        print("Response:", res.text)

if __name__ == "__main__":
    asyncio.run(main())
