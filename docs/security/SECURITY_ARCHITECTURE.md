# Security Architecture

## Overview
The IEDC platform employs a multi-tiered security architecture:
1. **Frontend (Next.js)**: Enforces CSP, HSTS, and X-Frame-Options. Uses React to prevent XSS. Communicates with backend via HTTPS.
2. **Backend (FastAPI)**: Enforces rate limiting (`slowapi`), validates input via Pydantic, and manages JWT-based authentication.
3. **Database (Supabase)**: Secured via Row Level Security (RLS) policies. Only authenticated users can access specific data.
4. **Infrastructure**: Containerized via Docker, deployed with restricted network policies.
