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
    <div className="min-h-screen bg-[#07090e]">
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

          <div className="px-6 py-4 flex flex-col gap-4 max-w-[1600px] mx-auto">

            {/* KPI Grid */}
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))' }}>
              <KPICard
                label="Faturamento"
                icon="faturamento"
                value={metrics ? fmt(metrics.faturamento) : '—'}
                sub={metrics ? `${fmtNum(metrics.vendas)} vendas aprovadas` : 'Aguardando dados'}
                color="accent"
              />
              <KPICard
                label="Valor Gasto"
                icon="gasto"
                value={metrics ? fmt(metrics.gasto) : '—'}
                sub={metrics?.meta_conectado ? 'Meta Ads conectado' : 'Meta não conectado'}
                color="red"
              />
              <KPICard
                label="Lucro"
                icon="lucro"
                value={metrics ? fmt(metrics.lucro) : '—'}
                sub={metrics ? `Margem: ${fmtPct(metrics.margem)}` : '—'}
                color={lucroColor}
              />
              <KPICard
                label="ROI"
                icon="roi"
                value={metrics ? fmtX(metrics.roi) : '—'}
                sub="Retorno sobre investimento"
                color="yellow"
              />
              <KPICard
                label="CPA"
                icon="cpa"
                value={metrics ? fmt(metrics.cpa) : '—'}
                sub="Custo por aquisição"
                color="blue"
              />
              <KPICard
                label="ARPU"
                icon="arpu"
                value={metrics ? fmt(metrics.arpu) : '—'}
                sub="Receita por venda"
                color="default"
              />
              <KPICard
                label="Pendentes"
                icon="pendentes"
                value={metrics ? fmt(metrics.pendentes) : '—'}
                sub="Aguardando pagamento"
                color="yellow"
              />
              <KPICard
                label="Reembolsos"
                icon="reembolsos"
                value={metrics ? fmt(metrics.reembolsadas) : '—'}
                sub="Total devolvido"
                color="purple"
              />
            </div>

            {/* Tabs */}
            <TabsPanel tabs={TABS} activeTab={activeTab} onChange={setActiveTab}>

              {/* Tab: Visão Geral */}
              {activeTab === 'visao-geral' && (
                <div className="flex flex-col gap-4">

                  <div className="grid grid-cols-2 gap-4">
                    <DonutChart
                      title="Vendas por Forma de Pagamento"
                      labels={pagamentoLabels}
                      data={pagamentoData}
                    />
                    <ApprovalRings
                      title="Taxa de Aprovação por Método"
                      porPagamento={metrics?.por_pagamento || []}
                    />
                  </div>

                  <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <FunnelChart
                      title="Funil de Conversão (Meta Ads)"
                      data={metrics?.funil}
                    />
                    <ProgressList
                      title="Vendas por Fonte (UTM)"
                      items={fonteItems}
                    />
                  </div>

                  {/* Produtos */}
                  <div className="bg-[#0c0f18] border border-[#182030] rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#182030] flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#5c6e8a]">
                        Vendas por Produto
                      </span>
                      {produtoItems.length > 0 && (
                        <span className="text-[11px] text-[#5c6e8a]">{produtoItems.length} produtos</span>
                      )}
                    </div>
                    {produtoItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-[#5c6e8a] gap-2">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.4">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        <span className="text-[12px]">Sem dados</span>
                      </div>
                    ) : (
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-[#182030]">
                            {['Produto', 'Vendas', 'Faturamento', '% do Total'].map(h => (
                              <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.7px] text-[#5c6e8a]">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {produtoItems.map((p, idx) => (
                            <tr key={idx} className="border-b border-[#10141f] hover:bg-[#10141f] transition-colors">
                              <td className="px-5 py-3 text-[#dde3f0] font-medium">{p.label}</td>
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[rgba(99,102,241,0.12)] text-[#6366f1]">
                                  {p.vendas}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-semibold text-[#dde3f0]">{fmt(p.value)}</td>
                              <td className="px-5 py-3 text-[#8a95b0]">
                                {totalFaturamento > 0 ? fmtPct((p.value / totalFaturamento) * 100) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Por Horário */}
              {activeTab === 'por-horario' && (
                <div className="grid grid-cols-2 gap-4">
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
                <div>
                  {loadingCampaigns ? (
                    <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-10 flex items-center justify-center gap-3 text-[#5c6e8a]">
                      <div className="spinner" />
                      <span className="text-[13px]">Carregando campanhas...</span>
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
