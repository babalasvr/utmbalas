const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(process.cwd(), 'dashboard.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    order_id TEXT,
    value REAL DEFAULT 0,
    payment_method TEXT,
    product_name TEXT,
    utm_campaign TEXT,
    utm_medium TEXT,
    utm_content TEXT,
    status TEXT DEFAULT 'approved',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meta_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    ad_account_id TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meta_spend_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id TEXT,
    campaign_name TEXT,
    spend REAL DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    cpc REAL DEFAULT 0,
    cpm REAL DEFAULT 0,
    date TEXT,
    fetched_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migrações seguras (ignoram erro se coluna já existe)
try { db.exec('ALTER TABLE meta_spend_cache ADD COLUMN page_views INTEGER DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE meta_spend_cache ADD COLUMN checkout_initiations INTEGER DEFAULT 0'); } catch {}

module.exports = db;
