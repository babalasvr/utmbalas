'use client';

export default function Header({ activePage, onNavigate, metaConectado }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e] bg-[#1a1d27] sticky top-0 z-50">
      <div
        className="text-lg font-bold tracking-tight cursor-pointer select-none"
        onClick={() => onNavigate('dashboard')}
      >
        UTM<span className="text-[#6366f1]">Balas</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
            activePage === 'dashboard'
              ? 'border-[#6366f1] text-[#6366f1] bg-[#6366f1]/10'
              : 'border-[#2a2d3e] text-[#8892a4] hover:border-[#6366f1] hover:text-[#6366f1]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Dashboard
        </button>

        <button
          onClick={() => onNavigate('integracoes')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
            activePage === 'integracoes'
              ? 'border-[#6366f1] text-[#6366f1] bg-[#6366f1]/10'
              : 'border-[#2a2d3e] text-[#8892a4] hover:border-[#6366f1] hover:text-[#6366f1]'
          }`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Integracoes
        </button>

        <a
          href="/api/meta/auth"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${
            metaConectado
              ? 'border-[#22c55e] text-[#22c55e]'
              : 'border-[#2a2d3e] text-[#8892a4] bg-[#1e2130] hover:border-[#6366f1] hover:text-[#6366f1]'
          }`}
        >
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              metaConectado ? 'bg-[#22c55e] shadow-[0_0_6px_#22c55e]' : 'bg-[#8892a4]'
            }`}
          />
          Meta Ads
        </a>

        <span className="text-[11px] text-[#8892a4]">Atualiza a cada 30s</span>
      </div>
    </header>
  );
}
