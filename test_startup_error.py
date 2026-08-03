import asyncio
import json
import httpx

async def main():
    payload = {
        "name": "Ecocee 2",
        "slug": "ecocee-2",
        "tagline": "",
        "short_description": "thederhdbethrhdtbfbb",
        "full_description": "<p>some desc</p>",
        "stage": "IDEA",
        "status": "ACTIVE",
        "industry": "tech",
        "founded_year": 2025,
        "website_url": "",
        "email": "rohithroblelal9c@gmail.com",
        "phone": "",
        "linkedin_url": "",
        "is_published": False,
        "is_featured": False,
        "verification_status": "PENDING",
        "display_order": 0,
        "founders": [
            {
                "name": "John",
                "role": "",
                "department": "",
                "is_alumni": False,
                "graduation_year": None,
                "linkedin_url": ""
            }
        ],
        "awards": [],
        "funding": [],
        "press_links": [],
        "technology_ids": [],
    }
    async with httpx.AsyncClient() as client:
        # Get token first
        # For this test, maybe we need an admin token. I'll login as admin
        r = await client.post("http://localhost:8000/api/v1/auth/login", data={"username": "iedcsnmimt@gmail.com", "password": "iedcsnmimt@2026"})
        print(r.status_code, r.text)
        
        r2 = await client.post("http://localhost:8000/api/v1/startups", json=payload, cookies=r.cookies)
        print("Status:", r2.status_code)
        print("Response:", r2.text)

if __name__ == "__main__":
    asyncio.run(main())
