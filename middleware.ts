import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// The Iron Dome: Maximum Security for Admin Routes
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unauthenticated access to the login page itself
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.email !== (process.env.ADMIN_EMAIL || 'mraaziqp@gmail.com')) {
      console.log(`🚨 UNAUTHORIZED ADMIN ACCESS ATTEMPT: ${token?.email || 'No session'} tried to access ${pathname}`);
      // Redirect to admin login instead of home
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    console.log(`✅ ADMIN ACCESS GRANTED: ${token.email} accessing ${pathname}`);
  }

  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: ['/admin/:path*'],
};
