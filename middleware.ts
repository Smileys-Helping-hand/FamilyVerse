import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// 🔒 THE IRON GATE - Military-Grade Admin Security
// =============================================================================
// Only mraaziqp@gmail.com gets the key. Everyone else gets the boot.
// =============================================================================

const ALLOWED_ADMIN = 'mraaziqp@gmail.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Get the Firebase auth cookie (set by client-side auth)
    const authCookie = request.cookies.get('firebase-auth-email');
    const currentUserEmail = authCookie?.value;

    if (currentUserEmail !== ALLOWED_ADMIN) {
      // Log the unauthorized attempt
      console.warn(`🚨 IRON GATE: Unauthorized Admin Access Attempt by: ${currentUserEmail || 'Anonymous'}`);
      console.warn(`   Attempted path: ${pathname}`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
      
      // Redirect to Access Denied page
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }

    console.log(`✅ IRON GATE: Access granted to ${currentUserEmail} for ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
