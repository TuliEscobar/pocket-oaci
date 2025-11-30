import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'es'],
    defaultLocale: 'es'
});

const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
    // NOTE: Removed auth.protect() from /api/chat to allow free queries without sign-in
    // Rate limiting and user verification is handled inside the route handler itself

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
