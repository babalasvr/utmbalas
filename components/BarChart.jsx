'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ labels, datasets, title }) {
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

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: '#8892a4', font: { size: 11 } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8892a4', font: { size: 11 } },
        grid: { color: '#2a2d3e' },
      },
      y: {
        ticks: {
          color: '#8892a4',
          font: { size: 11 },
          callback: (v) => 'R$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v),
        },
        grid: { color: '#2a2d3e' },
      },
    },
  };

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          {title}
        </div>
      )}
      <Bar data={chartData} options={options} />
    </div>
  );
}
