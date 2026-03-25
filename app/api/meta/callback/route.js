export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');
const { syncMetaAds } = require('@/lib/meta');

const META_APP_ID = process.env.META_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return new Response(`Erro OAuth: ${error || 'sem code'}`, { status: 400 });
  }

  try {
    const baseUrl = getSetting('base_url') || BASE_URL;
    const redirectUri = encodeURIComponent(`${baseUrl}/api/meta/callback`);
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&client_secret=${META_APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: 'Falha ao obter access_token', detail: tokenData }, { status: 400 });
    }

    const acctRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${tokenData.access_token}`);
    const acctData = await acctRes.json();
    const firstAccount = acctData?.data?.[0];

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    db.prepare('DELETE FROM meta_tokens').run();
    db.prepare(`
      INSERT INTO meta_tokens (access_token, ad_account_id, expires_at)
      VALUES (?, ?, ?)
    `).run(tokenData.access_token, firstAccount?.id || null, expiresAt);

    syncMetaAds();

    return new Response(`
      <html><body style="font-family:sans-serif;background:#0f1117;color:#fff;padding:2rem">
        <h2>Meta Ads conectado!</h2>
        <p>Conta: <strong>${firstAccount?.name || firstAccount?.id || 'desconhecida'}</strong></p>
        <p><a href="/" style="color:#6366f1">Voltar ao dashboard</a></p>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
