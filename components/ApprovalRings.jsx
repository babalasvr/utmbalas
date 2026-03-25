'use client';

const COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899'];
const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');

export default function ApprovalRings({ porPagamento, title }) {
  if (!porPagamento || !porPagamento.length) {
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

  const total = porPagamento.reduce((s, p) => s + (p.vendas || 0), 0);
  const methods = porPagamento.slice(0, 6);

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px] mb-4">
          {title}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {methods.map((p, i) => {
          const pct = total > 0 ? (p.vendas / total) * 100 : 0;
          const color = COLORS[i % COLORS.length];
          const size = 70;
          const r = 28;
          const circ = 2 * Math.PI * r;
          const dash = (pct / 100) * circ;
          const name = (p.payment_method || 'N/A').toUpperCase().replace('_', ' ');

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx="35" cy="35" r={r} fill="none" stroke="#2a2d3e" strokeWidth="7" />
                <circle
                  cx="35"
                  cy="35"
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="7"
                  strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
                  strokeDashoffset={(circ / 4).toFixed(1)}
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                />
                <text x="35" y="39" textAnchor="middle" fill={color} fontSize="12" fontWeight="700">
                  {pct.toFixed(0)}%
                </text>
              </svg>
              <div className="text-[11px] text-[#8892a4] text-center max-w-[70px]">{name}</div>
              <div className="text-[13px] font-bold" style={{ color }}>{fmtNum(p.vendas)} vendas</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
