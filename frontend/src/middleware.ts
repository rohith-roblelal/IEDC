import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const hasToken = request.cookies.has('access_token');
    
    // If no token exists, redirect to login page immediately
    if (!hasToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  // Apply middleware only to dashboard routes
  matcher: ['/dashboard/:path*'],
};
