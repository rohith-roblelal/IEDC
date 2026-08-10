import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// JWT_SECRET_KEY must be set in .env.local (development) or as a deployment environment variable (production).
// It MUST match the SECRET_KEY used by the backend to sign tokens.
// Never commit this value to source control.
if (!process.env.JWT_SECRET_KEY) {
  throw new Error(
    "FATAL: JWT_SECRET_KEY environment variable is not set. " +
    "Set it to match the backend SECRET_KEY. Do not use a fallback in production."
  );
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);


export async function proxy(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const token = tokenCookie?.value;

  let isValid = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY, {
        algorithms: ['HS256'],
      });
      if (payload.role === 'SUPER_ADMIN') {
        isValid = true;
      }
    } catch (error) {
      console.warn("Proxy JWT validation failed:", error);
    }
  }

  // If they visit login and have a valid token, redirect to dashboard
  if (isValid && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (request.nextUrl.pathname === '/login') {
    // If the token was invalid, clear it so the browser isn't stuck with a bad cookie
    const response = NextResponse.next();
    if (token && !isValid) {
      response.cookies.delete('access_token');
    }
    return response;
  }

  // We only want to protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isValid) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
