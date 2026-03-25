require('dotenv').config();
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cron = require('node-cron');
const { syncMetaAds } = require('./lib/meta');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, () => {
    console.log(`\n🚀 UTMBalas rodando em http://localhost:${PORT}\n`);
    cron.schedule('*/30 * * * *', syncMetaAds);
  });
});
