import asyncio
import httpx
import uuid
import os
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def run_regression():
    print("Starting Authentication Regression Check on LIVE server...")
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Login
        print("\n--- 1. Login ---")
        login_resp = await client.post("/auth/login", data={"username": "admin@test.com", "password": "testpassword123"})
        if login_resp.status_code == 200:
            print("✅ Login successful with valid credentials.")
            cookies = login_resp.cookies
            print(f"✅ Cookies set: {list(cookies.keys())}")
        else:
            print(f"❌ Login failed: {login_resp.status_code} - {login_resp.text}")

        login_fail = await client.post("/auth/login", data={"username": "admin@test.com", "password": "wrong"})
        if login_fail.status_code == 400:
            print("✅ Invalid password correctly rejected.")
            
        # 2. Security Headers
        print("\n--- 2. Security Headers ---")
        headers = login_resp.headers
        for h in ["content-security-policy", "x-frame-options", "x-content-type-options"]:
            if h in headers:
                print(f"✅ {h} is present.")
            else:
                print(f"❌ {h} is MISSING.")
                
        # 3. Forgot Password
        print("\n--- 3. Forgot Password ---")
        forgot_resp = await client.post("/auth/forgot-password", json={"email": "admin@test.com"})
        if forgot_resp.status_code == 200:
            print("✅ Forgot password request succeeded.")
        else:
            print(f"❌ Forgot password failed: {forgot_resp.status_code} - {forgot_resp.text}")
            
        forgot_resp_fake = await client.post("/auth/forgot-password", json={"email": "fake@fake.com"})
        if forgot_resp_fake.status_code == 200 and forgot_resp_fake.json() == forgot_resp.json():
            print("✅ Unknown email returns generic response.")
            
        # 4. Logout
        print("\n--- 4. Logout ---")
        logout_resp = await client.post("/auth/logout")
        if logout_resp.status_code == 200:
            print("✅ Logout successful.")
            print(f"✅ Cookies after logout: {list(logout_resp.cookies.keys())}")
        
        # 5. Authorization (after logout)
        print("\n--- 5. Authorization ---")
        users_resp = await client.get("/users")
        if users_resp.status_code in [401, 403]:
            print("✅ Protected route rejected after logout.")
        else:
            print(f"❌ Protected route accessible after logout! {users_resp.status_code}")

if __name__ == "__main__":
    asyncio.run(run_regression())
