export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const tokenRow = db.prepare('SELECT * FROM meta_tokens ORDER BY id DESC LIMIT 1').get();
    if (!tokenRow?.access_token) {
      return NextResponse.json({ error: 'Meta não conectado' }, { status: 400 });
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&limit=50&access_token=${tokenRow.access_token}`
    );
    const data = await res.json();

    return NextResponse.json({
      accounts: data.data || [],
      current: tokenRow.ad_account_id,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { account_id } = await request.json();
    if (!account_id) return NextResponse.json({ error: 'account_id obrigatório' }, { status: 400 });

    db.prepare('UPDATE meta_tokens SET ad_account_id = ? WHERE id = (SELECT id FROM meta_tokens ORDER BY id DESC LIMIT 1)')
      .run(account_id);

    const { syncMetaAds } = require('@/lib/meta');
    syncMetaAds();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
