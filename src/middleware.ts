import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define public routes
    const isPublicRoute =
        pathname === '/login' ||
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/setup') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico';

    if (isPublicRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // For API routes, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // For pages, redirect to login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify the token
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware JWT Verification Error:', error);

        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (e.g. svg, png, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
