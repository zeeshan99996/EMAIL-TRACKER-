import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const searchParams = request.nextUrl.searchParams;

  // If user explicitly navigated back to the website from the dashboard, allow it!
  if (searchParams.get('view') === 'landing' || searchParams.get('portal') === 'true') {
    return NextResponse.next();
  }

  // Returning user check for landing page ("/")
  if (pathname === '/') {
    const sessionCookie = request.cookies.get('warmup_user_session')?.value;
    const submittedCookie = request.cookies.get('mailify_has_submitted')?.value;

    if (sessionCookie || submittedCookie) {
      // Returning user: redirect directly to dashboard without loading landing page
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
