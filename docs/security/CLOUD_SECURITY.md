# Cloud Security

## Supabase Storage
- Buckets must not be publicly writable.
- Enforce strict bucket policies restricting uploads to authenticated users (and admins for specific buckets like `IEDC gallary`).
- Service Role Keys must *never* be exposed to the client or embedded in the Next.js frontend (`NEXT_PUBLIC_*`). They are strictly backend-only.

## API Keys
- Anon keys are safe for the frontend but must be restricted by RLS on the Supabase side.
- No wildcard CORS is allowed on the Supabase API layer in production; restrict it to the application's domain.
