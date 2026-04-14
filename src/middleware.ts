import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPrefixes = [
  '/api/portfolio',
  '/api/prices',
  '/api/transactions',
  '/api/wishlist',
  '/api/alerts',
  '/api/users/me',
];

const publicPrefixes = [
  '/api/auth',
  '/api/users/',
  '/api/portfolio/shares/',
  '/api/portfolio/compare',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicApi = publicPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (isPublicApi) {
    return NextResponse.next();
  }

  const isProtectedApi = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isProtectedApi) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.set('x-user-id', token.sub as string);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ['/api/:path*'],
};
