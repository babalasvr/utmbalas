'use client';

import { useState } from 'react';

const fmtBrl = (v) => {
  if (!v || v === 0) return null;
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');
const fmtX   = (v) => (!v || v === 0 ? null : Number(v).toFixed(2) + 'x');

function Dash() {
  return <span className="text-[#2e3a50]">—</span>;
}

function MoneyCell({ value, color }) {
  const str = fmtBrl(value);
  if (!str) return <Dash />;
  return <span style={{ color: color || '#dde3f0' }}>{str}</span>;
}

export default function CampaignsTable({ campaigns }) {
  const [disabled, setDisabled] = useState({});

  if (!campaigns || !campaigns.length) {
    return (
      <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-5">
        <SectionTitle>Performance por Campanha</SectionTitle>
        <div className="flex flex-col items-center justify-center py-12 text-[#5c6e8a] gap-3">
          <div className="spinner" />
          <span className="text-[13px]">Carregando campanhas...</span>
        </div>
      </div>
    );
  }

  const toggleRow = (name) => setDisabled(prev => ({ ...prev, [name]: !prev[name] }));

  const COLS = [
    { label: '' },
    { label: 'Campanha' },
    { label: 'Vendas' },
    { label: 'Faturamento' },
    { label: 'Gasto' },
    { label: 'Lucro' },
    { label: 'CPA' },
    { label: 'ROAS' },
    { label: 'CPC' },
    { label: 'CPM' },
    { label: 'Cliques' },
    { label: 'Impressões' },
  ];

  return (
    <div className="bg-[#0c0f18] border border-[#182030] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#182030] flex items-center justify-between">
        <SectionTitle style={{ marginBottom: 0 }}>Performance por Campanha</SectionTitle>
        <span className="text-[11px] text-[#5c6e8a]">{campaigns.length} campanhas</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-[#182030]">
              {COLS.map((c, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-[0.7px] text-[#5c6e8a] whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, idx) => {
              const isDisabled = disabled[c.campaign_name];
              const lucroPos = c.lucro >= 0;
              return (
                <tr
                  key={idx}
                  className={`border-b border-[#10141f] transition-all duration-150 hover:bg-[#10141f] ${
                    isDisabled ? 'opacity-30' : ''
                  }`}
                >
                  {/* Toggle */}
                  <td className="pl-4 pr-2 py-3">
                    <button
                      onClick={() => toggleRow(c.campaign_name)}
                      className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                        !isDisabled ? 'bg-[#6366f1]' : 'bg-[#182030]'
                      }`}
                    >
                      <span
                        className={`absolute top-[3px] w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
                          !isDisabled ? 'translate-x-[17px]' : 'translate-x-[3px]'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Campaign name */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="font-medium text-[#dde3f0] truncate block" title={c.campaign_name}>
                      {c.campaign_name}
                    </span>
                  </td>

                  {/* Vendas */}
                  <td className="px-4 py-3">
                    {c.vendas > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold
                        bg-[rgba(99,102,241,0.12)] text-[#6366f1]">
                        {fmtNum(c.vendas)}
                      </span>
                    ) : <Dash />}
                  </td>

                  {/* Faturamento */}
                  <td className="px-4 py-3 font-semibold">
                    <MoneyCell value={c.faturamento} color="#dde3f0" />
                  </td>

                  {/* Gasto */}
                  <td className="px-4 py-3">
                    <MoneyCell value={c.gasto} color="#f43f5e" />
                  </td>

                  {/* Lucro */}
                  <td className="px-4 py-3 font-semibold">
                    {c.lucro !== 0 ? (
                      <span style={{ color: lucroPos ? '#10b981' : '#f43f5e' }}>
                        {fmtBrl(Math.abs(c.lucro)) ? (lucroPos ? '+' : '-') + fmtBrl(Math.abs(c.lucro)) : <Dash />}
                      </span>
                    ) : <Dash />}
                  </td>

                  {/* CPA */}
                  <td className="px-4 py-3 text-[#8a95b0]">
                    <MoneyCell value={c.cpa} />
                  </td>

                  {/* ROAS */}
                  <td className="px-4 py-3">
                    {fmtX(c.roas) ? (
                      <span className="font-semibold" style={{
                        color: c.roas >= 3 ? '#10b981' : c.roas >= 1 ? '#f59e0b' : '#f43f5e'
                      }}>
                        {fmtX(c.roas)}
                      </span>
                    ) : <Dash />}
                  </td>

                  {/* CPC */}
                  <td className="px-4 py-3 text-[#8a95b0]">
                    <MoneyCell value={c.cpc} />
                  </td>

                  {/* CPM */}
                  <td className="px-4 py-3 text-[#8a95b0]">
                    <MoneyCell value={c.cpm} />
                  </td>

                  {/* Cliques */}
                  <td className="px-4 py-3 text-[#8a95b0]">
                    {c.clicks > 0 ? fmtNum(c.clicks) : <Dash />}
                  </td>

                  {/* Impressões */}
                  <td className="px-4 py-3 text-[#8a95b0]">
                    {c.impressions > 0 ? fmtNum(c.impressions) : <Dash />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#5c6e8a] mb-0" style={style}>
      {children}
    </div>
  );
}
