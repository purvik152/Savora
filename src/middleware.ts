
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/recipes/(.*)',
    '/community/(.*)',
    '/mood-kitchen',
    '/chef-challenge',
    '/news',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/icon', // Allow icon route
]);

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/meal-planner',
    '/submit-recipe',
    '/user-profile(.*)',
    '/admin(.*)'
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
