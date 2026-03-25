import { NextResponse } from 'next/server';
const db = require('@/lib/db');

const META_APP_ID = process.env.META_APP_ID || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

export async function GET() {
  if (!META_APP_ID) {
    return new Response('META_APP_ID não configurado no .env', { status: 400 });
  }
  const baseUrl = getSetting('base_url') || BASE_URL;
  const redirectUri = encodeURIComponent(`${baseUrl}/api/meta/callback`);
  const scope = encodeURIComponent('ads_read,ads_management');
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  return NextResponse.redirect(url);
}
