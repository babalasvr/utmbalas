'use client';

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function cleanLabel(label) {
  if (!label) return '(direto)';
  // Remove o |ID do final e troca + por espaço
  return label.split('|')[0].replace(/\+/g, ' ').trim() || '(direto)';
}

const BAR_COLORS = ['#6366f1','#10b981','#38bdf8','#f59e0b','#a855f7','#f43f5e'];

export default function ProgressList({ items, title }) {
  if (!items || !items.length) {
    return (
      <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-5 h-full">
        {title && <SectionTitle>{title}</SectionTitle>}
        <Empty />
      </div>
    );
  }

  const maxVal = Math.max(...items.map(i => i.value || 0), 1);

  return (
    <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-5">
      {title && <SectionTitle>{title}</SectionTitle>}
      <div className="flex flex-col gap-3.5">
        {items.map((item, idx) => {
          const pct = ((item.value || 0) / maxVal) * 100;
          const color = BAR_COLORS[idx % BAR_COLORS.length];
          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[12px] text-[#8a95b0] truncate max-w-[160px]" title={cleanLabel(item.label)}>
                    {cleanLabel(item.label)}
                  </span>
                </div>
                <span className="text-[12px] font-semibold text-[#dde3f0] ml-2 flex-shrink-0">
                  {fmt(item.value)}
                </span>
              </div>
              <div className="h-1 bg-[#182030] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#5c6e8a] mb-4">
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-[#5c6e8a] gap-2">
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.4">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <span className="text-[12px]">Sem dados</span>
    </div>
  );
}
