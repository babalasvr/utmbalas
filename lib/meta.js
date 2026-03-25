const db = require('./db');

function getMetaToken() {
  const row = db.prepare('SELECT * FROM meta_tokens ORDER BY id DESC LIMIT 1').get();
  return row || null;
}

function spDate(d) {
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }).split('/').reverse().join('-');
}

async function getExchangeRate(from, to) {
  // Tenta 3 APIs diferentes com fallback
  const apis = [
    async () => {
      const r = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
      const d = await r.json();
      return parseFloat(d.rates?.[to]);
    },
    async () => {
      const r = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const d = await r.json();
      return parseFloat(d.rates?.[to]);
    },
    async () => {
      const r = await fetch(`https://economia.awesomeapi.com.br/json/last/${from}-${to}`);
      const d = await r.json();
      return parseFloat(d[`${from}${to}`]?.bid);
    },
  ];

  for (const api of apis) {
    try {
      const rate = await api();
      if (rate && rate > 1) {
        console.log(`[Meta Sync] Taxa ${from}→${to}: ${rate}`);
        return rate;
      }
    } catch {}
  }

  console.error(`[Meta Sync] Falha ao buscar taxa ${from}→${to}, usando fallback 5.80`);
  return 5.80; // fallback conservador
}

async function syncMetaAdsForPreset(access_token, ad_account_id, date_preset, dateLabel, fxRate) {
  // actions traz page views, checkout initiations, etc do pixel
  const fields = `id,name,insights.date_preset(${date_preset}){spend,clicks,impressions,cpc,cpm,actions}`;
  const url = `https://graph.facebook.com/v19.0/${ad_account_id}/campaigns` +
    `?fields=${encodeURIComponent(fields)}&access_token=${access_token}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.data) {
    console.error(`[Meta Sync] Erro ${date_preset}:`, JSON.stringify(data));
    return;
  }

  db.prepare('DELETE FROM meta_spend_cache WHERE date = ?').run(dateLabel);

  const insertStmt = db.prepare(`
    INSERT INTO meta_spend_cache (campaign_id, campaign_name, spend, clicks, impressions, cpc, cpm, page_views, checkout_initiations, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const campaign of data.data) {
    const ins = campaign.insights?.data?.[0] || {};
    const actions = ins.actions || [];
    const getAct = (type) => parseInt(actions.find(a => a.action_type === type)?.value) || 0;
    const pageViews     = getAct('landing_page_view') || getAct('view_content');
    const checkoutInits = getAct('initiate_checkout');

    insertStmt.run(
      campaign.id,
      campaign.name,
      (parseFloat(ins.spend) || 0) * fxRate,
      parseInt(ins.clicks) || 0,
      parseInt(ins.impressions) || 0,
      (parseFloat(ins.cpc) || 0) * fxRate,
      (parseFloat(ins.cpm) || 0) * fxRate,
      pageViews,
      checkoutInits,
      dateLabel
    );
  }

  console.log(`[Meta Sync] ${date_preset}: ${data.data.length} campanhas (fx=${fxRate}) — ${new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
}

async function syncMetaAds() {
  const tokenRow = getMetaToken();
  if (!tokenRow?.access_token || !tokenRow?.ad_account_id) return;

  const { access_token, ad_account_id } = tokenRow;
  const now = new Date();
  const todayLabel = spDate(now);
  const label7d    = `7d_${todayLabel}`;
  const label30d   = `30d_${todayLabel}`;

  try {
    // Buscar moeda da conta direto no endpoint da conta
    const accRes = await fetch(
      `https://graph.facebook.com/v19.0/${ad_account_id}?fields=currency&access_token=${access_token}`
    );
    const accData = await accRes.json();
    const currency = accData.currency || 'BRL';
    const fxRate = currency !== 'BRL' ? await getExchangeRate(currency, 'BRL') : 1;
    console.log(`[Meta Sync] Conta ${ad_account_id} — moeda: ${currency}, taxa: ${fxRate}`);

    await syncMetaAdsForPreset(access_token, ad_account_id, 'today',    todayLabel, fxRate);
    await syncMetaAdsForPreset(access_token, ad_account_id, 'last_7d',  label7d,    fxRate);
    await syncMetaAdsForPreset(access_token, ad_account_id, 'last_30d', label30d,   fxRate);
  } catch (err) {
    console.error('[Meta Sync] Erro:', err.message);
  }
}

module.exports = { syncMetaAds, getMetaToken, spDate };
