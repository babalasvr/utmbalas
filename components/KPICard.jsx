'use client';

const colorMap = {
  green: 'text-[#22c55e]',
  red: 'text-[#ef4444]',
  yellow: 'text-[#f59e0b]',
  blue: 'text-[#3b82f6]',
  purple: 'text-[#a855f7]',
  default: 'text-[#e2e8f0]',
};

export default function KPICard({ label, value, sub, color = 'default' }) {
  const valueColor = colorMap[color] || colorMap.default;

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4 flex flex-col gap-1.5 hover:border-[#6366f1] transition-colors">
      <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#8892a4]">
        {label}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-[#8892a4]">{sub}</div>
      )}
    </div>
  );
}
