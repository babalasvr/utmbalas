export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'utmbalas123';
const COOKIE_NAME = 'utmbalas_auth';

export async function POST(request) {
  const { password } = await request.json();

  if (password !== DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, DASHBOARD_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('utmbalas_auth');
  return response;
}
