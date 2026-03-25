'use client';

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ProgressList({ items, title }) {
  if (!items || !items.length) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
        {title && (
          <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
            {title}
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-8 text-[#8892a4] gap-2">
          <span className="text-2xl">&#x1F4CA;</span>
          <span className="text-sm">Sem dados</span>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...items.map(i => i.value || 0), 1);

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <div
              className="text-[12px] text-[#8892a4] overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ minWidth: 120 }}
            >
              {item.label || '(sem nome)'}
            </div>
            <div className="flex-1 bg-[#1e2130] rounded h-1.5 overflow-hidden">
              <div
                className="h-full rounded bg-[#6366f1] transition-all duration-500"
                style={{ width: `${((item.value || 0) / maxVal) * 100}%` }}
              />
            </div>
            <div className="text-[12px] font-semibold text-[#e2e8f0] text-right" style={{ minWidth: 80 }}>
              {fmt(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
