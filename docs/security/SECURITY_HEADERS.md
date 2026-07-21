# Security Headers

## Backend (FastAPI)
- A custom `SecurityHeadersMiddleware` injects the following headers into every response:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (Enforces HTTPS).
  - `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing).
  - `X-Frame-Options: DENY` (Prevents clickjacking).
  - `X-XSS-Protection: 1; mode=block` (Legacy XSS filter enablement).

## Frontend (Next.js)
- `next.config.ts` injects headers including:
  - `Content-Security-Policy` (CSP): Mitigates XSS by restricting resource origins.
  - `Permissions-Policy`: Restricts browser features (camera, microphone) from being abused.
  - `Referrer-Policy`: Protects sensitive URL data from leaking to third parties.
