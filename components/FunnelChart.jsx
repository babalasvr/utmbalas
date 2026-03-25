'use client';

const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');

export default function FunnelChart({ campaigns, title }) {
  const totalImpressions = (campaigns || []).reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = (campaigns || []).reduce((s, c) => s + (c.clicks || 0), 0);
  const totalVendas = (campaigns || []).reduce((s, c) => s + (c.vendas || 0), 0);

  const steps = [
    { name: 'Impressoes', value: totalImpressions, color: '#6366f1', pct: 100 },
    { name: 'Cliques', value: totalClicks, color: '#3b82f6', pct: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0 },
    { name: 'Vendas', value: totalVendas, color: '#22c55e', pct: totalClicks > 0 ? (totalVendas / totalClicks) * 100 : 0 },
  ];

  if (!campaigns || !campaigns.length || totalImpressions === 0) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
        {title && (
          <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
            {title}
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-10 text-[#8892a4] gap-2">
          <span className="text-3xl">&#x1F4C9;</span>
          <span className="text-sm">Conecte o Meta Ads para ver o funil</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <div key={step.name} className="relative">
            <div className="bg-[#1e2130] rounded-md h-9 overflow-hidden">
              <div
                className="h-full rounded-md flex items-center px-3 text-[12px] font-semibold text-white transition-all duration-500"
                style={{ width: `${Math.max(step.pct, 2)}%`, background: step.color }}
              >
                {step.pct >= 15 ? fmtNum(step.value) : ''}
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-[#8892a4]">{step.name}</span>
              <span className="text-[11px] font-semibold text-[#e2e8f0]">
                {fmtNum(step.value)} ({step.pct.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
