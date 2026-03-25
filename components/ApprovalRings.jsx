'use client';

const COLORS = ['#6366f1','#10b981','#38bdf8','#f59e0b','#a855f7','#f43f5e'];
const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');

export default function ApprovalRings({ porPagamento, title }) {
  if (!porPagamento || !porPagamento.length) {
    return (
      <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-5">
        {title && <SectionTitle>{title}</SectionTitle>}
        <Empty />
      </div>
    );
  }

  const total = porPagamento.reduce((s, p) => s + (p.vendas || 0), 0);
  const methods = porPagamento.slice(0, 6);

  return (
    <div className="bg-[#0c0f18] border border-[#182030] rounded-xl p-5">
      {title && <SectionTitle>{title}</SectionTitle>}
      <div className="flex flex-wrap gap-6 justify-center">
        {methods.map((p, i) => {
          const pct = total > 0 ? (p.vendas / total) * 100 : 0;
          const color = COLORS[i % COLORS.length];
          const size = 88;
          const r = 34;
          const circ = 2 * Math.PI * r;
          const dash = (pct / 100) * circ;
          const name = (p.payment_method || 'N/A').replace(/_/g, ' ');

          return (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <svg width={size} height={size} viewBox="0 0 88 88">
                {/* Track */}
                <circle cx="44" cy="44" r={r} fill="none" stroke="#182030" strokeWidth="8"/>
                {/* Progress */}
                <circle
                  cx="44" cy="44" r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 44 44)"
                  style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
                {/* Percentage */}
                <text x="44" y="48" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">
                  {pct.toFixed(0)}%
                </text>
              </svg>
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.6px]" style={{ color }}>
                  {name}
                </div>
                <div className="text-[12px] text-[#5c6e8a] mt-0.5">
                  {fmtNum(p.vendas)} vendas
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#5c6e8a] mb-4">{children}</div>;
}
function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-[#5c6e8a] gap-2">
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.4">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span className="text-[12px]">Sem dados</span>
    </div>
  );
}
