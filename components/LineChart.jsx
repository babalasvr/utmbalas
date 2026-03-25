'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LineChart({ labels, datasets, title }) {
  if (!labels || !labels.length) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
        {title && (
          <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
            {title}
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-10 text-[#8892a4] gap-2">
          <span className="text-3xl">&#x1F4C8;</span>
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
    elements: {
      line: { tension: 0.3 },
    },
  };

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          {title}
        </div>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
}
