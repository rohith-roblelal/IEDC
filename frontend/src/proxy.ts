import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the secret key used by the backend. Ensure this matches SECRET_KEY in the backend.
// In a real app, this should be set in frontend/.env.local
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "supersecretproductionkey123456789" // Fallback to match backend
);

export async function proxy(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const token = tokenCookie?.value;

  // If there is a token and they visit login, redirect to dashboard
  if (token && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // We only want to protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // 1. Check if token exists
    if (!tokenCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // The token is stored as "Bearer <token>" but might be URL encoded as "Bearer%20<token>" or enclosed in quotes
      let tokenValue = decodeURIComponent(tokenCookie.value);
      
      // Aggressively remove any leading/trailing quotes
      tokenValue = tokenValue.replace(/^"+|"+$/g, '');
      // Remove the Bearer prefix
      tokenValue = tokenValue.replace(/^Bearer\s+/i, '');

      // 2. Decode and verify the JWT signature using jose
      const { payload } = await jwtVerify(tokenValue, SECRET_KEY, {
        algorithms: ['HS256'],
      });

      // 3. Verify the role is SUPER_ADMIN
      if (payload.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/403', request.url));
      }

      // If valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // 4. Token is invalid or expired
      console.warn("Proxy JWT validation failed:", error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
