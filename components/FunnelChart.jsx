'use client';

const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');

const STEPS_CONFIG = [
  { key: 'clicks',         label: 'Cliques',       color: '#6366f1' },
  { key: 'pageViews',      label: 'Vis. Página',   color: '#7c3aed' },
  { key: 'checkouts',      label: 'ICs',           color: '#9333ea' },
  { key: 'salesInitiated', label: 'Vendas Inic.',  color: '#c026d3' },
  { key: 'salesApproved',  label: 'Vendas Apr.',   color: '#db2777' },
];

export default function FunnelChart({ data, title }) {
  const steps = STEPS_CONFIG.map(s => ({
    ...s,
    value: data?.[s.key] || 0,
  }));

  const maxVal = steps[0].value || 0;
  const hasData = maxVal > 0;

  const W = 560;
  const H = 150;
  const cy = H / 2;
  const segW = W / steps.length;
  const MIN_FRAC = 0.08;

  const fracs = steps.map(s =>
    maxVal > 0 ? Math.max(s.value / maxVal, MIN_FRAC) : MIN_FRAC
  );
  const halfH = fracs.map(f => (f * H) / 2);

  // Cada secao: trapezoid da etapa i para i+1 com bezier curves
  const sections = steps.map((step, i) => {
    const lx   = i * segW;
    const rx   = (i + 1) * segW;
    const midx = (lx + rx) / 2;
    const lh   = halfH[i];
    const rh   = i < steps.length - 1 ? halfH[i + 1] : halfH[i];

    const d = [
      `M ${lx} ${cy - lh}`,
      `C ${midx} ${cy - lh}, ${midx} ${cy - rh}, ${rx} ${cy - rh}`,
      `L ${rx} ${cy + rh}`,
      `C ${midx} ${cy + rh}, ${midx} ${cy + lh}, ${lx} ${cy + lh}`,
      'Z',
    ].join(' ');

    const pct = maxVal > 0 ? (step.value / maxVal) * 100 : 0;
    const midXCenter = lx + segW / 2;

    return { ...step, d, pct, midXCenter };
  });

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-4">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold text-[#8892a4] uppercase tracking-[0.6px]">
            {title}
          </div>
          {!hasData && (
            <span className="text-[11px] text-[#555e70]">Aguardando dados do Meta Pixel</span>
          )}
        </div>
      )}

      {/* Labels acima */}
      <div className="flex mb-1" style={{ width: W, maxWidth: '100%' }}>
        {sections.map(s => (
          <div
            key={s.key}
            className="flex-1 text-center text-[11px] font-bold text-[#8892a4] uppercase tracking-[0.4px]"
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* SVG Funil */}
      <div className="overflow-x-auto">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block mx-auto"
          style={{ maxWidth: '100%' }}
        >
          {sections.map(s => (
            <path
              key={s.key}
              d={s.d}
              fill={hasData ? s.color : '#2a2d3e'}
              opacity={hasData ? 0.92 : 1}
            />
          ))}
          {/* Percentuais no centro de cada etapa */}
          {hasData && sections.map(s => (
            <text
              key={s.key + '_pct'}
              x={s.midXCenter}
              y={cy + 5}
              textAnchor="middle"
              fill="white"
              fontSize="13"
              fontWeight="bold"
            >
              {s.pct.toFixed(1)}%
            </text>
          ))}
        </svg>
      </div>

      {/* Contagens abaixo */}
      <div className="flex mt-1" style={{ width: W, maxWidth: '100%' }}>
        {sections.map(s => (
          <div key={s.key} className="flex-1 text-center">
            <span
              className="text-[12px] font-semibold"
              style={{ color: hasData ? s.color : '#555e70' }}
            >
              {fmtNum(s.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
