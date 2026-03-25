'use client';

import { useState } from 'react';

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v) || v === 0) return <span className="text-[#8892a4]">—</span>;
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');
const fmtX = (v) => (!v || isNaN(v) || v === 0 ? <span className="text-[#8892a4]">—</span> : Number(v).toFixed(2) + 'x');

export default function CampaignsTable({ campaigns }) {
  const [disabled, setDisabled] = useState({});

  if (!campaigns || !campaigns.length) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          Performance por Campanha
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-[#8892a4] gap-2">
          <div className="spinner" />
          <span className="text-sm">Carregando campanhas...</span>
        </div>
      </div>
    );
  }

  const toggleRow = (name) => {
    setDisabled(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
        Performance por Campanha
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr>
              {['Ativo', 'Campanha', 'Vendas', 'Faturamento', 'Gasto', 'Lucro', 'CPA', 'ROAS', 'CPC', 'CPM', 'Cliques', 'Impressoes'].map(h => (
                <th
                  key={h}
                  className="text-left px-3 py-2 text-[#8892a4] font-semibold uppercase text-[11px] tracking-[0.5px] border-b border-[#2a2d3e] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d3e]">
            {campaigns.map((c, idx) => {
              const isDisabled = disabled[c.campaign_name];
              return (
                <tr
                  key={idx}
                  className={`hover:bg-[#6366f1]/5 transition-colors ${isDisabled ? 'opacity-40' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <label className="relative inline-block w-9 h-5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!isDisabled}
                        onChange={() => toggleRow(c.campaign_name)}
                        className="sr-only"
                      />
                      <span
                        className={`block w-full h-full rounded-full transition-colors ${
                          !isDisabled ? 'bg-[#6366f1]' : 'bg-[#2a2d3e]'
                        }`}
                      />
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          !isDisabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </label>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[#e2e8f0] max-w-[200px] truncate">
                    {c.campaign_name}
                  </td>
                  <td className="px-3 py-2.5">{fmtNum(c.vendas)}</td>
                  <td className="px-3 py-2.5">{fmt(c.faturamento)}</td>
                  <td className="px-3 py-2.5 text-[#ef4444]">
                    {c.gasto > 0 ? fmt(c.gasto) : <span className="text-[#8892a4]">—</span>}
                  </td>
                  <td className={`px-3 py-2.5 font-semibold ${c.lucro >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {fmt(c.lucro)}
                  </td>
                  <td className="px-3 py-2.5">{fmt(c.cpa)}</td>
                  <td className="px-3 py-2.5">{fmtX(c.roas)}</td>
                  <td className="px-3 py-2.5">{fmt(c.cpc)}</td>
                  <td className="px-3 py-2.5">{fmt(c.cpm)}</td>
                  <td className="px-3 py-2.5">{fmtNum(c.clicks)}</td>
                  <td className="px-3 py-2.5">{fmtNum(c.impressions)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
