export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');

const TZ = 'America/Sao_Paulo';

function toSPDate(date) {
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

  // Label exato usado no cache do Meta (mesmo padrão do metrics/route.js)
  const todayLabel = toSPDate(new Date());
  const metaDateLabel = period === '7d'  ? `7d_${todayLabel}`
                      : period === '30d' ? `30d_${todayLabel}`
                      : todayLabel;

  const vendasPorCampanha = db.prepare(`
    SELECT utm_campaign, SUM(value) as faturamento, COUNT(*) as vendas
    FROM events
    WHERE status = 'approved' AND date(created_at) >= ?
    GROUP BY utm_campaign
  `).all(dateFrom);

  const gastosMeta = db.prepare(`
    SELECT campaign_id, campaign_name, SUM(spend) as spend,
           SUM(clicks) as clicks, SUM(impressions) as impressions,
           AVG(cpc) as cpc, AVG(cpm) as cpm
    FROM meta_spend_cache
    WHERE date = ?
    GROUP BY campaign_id
  `).all(metaDateLabel);

  // Mapeia por campaign_id E por nome para match flexível
  const metaById = {};
  const metaByName = {};
  for (const m of gastosMeta) {
    if (m.campaign_id) metaById[m.campaign_id] = m;
    metaByName[m.campaign_name?.toLowerCase()] = m;
  }

  // Extrai o ID do Meta embutido no utm_campaign (formato: "nome+campanha|ID")
  function extractCampaignId(utm) {
    if (!utm) return null;
    const parts = utm.split('|');
    return parts.length > 1 ? parts[parts.length - 1].trim() : null;
  }

  // Nome legível: remove o |ID do final e troca + por espaço
  function cleanCampaignName(utm, metaName) {
    if (metaName) return metaName;
    if (!utm) return '(sem campanha)';
    return utm.split('|')[0].replace(/\+/g, ' ').trim();
  }

  const campaigns = vendasPorCampanha.map(v => {
    const embeddedId = extractCampaignId(v.utm_campaign);
    // 1º tenta pelo ID embutido no UTM, 2º pelo nome exato, 3º vazio
    const meta = (embeddedId && metaById[embeddedId])
              || metaByName[v.utm_campaign?.toLowerCase()]
              || {};

    const faturamento = parseFloat(v.faturamento) || 0;
    const gasto = parseFloat(meta.spend) || 0;
    const lucro = faturamento - gasto;
    const cpa = v.vendas > 0 && gasto > 0 ? gasto / v.vendas : 0;
    const roas = gasto > 0 ? faturamento / gasto : 0;

    return {
      campaign_id: meta.campaign_id || embeddedId || null,
      campaign_name: cleanCampaignName(v.utm_campaign, meta.campaign_name),
      vendas: v.vendas,
      faturamento,
      gasto,
      lucro,
      cpa,
      cpc: parseFloat(meta.cpc) || 0,
      cpm: parseFloat(meta.cpm) || 0,
      clicks: parseInt(meta.clicks) || 0,
      impressions: parseInt(meta.impressions) || 0,
      roas,
    };
  });

  // Adiciona campanhas do Meta que não tiveram nenhuma venda
  for (const m of gastosMeta) {
    const jaExiste = campaigns.find(c => c.campaign_id === m.campaign_id);
    if (!jaExiste) {
      campaigns.push({
        campaign_id: m.campaign_id,
        campaign_name: m.campaign_name,
        vendas: 0,
        faturamento: 0,
        gasto: parseFloat(m.spend) || 0,
        lucro: -(parseFloat(m.spend) || 0),
        cpa: 0,
        cpc: parseFloat(m.cpc) || 0,
        cpm: parseFloat(m.cpm) || 0,
        clicks: parseInt(m.clicks) || 0,
        impressions: parseInt(m.impressions) || 0,
        roas: 0,
      });
    }
  }

  return NextResponse.json(campaigns);
}
