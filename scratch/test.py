import asyncio
import aiohttp
import time

async def fetch(session, url):
    try:
        async with session.get(url) as response:
            return response.status
    except Exception as e:
        return str(e)

async def main():
    url = "http://127.0.0.1:8000/api/v1/dashboard"
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for _ in range(50)]
        start = time.time()
        results = await asyncio.gather(*tasks)
        end = time.time()
        
        counts = {}
        for r in results:
            counts[r] = counts.get(r, 0) + 1
            
        print(f"Time: {end - start:.2f}s")
        print(f"Results: {counts}")

if __name__ == "__main__":
    asyncio.run(main())
