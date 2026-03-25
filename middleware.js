import { NextResponse } from 'next/server';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'utmbalas123';
const COOKIE_NAME = 'utmbalas_auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Webhooks e callbacks do Meta nunca precisam de auth
  if (
    pathname.startsWith('/webhook/') ||
    pathname.startsWith('/api/webhook/') ||
    pathname.startsWith('/api/meta/callback') ||
    pathname.startsWith('/api/meta/auth') ||
    pathname.startsWith('/api/meta/select-account') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Verifica cookie de autenticação
  const auth = request.cookies.get(COOKIE_NAME);
  if (auth?.value === DASHBOARD_PASSWORD) {
    return NextResponse.next();
  }

  // Redireciona para login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
