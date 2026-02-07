import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// 🔒 THE IRON GATE - Military-Grade Admin Security
// =============================================================================
// Add admins via ADMIN_EMAILS env var (comma-separated)
// Default: mraaziqp@gmail.com
// Example: ADMIN_EMAILS=mraaziqp@gmail.com,uncle@family.com,sister@family.com
// =============================================================================

function getAllowedAdmins(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL;
  if (envAdmins) {
    return envAdmins.split(',').map(email => email.trim().toLowerCase());
  }
  return ['mraaziqp@gmail.com'];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Get the Firebase auth cookie (set by client-side auth)
    const authCookie = request.cookies.get('firebase-auth-email');
    const currentUserEmail = authCookie?.value?.toLowerCase();
    const allowedAdmins = getAllowedAdmins();

    if (!currentUserEmail || !allowedAdmins.includes(currentUserEmail)) {
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
