# IEDC SNMIMT Website — Production System Architecture

## High-Level Architecture

```text
                                           ┌──────────────────────────────┐
                                           │          Internet            │
                                           └──────────────┬───────────────┘
                                                          │
                                                     HTTPS / TLS
                                                          │
                                     CDN / Vercel Edge Network
                                                          │
                    ┌─────────────────────────────────────┴────────────────────────────────────┐
                    │                                                                          │
                    ▼                                                                          ▼
        ┌─────────────────────────┐                                              ┌─────────────────────────┐
        │     Public Visitors     │                                              │      Super Admin       │
        │ Students • Startups     │                                              │ Secure Dashboard       │
        └─────────────┬───────────┘                                              └─────────────┬──────────┘
                      │                                                                    │
                      └──────────────────────────────┬─────────────────────────────────────┘
                                                     │
                                                     ▼
                  ┌───────────────────────────────────────────────────────────────────────────┐
                  │               Next.js 15 Frontend (Vercel)                               │
                  │───────────────────────────────────────────────────────────────────────────│
                  │ Public Website                                                           │
                  │ • Home                                                                   │
                  │ • About                                                                  │
                  │ • Events                                                                  │
                  │ • Announcements                                                          │
                  │ • Gallery                                                                │
                  │ • Startups                                                               │
                  │ • Team                                                                   │
                  │ • Contact                                                                │
                  │                                                                          │
                  │ Admin Dashboard                                                          │
                  │ • Authentication                                                         │
                  │ • Events                                                                 │
                  │ • Gallery                                                                │
                  │ • Startups                                                               │
                  │ • Team                                                                   │
                  │ • Announcements                                                          │
                  │ • Website Settings                                                       │
                  │ • Contact Inbox                                                          │
                  │                                                                          │
                  │ Frontend Stack                                                           │
                  │ • React 19                                                               │
                  │ • Next.js 15 App Router                                                  │
                  │ • TypeScript                                                             │
                  │ • Tailwind CSS                                                           │
                  │ • React Hook Form + Zod                                                  │
                  │ • Server Components                                                      │
                  │ • Dynamic Imports                                                        │
                  │ • Next/Image                                                             │
                  └─────────────────────────────┬────────────────────────────────────────────┘
                                                │
                              Secure REST API (HTTPS + Credentials)
                                                │
                                                ▼
           ┌──────────────────────────────────────────────────────────────────────────────────────┐
           │                      FastAPI Backend (Production)                                   │
           │──────────────────────────────────────────────────────────────────────────────────────│
           │ Authentication                                                                       │
           │ • Login                                                                              │
           │ • Logout                                                                             │
           │ • Password Reset                                                                     │
           │ • /auth/me                                                                           │
           │                                                                                      │
           │ Authorization                                                                        │
           │ • JWT                                                                               │
           │ • HttpOnly Secure Cookies                                                           │
           │ • Role-Based Access Control                                                         │
           │ • Token Blocklist                                                                   │
           │                                                                                      │
           │ Core Modules                                                                        │
           │ • Events                                                                            │
           │ • Announcements                                                                     │
           │ • Gallery                                                                           │
           │ • Startups                                                                          │
           │ • Team                                                                              │
           │ • Website Settings                                                                  │
           │ • Contact                                                                           │
           │                                                                                      │
           │ Services                                                                            │
           │ • Storage Service                                                                   │
           │ • Audit Logging                                                                     │
           │ • Slug Generation                                                                   │
           │ • Image Processing                                                                  │
           │ • Background Jobs                                                                   │
           │                                                                                      │
           │ Infrastructure                                                                      │
           │ • SQLAlchemy                                                                        │
           │ • Pydantic v2                                                                       │
           │ • Alembic                                                                           │
           │ • ARQ Workers                                                                       │
           │ • Redis Cache                                                                       │
           │ • Rate Limiting                                                                     │
           │ • Structured Logging                                                                │
           │ • Prometheus Metrics                                                                │
           │ • OpenTelemetry                                                                     │
           │ • Sentry                                                                            │
           └──────────────────────┬──────────────────────┬──────────────────────┬──────────────┘
                                  │                      │                      │
                                  ▼                      ▼                      ▼
                ┌──────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────┐
                │    Neon PostgreSQL       │  │   Supabase Storage       │  │       Redis        │
                │──────────────────────────│  │──────────────────────────│  │────────────────────│
                │ Users                    │  │ settings/                │  │ Cache              │
                │ Events                   │  │ events/                  │  │ Rate Limiting      │
                │ Registrations            │  │ announcements/           │  │ Background Jobs    │
                │ Announcements            │  │ gallery/                 │  │ Session Data       │
                │ Gallery                  │  │ startups/                │  └────────────────────┘
                │ Startups                 │  │ team/                    │
                │ Team Members             │  │ logos/                   │
                │ Contact Messages         │  │ hero/                    │
                │ Website Settings         │  │ uploads/                 │
                │ Audit Logs               │  │ Images & Documents       │
                │ Token Blocklist          │  └──────────────────────────┘
                └──────────────┬───────────┘
                               │
                               ▼
          ┌─────────────────────────────────────────────────────────────────────────────┐
          │                 Monitoring & External Services                              │
          │─────────────────────────────────────────────────────────────────────────────│
          │ • Sentry Error Tracking                                                    │
          │ • Prometheus Metrics                                                       │
          │ • Grafana Dashboards                                                       │
          │ • OpenTelemetry Tracing                                                    │
          │ • GitHub Actions CI/CD                                                     │
          │ • Vercel Deployment                                                        │
          │ • Docker Deployment                                                        │
          │ • Database Backups                                                         │
          │ • Health Checks                                                            │
          └─────────────────────────────────────────────────────────────────────────────┘
```

