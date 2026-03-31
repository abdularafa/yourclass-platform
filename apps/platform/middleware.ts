import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.pathname;

  const customDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourclass.com';

  let tenantSlug: string | null = null;
  let isTenantRequest = false;
  let isAdminRequest = url.startsWith('/admin');
  let isApiRequest = url.startsWith('/api');

  if (hostname.includes(customDomain)) {
    const subdomain = hostname.split('.')[0];

    if (subdomain !== hostname && subdomain !== 'www' && subdomain !== 'app') {
      tenantSlug = subdomain;
      isTenantRequest = true;
    }
  }

  const response = NextResponse.next();

  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
    response.headers.set('x-is-tenant', 'true');
  } else if (isAdminRequest) {
    response.headers.set('x-is-admin', 'true');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
