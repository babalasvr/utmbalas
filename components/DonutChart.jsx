'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#6366f1','#10b981','#38bdf8','#f59e0b','#a855f7','#f43f5e','#14b8a6','#f97316'];

const fmt = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DonutChart({ labels, data, title }) {
  if (!labels || !labels.length) {
    return <ChartCard title={title}><Empty /></ChartCard>;
  }

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: COLORS.slice(0, data.length),
      borderWidth: 3,
      borderColor: '#0c0f18',
      hoverBorderColor: '#0c0f18',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8a95b0',
          font: { size: 11 },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#0c0f18',
        borderColor: '#182030',
        borderWidth: 1,
        titleColor: '#dde3f0',
        bodyColor: '#8a95b0',
        padding: 10,
        callbacks: {
          label: (ctx) => `  ${ctx.label}: ${fmt(ctx.parsed)}`,
        },
      },
    },
    cutout: '70%',
  };

  return (
    <ChartCard title={title}>
      <Doughnut data={chartData} options={options} />
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-5">
      {title && (
        <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#5c6e8a] mb-4">{title}</div>
      )}
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-[#5c6e8a] gap-2">
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.4">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
      <span className="text-[12px]">Sem dados</span>
    </div>
  );
}
