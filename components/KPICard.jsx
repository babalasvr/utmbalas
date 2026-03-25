'use client';

const ICONS = {
  faturamento: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  gasto: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  lucro: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  roi: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  cpa: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  arpu: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  pendentes: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  reembolsos: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.36"/>
    </svg>
  ),
};

const COLOR_MAP = {
  green:   { text: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.20)',  glow: 'glow-green'  },
  red:     { text: '#f43f5e', bg: 'rgba(244,63,94,0.10)',   border: 'rgba(244,63,94,0.20)',   glow: 'glow-red'    },
  yellow:  { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.20)',  glow: 'glow-yellow' },
  blue:    { text: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  border: 'rgba(56,189,248,0.20)',  glow: ''            },
  purple:  { text: '#a855f7', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.20)', glow: ''            },
  accent:  { text: '#6366f1', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.20)', glow: 'glow-accent' },
  default: { text: '#dde3f0', bg: 'transparent',            border: 'transparent',            glow: ''            },
};

export default function KPICard({ label, value, sub, color = 'default', icon }) {
  const c = COLOR_MAP[color] || COLOR_MAP.default;
  const iconKey = icon || label?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
  const iconEl = ICONS[iconKey];

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-[#0c0f18] p-5 flex flex-col gap-3
        transition-all duration-200 hover:bg-[#10141f] group cursor-default"
      style={{ borderColor: '#182030' }}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.9px] text-[#5c6e8a]">
          {label}
        </span>
        {iconEl && (
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-200"
            style={{ background: c.bg, color: c.text }}
          >
            {iconEl}
          </span>
        )}
      </div>

      {/* Value */}
      <div className={`text-[22px] font-bold tracking-tight leading-none ${c.glow}`}
        style={{ color: c.text }}>
        {value}
      </div>

      {/* Sub */}
      {sub && (
        <div className="text-[11px] text-[#5c6e8a] leading-tight">{sub}</div>
      )}

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: c.bg !== 'transparent' ? c.text : '#6366f1', opacity: undefined }}
      />
    </div>
  );
}
