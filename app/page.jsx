'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import KPICard from '@/components/KPICard';
import PeriodSelector from '@/components/PeriodSelector';
import TabsPanel from '@/components/TabsPanel';
import DonutChart from '@/components/DonutChart';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import FunnelChart from '@/components/FunnelChart';
import ProgressList from '@/components/ProgressList';
import CampaignsTable from '@/components/CampaignsTable';
import ApprovalRings from '@/components/ApprovalRings';
import IntegrationsPage from '@/components/IntegrationsPage';

const fmt = (v, decimals = 2) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');
const fmtPct = (v) => (isNaN(v) ? '—' : Number(v).toFixed(1) + '%');
const fmtX = (v) => (isNaN(v) || !v ? '—' : Number(v).toFixed(2) + 'x');

const CHART_COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

const TABS = [
  { key: 'visao-geral', label: 'Visao Geral' },
  { key: 'por-horario', label: 'Por Horario' },
  { key: 'campanhas', label: 'Campanhas' },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [period, setPeriod] = useState('hoje');
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [metrics, setMetrics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const fetchMetrics = useCallback(async (p) => {
    try {
      const res = await fetch(`/api/metrics?period=${p}`);
      const data = await res.json();
      setMetrics(data);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
    } catch (e) {
      console.error('Erro ao buscar metricas:', e);
    }
  }, []);

  const fetchCampaigns = useCallback(async (p) => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch(`/api/campaigns?period=${p}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (e) {
      console.error('Erro ao buscar campanhas:', e);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(period);
    const interval = setInterval(() => fetchMetrics(period), 30000);
    return () => clearInterval(interval);
  }, [period, fetchMetrics]);

  useEffect(() => {
    if (activeTab === 'campanhas') {
      fetchCampaigns(period);
    }
  }, [activeTab, period, fetchCampaigns]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
  };

  // Build chart data from metrics
  const pagamentoLabels = (metrics?.por_pagamento || []).map(p => (p.payment_method || 'Desconhecido').toUpperCase());
  const pagamentoData = (metrics?.por_pagamento || []).map(p => p.faturamento);

  const horaLabels = [];
  const horaData = [];
  const horaAcumulado = [];
  let acum = 0;
  for (let h = 0; h < 24; h++) {
    const hora = String(h).padStart(2, '0');
    const found = (metrics?.por_hora || []).find(x => x.hora === hora);
    const val = found ? found.receita : 0;
    acum += val;
    horaLabels.push(`${hora}h`);
    horaData.push(val);
    horaAcumulado.push(acum);
  }

  const barDatasets = [
    {
      label: 'Receita (R$)',
      data: horaData,
      backgroundColor: '#6366f1',
      borderRadius: 4,
    },
  ];

  const lineDatasets = [
    {
      label: 'Acumulado (R$)',
      data: horaAcumulado,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      pointRadius: 2,
    },
  ];

  const fonteItems = (metrics?.por_fonte || []).map(f => ({
    label: f.fonte || '(direto)',
    value: f.faturamento,
  }));

  const produtoItems = (metrics?.por_produto || []).map(p => ({
    label: p.product_name || '(sem nome)',
    value: p.faturamento,
    vendas: p.vendas,
  }));

  const totalFaturamento = metrics?.faturamento || 0;

  const lucroColor = !metrics ? 'default' : metrics.lucro >= 0 ? 'green' : 'red';

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        metaConectado={metrics?.meta_conectado || false}
      />

      {activePage === 'integracoes' ? (
        <IntegrationsPage />
      ) : (
        <>
          <PeriodSelector period={period} onChange={handlePeriodChange} lastUpdated={lastUpdated} />

          <div className="px-6 py-5 flex flex-col gap-5">
            {/* KPI Row */}
            <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              <KPICard
                label="Faturamento"
                value={metrics ? fmt(metrics.faturamento) : '—'}
                sub={metrics ? `${fmtNum(metrics.vendas)} vendas aprovadas` : '—'}
                color="default"
              />
              <KPICard
                label="Valor Gasto"
                value={metrics ? fmt(metrics.gasto) : '—'}
                sub={metrics?.meta_conectado ? 'Meta Ads conectado' : 'Meta nao conectado'}
                color="red"
              />
              <KPICard
                label="Lucro"
                value={metrics ? fmt(metrics.lucro) : '—'}
                sub={metrics ? `Margem: ${fmtPct(metrics.margem)}` : '—'}
                color={lucroColor}
              />
              <KPICard
                label="ROI"
                value={metrics ? fmtX(metrics.roi) : '—'}
                sub="Retorno sobre investimento"
                color="yellow"
              />
              <KPICard
                label="CPA"
                value={metrics ? fmt(metrics.cpa) : '—'}
                sub="Custo por aquisicao"
                color="blue"
              />
              <KPICard
                label="ARPU"
                value={metrics ? fmt(metrics.arpu) : '—'}
                sub="Receita por venda"
                color="default"
              />
              <KPICard
                label="Pendentes"
                value={metrics ? fmt(metrics.pendentes) : '—'}
                sub="Aguardando pagamento"
                color="default"
              />
              <KPICard
                label="Reembolsos"
                value={metrics ? fmt(metrics.reembolsadas) : '—'}
                sub="Total devolvido"
                color="purple"
              />
            </div>

            {/* Tabs */}
            <TabsPanel tabs={TABS} activeTab={activeTab} onChange={setActiveTab}>

              {/* Tab: Visao Geral */}
              {activeTab === 'visao-geral' && (
                <div className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-3.5">
                    <DonutChart
                      title="Vendas por Forma de Pagamento"
                      labels={pagamentoLabels}
                      data={pagamentoData}
                    />
                    <ApprovalRings
                      title="Taxa de Aprovacao por Metodo"
                      porPagamento={metrics?.por_pagamento || []}
                    />
                  </div>

                  <div className="grid gap-3.5" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <FunnelChart
                      title="Funil de Conversao (Meta Ads)"
                      data={metrics?.funil}
                    />
                    <ProgressList
                      title="Vendas por Fonte (UTM)"
                      items={fonteItems}
                    />
                  </div>

                  {/* Produtos table */}
                  <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
                    <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
                      Vendas por Produto
                    </div>
                    {produtoItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-[#8892a4] gap-2">
                        <span className="text-2xl">&#x1F4E6;</span>
                        <span className="text-sm">Sem dados</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px] border-collapse">
                          <thead>
                            <tr>
                              {['Produto', 'Vendas', 'Faturamento', '% do Total'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-[#8892a4] font-semibold uppercase text-[11px] tracking-[0.5px] border-b border-[#2a2d3e]">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2a2d3e]">
                            {produtoItems.map((p, idx) => (
                              <tr key={idx} className="hover:bg-[#6366f1]/5 transition-colors">
                                <td className="px-3 py-2.5 text-[#e2e8f0]">{p.label}</td>
                                <td className="px-3 py-2.5">{p.vendas}</td>
                                <td className="px-3 py-2.5">{fmt(p.value)}</td>
                                <td className="px-3 py-2.5">
                                  {totalFaturamento > 0
                                    ? fmtPct((p.value / totalFaturamento) * 100)
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Por Horario */}
              {activeTab === 'por-horario' && (
                <div className="grid grid-cols-2 gap-3.5 mt-1">
                  <BarChart
                    title="Receita por Hora (R$)"
                    labels={horaLabels}
                    datasets={barDatasets}
                  />
                  <LineChart
                    title="Acumulado ao Longo do Dia"
                    labels={horaLabels}
                    datasets={lineDatasets}
                  />
                </div>
              )}

              {/* Tab: Campanhas */}
              {activeTab === 'campanhas' && (
                <div className="mt-1">
                  {loadingCampaigns ? (
                    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-8 flex items-center justify-center gap-3 text-[#8892a4]">
                      <div className="spinner" />
                      Carregando campanhas...
                    </div>
                  ) : (
                    <CampaignsTable campaigns={campaigns} />
                  )}
                </div>
              )}

            </TabsPanel>
          </div>
        </>
      )}
    </div>
  );
}
