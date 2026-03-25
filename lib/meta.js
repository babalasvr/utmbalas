const db = require('./db');

function getMetaToken() {
  const row = db.prepare('SELECT * FROM meta_tokens ORDER BY id DESC LIMIT 1').get();
  return row || null;
}

async function syncMetaAds() {
  const tokenRow = getMetaToken();
  if (!tokenRow?.access_token || !tokenRow?.ad_account_id) return;

  const { access_token, ad_account_id } = tokenRow;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const url = `https://graph.facebook.com/v19.0/${ad_account_id}/campaigns?fields=name,insights{spend,clicks,impressions,cpc,cpm}&date_preset=last_30d&level=campaign&access_token=${access_token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data) {
      console.error('[Meta Sync] Resposta inesperada:', JSON.stringify(data));
      return;
    }

    const insertStmt = db.prepare(`
      INSERT INTO meta_spend_cache (campaign_id, campaign_name, spend, clicks, impressions, cpc, cpm, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Limpa cache do dia antes de reinserir
    db.prepare('DELETE FROM meta_spend_cache WHERE date = ?').run(today);

    for (const campaign of data.data) {
      const ins = campaign.insights?.data?.[0] || {};
      insertStmt.run(
        campaign.id,
        campaign.name,
        parseFloat(ins.spend) || 0,
        parseInt(ins.clicks) || 0,
        parseInt(ins.impressions) || 0,
        parseFloat(ins.cpc) || 0,
        parseFloat(ins.cpm) || 0,
        today
      );
    }

    console.log(`[Meta Sync] ${data.data.length} campanhas sincronizadas em ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error('[Meta Sync] Erro:', err.message);
  }
}

module.exports = { syncMetaAds, getMetaToken };