---

# Security Architecture

- HTTPS/TLS enforced across all environments.
- JWT authentication using HttpOnly Secure Cookies.
- Role-Based Access Control (Super Admin).
- Password reset with secure one-time tokens.
- Token blocklist for logout and revocation.
- Rate limiting for authentication and sensitive endpoints.
- Content Security Policy (CSP).
- CORS validation.
- Secure file upload validation (Magic Bytes).
- Structured audit logging.
- Environment variable validation on startup.

---

# Data Layer

## PostgreSQL (Neon)

Stores:

- Users
- Events
- Event Registrations
- Announcements
- Gallery
- Startups
- Team Members
- Website Settings
- Contact Messages
- Audit Logs
- Token Blocklist

---

## Supabase Storage

Buckets include:

- settings/
- events/
- announcements/
- gallery/
- startups/
- team/
- logos/
- hero/
- uploads/

Stores optimized images and static assets.

---

## Redis

Used for:

- Distributed caching
- Rate limiting
- Background job queues
- Temporary application state

---

# Observability

The platform includes production-grade observability:

- Structured JSON logging
- Prometheus metrics
- Grafana dashboards
- Sentry error tracking
- OpenTelemetry distributed tracing
- Health check endpoints
- Performance monitoring

---

# Deployment Architecture

## Frontend

- Vercel
- Edge CDN
- Automatic deployments
- Image optimization

## Backend

- Docker container
- FastAPI + Uvicorn
- Reverse proxy (Caddy/Nginx)
- HTTPS
- Health probes

## Database

- Neon PostgreSQL
- Automated backups
- Alembic migrations

---

# Email & Communication

**Provider**

- Resend Email API

**Used For**

- Password reset emails
- System notifications (future)

**Contact Module**

Messages submitted through the Contact page are stored in PostgreSQL and reviewed through the Super Admin dashboard. Replies are handled externally using the administrator's email client.

---

# Performance Optimizations

- Server Components
- Dynamic Imports
- Code Splitting
- Next/Image Optimization
- WebP/AVIF Images
- Lazy Loading
- Static Asset Caching
- API Response Caching
- Redis Caching
- CDN Delivery
- Brotli/Gzip Compression

---

# Production Status

**Current Release:** Production Release Candidate

The platform has completed:

- Backend implementation
- Frontend implementation
- Security hardening
- Performance optimization
- Accessibility improvements
- SEO optimization
- Production observability
- Infrastructure validation

Remaining work is limited to final production verification, deployment, and release sign-off.