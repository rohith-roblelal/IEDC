# IEDC SNMIMT Website – Production System Architecture

## High-Level Architecture

```text
                                        ┌─────────────────────────────┐
                                        │          Internet           │
                                        └──────────────┬──────────────┘
                                                       │
                                                 HTTPS/TLS
                                                       │
                 ┌─────────────────────────────────────┴─────────────────────────────────────┐
                 │                                                                           │
                 ▼                                                                           ▼
      ┌─────────────────────────┐                                             ┌─────────────────────────┐
      │     Public Visitors     │                                             │     Super Admin        │
      │ Students / Startups     │                                             │ Dashboard Access       │
      └─────────────┬───────────┘                                             └─────────────┬──────────┘
                    │                                                                   │
                    └───────────────────────────────┬───────────────────────────────────┘
                                                    │
                                                    ▼
                         ┌──────────────────────────────────────────────────────┐
                         │          Next.js 15 Frontend (Vercel)                │
                         │──────────────────────────────────────────────────────│
                         │ Public Website                                       │
                         │ • Home                                               │
                         │ • About                                              │
                         │ • Events                                             │
                         │ • Announcements                                      │
                         │ • Gallery                                            │
                         │ • Startups                                           │
                         │ • Team                                               │
                         │ • Contact                                            │
                         │                                                      │
                         │ Admin Dashboard                                      │
                         │ • Event Management                                   │
                         │ • Announcement Management                            │
                         │ • Gallery Management                                 │
                         │ • Startup Management                                 │
                         │ • Team Management                                    │
                         │ • Website Settings                                   │
                         │ • Contact Inbox                                      │
                         │                                                      │
                         │ Technologies                                         │
                         │ • React                                              │
                         │ • App Router                                         │
                         │ • React Hook Form                                    │
                         │ • Zod                                                │
                         │ • Tailwind CSS                                       │
                         │ • clientFetch/serverFetch                            │
                         └──────────────────────┬───────────────────────────────┘
                                                │
                             REST API (credentials: include)
                                                │
                                                ▼
                ┌──────────────────────────────────────────────────────────────┐
                │                 FastAPI Backend                              │
                │──────────────────────────────────────────────────────────────│
                │ Authentication                                               │
                │ • Login                                                      │
                │ • Logout                                                     │
                │ • Password Reset                                             │
                │ • /auth/me                                                   │
                │                                                              │
                │ Authorization                                                │
                │ • JWT Verification                                           │
                │ • HttpOnly Cookie                                            │
                │ • Super Admin Guard                                          │
                │ • Token Blocklist                                            │
                │                                                              │
                │ Business Modules                                             │
                │ • Events                                                     │
                │ • Announcements                                              │
                │ • Gallery                                                    │
                │ • Startups                                                   │
                │ • Team                                                       │
                │ • Website Settings                                           │
                │ • Contact                                                    │
                │                                                              │
                │ Services                                                     │
                │ • StorageService                                             │
                │ • EmailService                                               │
                │ • AuditLogService                                            │
                │ • SlugService                                                │
                │                                                              │
                │ Repository Layer                                             │
                │ • SQLAlchemy                                                 │
                │ • Pydantic v2                                                │
                └──────────────┬───────────────────────────────┬───────────────┘
                               │                               │
                               │                               │
                               ▼                               ▼
              ┌──────────────────────────┐      ┌─────────────────────────────┐
              │     Neon PostgreSQL      │      │     Supabase Storage        │
              │──────────────────────────│      │─────────────────────────────│
              │ Users                    │      │ settings/                   │
              │ Events                   │      │ events/                     │
              │ Registrations            │      │ announcements/              │
              │ Announcements            │      │ gallery/                    │
              │ Gallery                  │      │ startups/                   │
              │ Startups                 │      │ team/                       │
              │ Team Members             │      │ logos/                      │
              │ Contact Messages         │      │ hero/                       │
              │ Website Settings         │      │                             │
              │ Audit Logs               │      │ Images & Documents          │
              │ Token Blocklist          │      └─────────────────────────────┘
              └──────────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────────────────┐
                  │      External Integrations          │
                  │─────────────────────────────────────│
                  │ SMTP / Resend                       │
                  │ GitHub Actions CI/CD                │
                  │ Vercel Deployment                   │
                  │ Logging & Monitoring                │
                  │ Database Backups                    │
                  └─────────────────────────────────────┘