import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware - Tenant-aware routing and authentication
 *
 * Responsibilities:
 * 1. Enforce authentication on protected routes
 * 2. Inject tenant context into requests
 * 3. Role-based access control (RBAC)
 * 4. Admin route protection
 */

const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  // Temporary for testing
  '/templates',
  '/plans',
  '/policies',
  '/governance-framework',
  '/api/plan-templates',
  '/api/plans',
  '/api/policies',
  '/api/governance-framework',
  '/api/ai/agents',
];

const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token.role !== 'SUPER_ADMIN') {
      // Forbidden - redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Inject tenant context into request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', token.tenantId as string);
  requestHeaders.set('x-tenant-slug', token.tenantSlug as string);
  requestHeaders.set('x-user-id', token.userId as string);
  requestHeaders.set('x-user-role', token.role as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
