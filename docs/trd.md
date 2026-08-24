
# Technical Requirements Document (TRD)

## 1. Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Styling & Animations**: Tailwind CSS, Framer Motion.
- **Backend/Storage**: FastAPI (Python), PostgreSQL (Neon Serverless), Redis (Upstash) for rate limiting, Supabase for object storage.
- **Hosting**: Vercel (Frontend), Render/Railway (Backend).

## 2. Architecture
- **Single-Page Application (SPA) / Server-Side Rendering (SSR)**:
  - The application is built using Next.js App Router for optimal performance, routing, and SEO.
  - Reusable React components for UI consistency.
- **Backend API**:
  - RESTful architecture using FastAPI, SQLAlchemy 2.0 (async), and Pydantic validation.
  - JWT HttpOnly cookies for secure authentication.

## 3. Data Models
- **Events**: Managed via PostgreSQL, full CRUD via Dashboard.
- **Registrations**: Stored in PostgreSQL, securely managed via Backend API.
- **Startups & Gallery**: Full content management with Supabase Storage integrations.

## 4. Security & Validation
- Zod schema validation on frontend; Pydantic validation on backend.
- Cloudflare Turnstile integration for bot protection.
- SlowAPI for rate limiting.
- Secure HttpOnly cookies for session management.
