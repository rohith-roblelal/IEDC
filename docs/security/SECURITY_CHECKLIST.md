# Pre-Deployment Security Checklist

- [ ] All environment variables are secured and not committed to source control.
- [ ] Next.js CSP headers are correctly configured and not breaking assets.
- [ ] FastAPI CORS is restricted to production domains.
- [ ] Rate limiting is active on all API endpoints.
- [x] Supabase RLS is enabled on all tables and storage buckets.
- [ ] Admin endpoints are protected by RBAC middleware.
- [ ] Docker images use specific version tags (no `latest`).
