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
  if (event !== 'OPENPIX:CHARGE_COMPLETED') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const charge = body.charge || {};
  const valueReais = (parseInt(charge.value) || 0) / 100;

  db.prepare(`
    INSERT INTO events (source, event_type, order_id, value, payment_method, product_name, utm_campaign, utm_medium, utm_content, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'woovi',
    event,
    charge.correlationID || null,
    valueReais,
    'pix',
    charge.comment || null,
    null,
    null,
    null,
    'approved',
    charge.createdAt || new Date().toISOString()
  );

  return NextResponse.json({ ok: true });
}
