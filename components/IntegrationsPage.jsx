'use client';

import { useState, useEffect } from 'react';

const SIDEBAR_ITEMS = [
  { key: 'perfil', label: 'Perfil', icon: '👤', group: 'config' },
  { key: 'webhooks', label: 'Webhooks', icon: '🔗', group: 'config' },
  { key: 'meta', label: 'Meta Ads', icon: '📘', group: 'plataformas' },
  { key: 'cakto', label: 'Cakto', icon: '🛒', group: 'plataformas' },
  { key: 'woovi', label: 'Woovi', icon: '💸', group: 'plataformas' },
  { key: 'stripe', label: 'Stripe', icon: '💳', group: 'plataformas' },
];

function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
}

function WebhookUrlBox({ icon, name, events, url }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-semibold text-[14px] text-[#e2e8f0]">{name}</div>
          <div className="text-[11px] text-[#8892a4] mt-0.5">{events}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 px-3 py-2 bg-[#0f1117] border border-[#2a2d3e] rounded-md text-[#8892a4] text-[12px] font-mono outline-none"
        />
        <button
          onClick={() => copyToClipboard(url, setCopied)}
          className={`px-3.5 py-2 rounded-md border text-[12px] font-semibold transition-colors whitespace-nowrap ${
            copied
              ? 'border-[#22c55e] text-[#22c55e]'
              : 'border-[#2a2d3e] text-[#8892a4] hover:border-[#6366f1] hover:text-[#6366f1]'
          }`}
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [activePanel, setActivePanel] = useState('perfil');
  const [settings, setSettings] = useState({});
  const [saveMsg, setSaveMsg] = useState('');
  const [saveTokenMsg, setSaveTokenMsg] = useState('');
  const [metaAccounts, setMetaAccounts] = useState([]);
  const [metaCurrentId, setMetaCurrentId] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  const [pfName, setPfName] = useState('');
  const [pfEmail, setPfEmail] = useState('');
  const [pfBusiness, setPfBusiness] = useState('');
  const [pfBaseUrl, setPfBaseUrl] = useState('');
  const [whToken, setWhToken] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setPfName(data.profile_name || '');
        setPfEmail(data.profile_email || '');
        setPfBusiness(data.profile_business || '');
        setPfBaseUrl(data.base_url || '');
        setWhToken(data.webhook_token || '');
      });
  }, []);

  const saveProfile = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_name: pfName,
        profile_email: pfEmail,
        profile_business: pfBusiness,
        base_url: pfBaseUrl,
      }),
    });
    setSettings(prev => ({ ...prev, profile_name: pfName, profile_email: pfEmail, profile_business: pfBusiness, base_url: pfBaseUrl }));
    setSaveMsg('Salvo!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const saveWebhookToken = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_token: whToken }),
    });
    setSettings(prev => ({ ...prev, webhook_token: whToken }));
    setSaveTokenMsg('Salvo!');
    setTimeout(() => setSaveTokenMsg(''), 2500);
  };

  const generateToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const token = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setWhToken(token);
  };

  const disconnectMeta = async () => {
    if (!confirm('Desconectar o Meta Ads?')) return;
    await fetch('/api/meta/disconnect', { method: 'DELETE' });
    setSettings(prev => ({ ...prev, meta_connected: false, meta_account_id: null }));
    setMetaAccounts([]);
  };

  const loadMetaAccounts = async () => {
    setLoadingAccounts(true);
    const res = await fetch('/api/meta/accounts');
    const data = await res.json();
    setMetaAccounts(data.accounts || []);
    setMetaCurrentId(data.current || null);
    setLoadingAccounts(false);
  };

  const switchMetaAccount = async (accountId) => {
    setSwitchingAccount(accountId);
    await fetch('/api/meta/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId }),
    });
    setMetaCurrentId(accountId);
    setSettings(prev => ({ ...prev, meta_account_id: accountId }));
    setSwitchingAccount(false);
  };

  const baseUrl = pfBaseUrl || settings.base_url || 'http://localhost:3000';
  const token = whToken || settings.webhook_token || 'SEU_TOKEN';

  const webhookUrls = {
    cakto: `${baseUrl}/api/webhook/cakto?token=${token}`,
    woovi: `${baseUrl}/api/webhook/woovi?token=${token}`,
    stripe: `${baseUrl}/api/webhook/stripe?token=${token}`,
  };

  return (
    <div className="grid min-h-[calc(100vh-57px)]" style={{ gridTemplateColumns: '220px 1fr' }}>
      {/* Sidebar */}
      <div className="bg-[#1a1d27] border-r border-[#2a2d3e] py-5">
        <div className="text-[11px] font-bold uppercase tracking-[1px] text-[#8892a4] px-5 pb-2.5">
          Configuracoes
        </div>
        {SIDEBAR_ITEMS.filter(i => i.group === 'config').map(item => (
          <button
            key={item.key}
            onClick={() => setActivePanel(item.key)}
            className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium transition-all border-l-2 ${
              activePanel === item.key
                ? 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]'
                : 'text-[#8892a4] hover:text-[#e2e8f0] hover:bg-white/[0.03] border-transparent'
            }`}
          >
            <span className="w-7 h-7 rounded-md flex items-center justify-center text-[15px] bg-[#1e2130]">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        <div className="h-px bg-[#2a2d3e] mx-5 my-3" />

        <div className="text-[11px] font-bold uppercase tracking-[1px] text-[#8892a4] px-5 pb-2.5">
          Plataformas
        </div>
        {SIDEBAR_ITEMS.filter(i => i.group === 'plataformas').map(item => (
          <button
            key={item.key}
            onClick={() => setActivePanel(item.key)}
            className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium transition-all border-l-2 ${
              activePanel === item.key
                ? 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]'
                : 'text-[#8892a4] hover:text-[#e2e8f0] hover:bg-white/[0.03] border-transparent'
            }`}
          >
            <span className="w-7 h-7 rounded-md flex items-center justify-center text-[15px] bg-[#1e2130]">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-8 overflow-y-auto">

        {/* PERFIL */}
        {activePanel === 'perfil' && (
          <div>
            <h2 className="text-[17px] font-bold text-[#e2e8f0] mb-1">Perfil</h2>
            <p className="text-[13px] text-[#8892a4] mb-6">Informacoes da sua conta e negocio.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-1.5">Nome</label>
                <input
                  type="text"
                  value={pfName}
                  onChange={e => setPfName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3.5 py-2.5 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-[#e2e8f0] text-[14px] outline-none focus:border-[#6366f1] transition-colors placeholder-[#8892a4]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={pfEmail}
                  onChange={e => setPfEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3.5 py-2.5 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-[#e2e8f0] text-[14px] outline-none focus:border-[#6366f1] transition-colors placeholder-[#8892a4]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-1.5">Nome do negocio</label>
              <input
                type="text"
                value={pfBusiness}
                onChange={e => setPfBusiness(e.target.value)}
                placeholder="Minha Empresa Ltda"
                className="w-full px-3.5 py-2.5 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-[#e2e8f0] text-[14px] outline-none focus:border-[#6366f1] transition-colors placeholder-[#8892a4]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-1.5">URL base do servidor</label>
              <input
                type="text"
                value={pfBaseUrl}
                onChange={e => setPfBaseUrl(e.target.value)}
                placeholder="https://seudominio.com"
                className="w-full px-3.5 py-2.5 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-[#e2e8f0] text-[14px] outline-none focus:border-[#6366f1] transition-colors placeholder-[#8892a4]"
              />
              <div className="text-[11px] text-[#8892a4] mt-1.5">
                Usada para gerar as URLs dos webhooks e o callback OAuth do Meta.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveProfile}
                className="px-5 py-2 bg-[#6366f1] hover:bg-[#5254cc] text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                Salvar
              </button>
              {saveMsg && <span className="text-[12px] text-[#22c55e]">{saveMsg}</span>}
            </div>
          </div>
        )}

        {/* WEBHOOKS */}
        {activePanel === 'webhooks' && (
          <div>
            <h2 className="text-[17px] font-bold text-[#e2e8f0] mb-1">Token dos Webhooks</h2>
            <p className="text-[13px] text-[#8892a4] mb-6">
              Use este token para autenticar os webhooks recebidos. Cole as URLs abaixo em cada plataforma.
            </p>

            <div className="max-w-xl mb-2">
              <label className="block text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-1.5">Token secreto</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={whToken}
                  onChange={e => setWhToken(e.target.value)}
                  placeholder="meu_token_secreto"
                  className="flex-1 px-3.5 py-2.5 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-[#e2e8f0] text-[14px] outline-none focus:border-[#6366f1] transition-colors placeholder-[#8892a4]"
                />
                <button
                  onClick={generateToken}
                  className="px-4 py-2 bg-transparent border border-[#2a2d3e] text-[#8892a4] hover:border-[#6366f1] hover:text-[#6366f1] text-[13px] font-semibold rounded-lg transition-colors"
                >
                  Gerar
                </button>
              </div>
              <div className="text-[11px] text-[#8892a4] mt-1.5">
                Este token e enviado como <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">?token=</code> na URL do webhook.
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={saveWebhookToken}
                className="px-5 py-2 bg-[#6366f1] hover:bg-[#5254cc] text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                Salvar token
              </button>
              {saveTokenMsg && <span className="text-[12px] text-[#22c55e]">{saveTokenMsg}</span>}
            </div>

            <h3 className="text-[14px] font-bold text-[#e2e8f0] mb-1">URLs para copiar</h3>
            <p className="text-[13px] text-[#8892a4] mb-4">Cole cada URL no painel da respectiva plataforma.</p>

            <WebhookUrlBox
              icon="🛒"
              name="Cakto"
              events="purchase.approved · purchase.refunded · purchase.pending"
              url={webhookUrls.cakto}
            />
            <WebhookUrlBox
              icon="💸"
              name="Woovi"
              events="OPENPIX:CHARGE_COMPLETED"
              url={webhookUrls.woovi}
            />
            <WebhookUrlBox
              icon="💳"
              name="Stripe"
              events="charge.succeeded · charge.refunded"
              url={webhookUrls.stripe}
            />
          </div>
        )}

        {/* META ADS */}
        {activePanel === 'meta' && (
          <div>
            <h2 className="text-[17px] font-bold text-[#e2e8f0] mb-1">Meta Ads</h2>
            <p className="text-[13px] text-[#8892a4] mb-6">
              Conecte sua conta de anuncios para ver gastos, CPA e ROAS em tempo real.
            </p>

            <div className="flex items-center justify-between p-4 bg-[#1e2130] border border-[#2a2d3e] rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl bg-[#1a1d27]">📘</div>
                <div>
                  <div className="font-semibold text-[14px] text-[#e2e8f0]">Meta for Business</div>
                  <div className="text-[11px] text-[#8892a4] mt-0.5">
                    {settings.meta_connected
                      ? `Conta: ${settings.meta_account_id || 'conectada'}`
                      : 'Nao conectado'}
                  </div>
                </div>
              </div>
              {settings.meta_connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#22c55e]/15 text-[#22c55e]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8892a4]/10 text-[#8892a4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8892a4]" />
                  Desconectado
                </span>
              )}
            </div>

            {!settings.meta_connected ? (
              <div>
                <p className="text-[13px] text-[#8892a4] mb-4 leading-relaxed">
                  Ao conectar, o UTMBalas ira ler os dados de gastos das suas campanhas a cada 30 minutos e cruzar com as vendas recebidas pelos webhooks.
                </p>
                <a
                  href="/api/meta/auth"
                  className="inline-block px-5 py-2 bg-[#6366f1] hover:bg-[#5254cc] text-white text-[13px] font-semibold rounded-lg transition-colors no-underline"
                >
                  Conectar com Meta
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Botão trocar conta */}
                <div className="flex gap-2">
                  <button
                    onClick={loadMetaAccounts}
                    disabled={loadingAccounts}
                    className="px-4 py-2 bg-[#6366f1]/15 hover:bg-[#6366f1]/25 text-[#6366f1] border border-[#6366f1]/30 text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingAccounts ? 'Carregando...' : '🔄 Trocar conta de anúncios'}
                  </button>
                  <button
                    onClick={disconnectMeta}
                    className="px-4 py-2 bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] border border-[#ef4444]/30 text-[13px] font-semibold rounded-lg transition-colors"
                  >
                    Desconectar
                  </button>
                </div>

                {/* Lista de contas */}
                {metaAccounts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-3">
                      Selecione a conta de anúncios:
                    </p>
                    <div className="flex flex-col gap-2">
                      {metaAccounts.map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => switchMetaAccount(acc.id)}
                          disabled={switchingAccount === acc.id}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                            metaCurrentId === acc.id
                              ? 'border-[#6366f1] bg-[#6366f1]/10'
                              : 'border-[#2a2d3e] bg-[#1e2130] hover:border-[#6366f1]/50'
                          }`}
                        >
                          <div>
                            <div className="text-[13px] font-semibold text-[#e2e8f0]">{acc.name}</div>
                            <div className="text-[11px] text-[#8892a4] mt-0.5">{acc.id}</div>
                          </div>
                          {metaCurrentId === acc.id && (
                            <span className="text-[11px] font-bold text-[#6366f1] bg-[#6366f1]/20 px-2.5 py-1 rounded-full">
                              Ativa
                            </span>
                          )}
                          {switchingAccount === acc.id && (
                            <span className="text-[11px] text-[#8892a4]">Salvando...</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CAKTO */}
        {activePanel === 'cakto' && (
          <div>
            <h2 className="text-[17px] font-bold text-[#e2e8f0] mb-1">Cakto</h2>
            <p className="text-[13px] text-[#8892a4] mb-6">Receba notificacoes de vendas, reembolsos e pendencias em tempo real.</p>

            <div className="flex items-center justify-between p-4 bg-[#1e2130] border border-[#2a2d3e] rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl bg-[#1a1d27]">🛒</div>
                <div>
                  <div className="font-semibold text-[14px] text-[#e2e8f0]">Cakto</div>
                  <div className="text-[11px] text-[#8892a4] mt-0.5">Webhook via token</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#22c55e]/15 text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                Ativo
              </span>
            </div>

            <p className="text-[13px] text-[#8892a4] mb-4 leading-relaxed">
              No painel da Cakto, va em <strong className="text-[#e2e8f0]">Configuracoes &rarr; Webhooks</strong> e cole a URL abaixo:
            </p>
            <WebhookUrlBox
              icon="🛒"
              name="Cakto"
              events="purchase.approved · purchase.refunded · purchase.pending"
              url={webhookUrls.cakto}
            />
            <div className="text-[12px] text-[#8892a4] mt-2">
              Eventos suportados:{' '}
              <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">purchase.approved</code>{' '}
              <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">purchase.refunded</code>{' '}
              <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">purchase.pending</code>
            </div>
          </div>
        )}

        {/* WOOVI */}
        {activePanel === 'woovi' && (
          <div>
            <h2 className="text-[17px] font-bold text-[#e2e8f0] mb-1">Woovi</h2>
            <p className="text-[13px] text-[#8892a4] mb-6">Receba confirmacoes de pagamento Pix automaticamente.</p>

            <div className="flex items-center justify-between p-4 bg-[#1e2130] border border-[#2a2d3e] rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl bg-[#1a1d27]">💸</div>
                <div>
                  <div className="font-semibold text-[14px] text-[#e2e8f0]">Woovi / OpenPix</div>
                  <div className="text-[11px] text-[#8892a4] mt-0.5">Webhook via token</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#22c55e]/15 text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                Ativo
              </span>
            </div>

            <p className="text-[13px] text-[#8892a4] mb-4 leading-relaxed">
              No painel da Woovi, va em <strong className="text-[#e2e8f0]">API/Plugins &rarr; Webhooks</strong> e adicione a URL abaixo:
            </p>
            <WebhookUrlBox
              icon="💸"
              name="Woovi"
              events="OPENPIX:CHARGE_COMPLETED"
              url={webhookUrls.woovi}
            />
            <div className="text-[12px] text-[#8892a4] mt-2">
              Evento suportado:{' '}
              <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">OPENPIX:CHARGE_COMPLETED</code>
            </div>
          </div>
        )}

        {/* STRIPE */}
        {activePanel === 'stripe' && (
          <div>
            <h2 className="text-[17px] font-bold text-[#e2e8f0] mb-1">Stripe</h2>
            <p className="text-[13px] text-[#8892a4] mb-6">Receba eventos de cobranca e reembolso do Stripe.</p>

            <div className="flex items-center justify-between p-4 bg-[#1e2130] border border-[#2a2d3e] rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl bg-[#1a1d27]">💳</div>
                <div>
                  <div className="font-semibold text-[14px] text-[#e2e8f0]">Stripe</div>
                  <div className="text-[11px] text-[#8892a4] mt-0.5">Webhook via token</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#22c55e]/15 text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                Ativo
              </span>
            </div>

            <p className="text-[13px] text-[#8892a4] mb-4 leading-relaxed">
              No painel do Stripe, va em <strong className="text-[#e2e8f0]">Developers &rarr; Webhooks &rarr; Add endpoint</strong> e cole a URL abaixo:
            </p>
            <WebhookUrlBox
              icon="💳"
              name="Stripe"
              events="charge.succeeded · charge.refunded"
              url={webhookUrls.stripe}
            />
            <div className="text-[12px] text-[#8892a4] mt-2">
              Eventos suportados:{' '}
              <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">charge.succeeded</code>{' '}
              <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[11px]">charge.refunded</code>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
