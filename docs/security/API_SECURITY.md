# API Security

## Input Validation
- All inputs are validated strictly using Pydantic models.
- Maximum lengths and types (e.g., `EmailStr`) are enforced to prevent buffer overloads and logic errors.

## Rate Limiting
- The `slowapi` dependency enforces rate limits.
- Default limit is 100 requests per minute per IP address.
- 429 Too Many Requests is returned if exceeded.

## CORS Configuration
- CORS is managed via `CORSMiddleware`.
- Allow origins are strictly defined by the `BACKEND_CORS_ORIGINS` environment variable (no wildcard `*` in production).
