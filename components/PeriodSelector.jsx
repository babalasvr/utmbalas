'use client';

const PERIODS = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
];

export default function PeriodSelector({ period, onChange, lastUpdated }) {
  return (
    <div className="flex items-center gap-2 px-6 pt-5">
      {PERIODS.map(p => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`px-4 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
            period === p.key
              ? 'bg-[#6366f1] border-[#6366f1] text-white'
              : 'border-[#2a2d3e] text-[#8892a4] hover:border-[#6366f1] hover:text-[#6366f1]'
          }`}
        >
          {p.label}
        </button>
      ))}
      {lastUpdated && (
        <span className="ml-auto text-[11px] text-[#8892a4]">
          Atualizado: {lastUpdated}
        </span>
      )}
    </div>
  );
}
