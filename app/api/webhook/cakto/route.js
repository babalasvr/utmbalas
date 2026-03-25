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

  const allowed = ['purchase_approved', 'purchase_refunded', 'purchase_pending'];
  if (!allowed.includes(event)) {
    return NextResponse.json({ ok: true, skipped: true, event });
  }

  const d = body.data || {};
  const product = d.product || {};
  const commissions = d.commissions || [];

  // Pega o valor líquido do produtor (totalAmount da commission)
  const producerCommission = commissions.find(c => c.type === 'producer');
  const value = parseFloat(producerCommission?.totalAmount) || parseFloat(d.amount) || parseFloat(d.baseAmount) || 0;

  let status = 'approved';
  if (event === 'purchase_refunded') status = 'refunded';
  if (event === 'purchase_pending') status = 'pending';

  db.prepare(`
    INSERT INTO events (source, event_type, order_id, value, payment_method, product_name, utm_campaign, utm_medium, utm_content, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cakto',
    event,
    d.id || d.refId || null,
    value,
    d.paymentMethod || d.payment_method || null,
    product.name || null,
    d.utm_campaign || null,
    d.utm_medium || null,
    d.utm_content || null,
    status,
    d.createdAt || d.paidAt || new Date().toISOString()
  );

  return NextResponse.json({ ok: true });
}
