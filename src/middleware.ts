
// This is a placeholder middleware file.
// You can use it to implement your own authentication or routing logic.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Example: Redirect to a different page
  // if (request.nextUrl.pathname.startsWith('/about')) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
