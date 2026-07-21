# Database Security (Supabase)

## Row Level Security (RLS)
- All tables must have RLS enabled.
- Access policies must be strictly bound to `auth.uid()`.
- Refer to `SUPABASE_RLS_GUIDE.md` for standard templates.

## Connection Security
- The FastAPI backend connects to Supabase via SQLAlchemy async driver over TLS (SSL mode required in production).
- Database credentials are injected via environment variables.

## Backups
- Supabase provides automated daily backups. Point-in-time recovery (PITR) should be enabled for production databases.
