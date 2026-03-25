export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

function checkToken(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  return WEBHOOK_SECRET && token === WEBHOOK_SECRET;
}

export async function POST(request) {
  if (!checkToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const type = body.type || '';
  const allowed = ['charge.succeeded', 'charge.refunded'];
  if (!allowed.includes(type)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const obj = (body.data || {}).object || {};
  const meta = obj.metadata || {};

  let status = 'approved';
  if (type === 'charge.refunded') status = 'refunded';

  const valueReais = (parseInt(obj.amount) || 0) / 100;
  const createdAt = obj.created
    ? new Date(obj.created * 1000).toISOString()
    : new Date().toISOString();

  db.prepare(`
    INSERT INTO events (source, event_type, order_id, value, payment_method, product_name, utm_campaign, utm_medium, utm_content, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'stripe',
    type,
    obj.id || null,
    valueReais,
    obj.payment_method_details?.type || 'card',
    null,
    meta.utm_campaign || null,
    meta.utm_medium || null,
    null,
    status,
    createdAt
  );

  return NextResponse.json({ ok: true });
}
