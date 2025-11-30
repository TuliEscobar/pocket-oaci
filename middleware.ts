import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'es'],
    defaultLocale: 'es'
});

const isProtectedRoute = createRouteMatcher(['/api/chat(.*)']);
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
    // Protect API routes with Clerk
    if (isProtectedRoute(req)) await auth.protect();

    // Skip intl middleware for API routes
    if (isApiRoute(req)) {
        return;
    }

    // Apply intl middleware only to non-API routes
    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Match root path explicitly
        '/',
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
