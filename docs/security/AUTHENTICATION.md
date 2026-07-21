# Authentication Security

## JWT Handling
- Access tokens are issued upon successful login at `/api/v1/auth/login`.
- Tokens are returned in the JSON response *and* set as an `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`access_token`).
- The backend dependency `OAuth2PasswordBearerWithCookie` checks the `Authorization` header first, falling back to the secure cookie.

## Password Security
- Passwords are hashed using `bcrypt` via `passlib`.
- Salts are automatically handled by `passlib`.
