'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ labels, datasets, title }) {
  if (!labels || !labels.length) {
    return <ChartCard title={title}><Empty /></ChartCard>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c0f18',
        borderColor: '#182030',
        borderWidth: 1,
        titleColor: '#dde3f0',
        bodyColor: '#8a95b0',
        padding: 10,
        callbacks: {
          label: (ctx) => ` R$ ${Number(ctx.parsed.y).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#5c6e8a', font: { size: 10 }, maxTicksLimit: 12 },
        grid: { color: '#111827', drawBorder: false },
        border: { display: false },
      },
      y: {
        ticks: {
          color: '#5c6e8a',
          font: { size: 10 },
          callback: (v) => v === 0 ? '0' : 'R$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v),
        },
        grid: { color: '#111827', drawBorder: false },
        border: { display: false },
      },
    },
  };

  return (
    <ChartCard title={title}>
      <Bar data={{ labels, datasets }} options={options} />
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
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <span className="text-[12px]">Sem dados</span>
    </div>
  );
}
