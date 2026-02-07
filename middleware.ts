import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The Iron Dome: Admin routes are protected client-side via Firebase auth
// Middleware allows all /admin routes through; client-side AuthGuard enforces access
export async function middleware(request: NextRequest) {
  // All requests pass through; admin auth is enforced client-side
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
