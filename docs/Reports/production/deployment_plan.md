# Deployment Plan

## 1. Environment Setup
1. **Provision Infrastructure:** Choose a hosting provider for the Frontend (e.g., Vercel, AWS Amplify) and Backend (e.g., Render, AWS EC2, DigitalOcean).
2. **Configure Database:** Ensure the Neon PostgreSQL instance is active and accessible.
3. **Environment Variables:**
   - Add `.env` secrets to the Backend environment (generate a new 32-byte `SECRET_KEY`).
   - Add `NEXT_PUBLIC_API_URL` to the Frontend environment pointing to the Backend URL.
   - Update `FRONTEND_URLS` in the Backend to match the Frontend domain.

## 2. Backend Deployment (FastAPI)
*For a full cloud deployment (Docker, Caddy, CI/CD), please refer to `docs/CLOUD_DEPLOYMENT.md`.*

**Bare-metal Alternative:**
1. Ensure Python 3.10+ is installed.
2. Install dependencies: `pip install -r requirements.txt`
3. Execute Database Migrations: `alembic upgrade head`
4. Start the Application using Uvicorn (without `--reload`):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

## 3. Frontend Deployment (Next.js)
1. Ensure Node.js 18+ is installed.
2. Install dependencies: `npm ci`
3. Build the application: `npm run build`
4. Start the application: `npm start`
*(Note: If deploying on Vercel, steps 2-4 are handled automatically).*

## 4. Post-Deployment Verification (Smoke Tests)
1. **Health Check:** Visit the Backend URL (`/api/v1/health` or `/docs`) to verify it's running.
2. **Frontend Load:** Visit the Public Website domain and ensure the Home page loads without errors.
3. **Admin Login:** Attempt to log into the Admin Dashboard using the Super Admin credentials.
4. **Image Upload:** Upload a test image in the Gallery to verify Supabase storage permissions.
