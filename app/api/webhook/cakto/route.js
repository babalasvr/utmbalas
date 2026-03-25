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
  const event = body.event || '';
  const allowed = ['purchase.approved', 'purchase.refunded', 'purchase.pending'];
  if (!allowed.includes(event)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const p = body.purchase || {};
  const product = p.product || {};

  let status = 'approved';
  if (event === 'purchase.refunded') status = 'refunded';
  if (event === 'purchase.pending') status = 'pending';

  db.prepare(`
    INSERT INTO events (source, event_type, order_id, value, payment_method, product_name, utm_campaign, utm_medium, utm_content, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cakto',
    event,
    p.id || null,
    parseFloat(p.value) || 0,
    p.payment_method || null,
    product.name || null,
    p.utm_campaign || null,
    p.utm_medium || null,
    p.utm_content || null,
    status,
    p.created_at || new Date().toISOString()
  );

  return NextResponse.json({ ok: true });
}
