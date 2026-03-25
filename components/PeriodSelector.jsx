'use client';

const PERIODS = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7d',   label: '7 dias' },
  { key: '30d',  label: '30 dias' },
];

export default function PeriodSelector({ period, onChange, lastUpdated }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-1">
      {/* Segmented control */}
      <div className="flex items-center bg-[#0c0f18] border border-[#182030] rounded-lg p-0.5 gap-0.5">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150 ${
              period === p.key
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-[#5c6e8a] hover:text-[#dde3f0]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Live indicator */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-[11px] text-[#5c6e8a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] live-dot" />
          Atualizado às {lastUpdated}
        </div>
      )}
    </div>
  );
}
