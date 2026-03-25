export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');

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

    // Buscar TODAS as contas de anúncios disponíveis
    const acctRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&limit=50&access_token=${tokenData.access_token}`);
    const acctData = await acctRes.json();
    const accounts = acctData?.data || [];

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Salva o token sem conta ainda — usuário vai escolher
    db.prepare('DELETE FROM meta_tokens').run();
    db.prepare(`INSERT INTO meta_tokens (access_token, ad_account_id, expires_at) VALUES (?, ?, ?)`)
      .run(tokenData.access_token, null, expiresAt);

    const tokenId = db.prepare('SELECT id FROM meta_tokens ORDER BY id DESC LIMIT 1').get().id;

    // Monta cards de seleção de conta
    const cards = accounts.map(a => `
      <form method="POST" action="/api/meta/select-account" style="margin:0">
        <input type="hidden" name="account_id" value="${a.id}" />
        <input type="hidden" name="token_id" value="${tokenId}" />
        <button type="submit" style="
          width:100%; text-align:left; padding:14px 18px; margin-bottom:10px;
          background:#1e2130; border:1px solid #2a2d3e; border-radius:10px;
          color:#e2e8f0; cursor:pointer; font-size:14px; transition:border-color .2s;
        " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#2a2d3e'">
          <div style="font-weight:700;margin-bottom:4px">${a.name}</div>
          <div style="font-size:12px;color:#8892a4">${a.id}</div>
        </button>
      </form>
    `).join('');

    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"><title>Selecionar Conta — UTMBalas</title></head>
      <body style="font-family:-apple-system,sans-serif;background:#0f1117;color:#e2e8f0;padding:0;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center">
        <div style="width:100%;max-width:480px;padding:32px">
          <div style="font-size:20px;font-weight:700;margin-bottom:6px">UTM<span style="color:#6366f1">Balas</span></div>
          <h2 style="font-size:17px;font-weight:600;margin:0 0 6px">Selecione a conta de anúncios</h2>
          <p style="font-size:13px;color:#8892a4;margin:0 0 24px">${accounts.length} conta(s) encontrada(s)</p>
          ${accounts.length === 0
            ? '<p style="color:#ef4444">Nenhuma conta de anúncios encontrada nesse perfil.</p>'
            : cards
          }
          <a href="/" style="display:block;text-align:center;margin-top:16px;font-size:13px;color:#8892a4;text-decoration:none">Cancelar e voltar ao dashboard</a>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
