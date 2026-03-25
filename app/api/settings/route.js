export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');
const { getMetaToken } = require('@/lib/meta');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export async function GET() {
  const keys = ['profile_name', 'profile_email', 'profile_business', 'webhook_token', 'base_url'];
  const result = {};
  for (const k of keys) result[k] = getSetting(k);

  if (!result.webhook_token && WEBHOOK_SECRET) {
    setSetting('webhook_token', WEBHOOK_SECRET);
    result.webhook_token = WEBHOOK_SECRET;
  }
  if (!result.base_url && BASE_URL) {
    setSetting('base_url', BASE_URL);
    result.base_url = BASE_URL;
  }

  const metaToken = getMetaToken();
  result.meta_connected = !!metaToken?.access_token;
  result.meta_account_id = metaToken?.ad_account_id || null;

  return NextResponse.json(result);
}

export async function POST(request) {
  const body = await request.json();
  const allowed = ['profile_name', 'profile_email', 'profile_business', 'webhook_token', 'base_url'];
  for (const key of allowed) {
    if (body[key] !== undefined) setSetting(key, body[key]);
  }
  return NextResponse.json({ ok: true });
}
