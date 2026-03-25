'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function DonutChart({ labels, data, title }) {
  if (!labels || !labels.length) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
        {title && (
          <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
            {title}
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-10 text-[#8892a4] gap-2">
          <span className="text-3xl">&#x1F4CA;</span>
          <span className="text-sm">Sem dados</span>
        </div>
      </div>
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: COLORS.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#1a1d27',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8892a4',
          font: { size: 12 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${fmt(ctx.parsed)}`,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          {title}
        </div>
      )}
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
