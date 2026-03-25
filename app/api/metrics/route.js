export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');
const { getMetaToken } = require('@/lib/meta');

const TZ = 'America/Sao_Paulo';

function toSPDate(date) {
  // Retorna YYYY-MM-DD no fuso de São Paulo
  return date.toLocaleDateString('pt-BR', { timeZone: TZ })
    .split('/').reverse().join('-');
}

function getDateFilter(period) {
  const now = new Date();
  if (period === '7d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return toSPDate(d);
  }
  if (period === '30d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return toSPDate(d);
  }
  return toSPDate(now);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'hoje';
  const dateFrom = getDateFilter(period);

  const approved = db.prepare(`
    SELECT SUM(value) as total, COUNT(*) as count
    FROM events
    WHERE status = 'approved' AND date(created_at) >= ?
  `).get(dateFrom);

  const pending = db.prepare(`
    SELECT SUM(value) as total FROM events
    WHERE status = 'pending' AND date(created_at) >= ?
  `).get(dateFrom);

  const refunded = db.prepare(`
    SELECT SUM(value) as total FROM events
    WHERE status = 'refunded' AND date(created_at) >= ?
  `).get(dateFrom);

  const porFonte = db.prepare(`
    SELECT utm_campaign as fonte, SUM(value) as faturamento, COUNT(*) as vendas
    FROM events
    WHERE status = 'approved' AND date(created_at) >= ?
    GROUP BY utm_campaign
    ORDER BY faturamento DESC
  `).all(dateFrom);

  const porPagamento = db.prepare(`
    SELECT payment_method, SUM(value) as faturamento, COUNT(*) as vendas
    FROM events
    WHERE status = 'approved' AND date(created_at) >= ?
    GROUP BY payment_method
    ORDER BY faturamento DESC
  `).all(dateFrom);

  const porProduto = db.prepare(`
    SELECT product_name, SUM(value) as faturamento, COUNT(*) as vendas
    FROM events
    WHERE status = 'approved' AND date(created_at) >= ?
    GROUP BY product_name
    ORDER BY faturamento DESC
  `).all(dateFrom);

  const porHora = db.prepare(`
    SELECT strftime('%H', datetime(created_at, '-3 hours')) as hora, SUM(value) as receita, COUNT(*) as vendas
    FROM events
    WHERE status = 'approved' AND date(datetime(created_at, '-3 hours')) >= ?
    GROUP BY hora
    ORDER BY hora
  `).all(dateFrom);

  let gasto = 0;
  const metaToken = getMetaToken();
  if (metaToken) {
    const todayLabel = toSPDate(new Date());
    const metaDateLabel = period === '7d'  ? `7d_${todayLabel}`
                        : period === '30d' ? `30d_${todayLabel}`
                        : todayLabel;
    const spendRow = db.prepare(`
      SELECT SUM(spend) as total FROM meta_spend_cache WHERE date = ?
    `).get(metaDateLabel);
    gasto = parseFloat(spendRow?.total) || 0;
  }

  const faturamento = parseFloat(approved?.total) || 0;
  const vendas = parseInt(approved?.count) || 0;
  const lucro = faturamento - gasto;
  const roi = gasto > 0 ? lucro / gasto : 0;
  const cpa = vendas > 0 && gasto > 0 ? gasto / vendas : 0;
  const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
  const arpu = vendas > 0 ? faturamento / vendas : 0;

  return NextResponse.json({
    faturamento,
    gasto,
    lucro,
    roi,
    cpa,
    margem,
    vendas,
    arpu,
    pendentes: parseFloat(pending?.total) || 0,
    reembolsadas: parseFloat(refunded?.total) || 0,
    por_fonte: porFonte,
    por_pagamento: porPagamento,
    por_produto: porProduto,
    por_hora: porHora,
    meta_conectado: !!metaToken,
    period,
  });
}
