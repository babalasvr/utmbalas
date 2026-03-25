'use client';

export default function Header({ activePage, onNavigate, metaConectado }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14
      border-b border-[#182030] bg-[#07090e]/80 backdrop-blur-xl">

      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-[0_0_14px_rgba(99,102,241,0.5)]">
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span className="text-[15px] font-bold tracking-tight text-[#dde3f0]">
          UTM<span className="text-[#6366f1]">Balas</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1.5">
        <NavBtn
          active={activePage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
          icon={
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          }
          label="Dashboard"
        />
        <NavBtn
          active={activePage === 'integracoes'}
          onClick={() => onNavigate('integracoes')}
          icon={
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="12" r="3"/>
              <circle cx="19" cy="5" r="2"/>
              <circle cx="19" cy="19" r="2"/>
              <line x1="12" y1="12" x2="17.2" y2="6.3"/>
              <line x1="12" y1="12" x2="17.2" y2="17.7"/>
            </svg>
          }
          label="Integrações"
        />

        <div className="w-px h-5 bg-[#182030] mx-1" />

        {/* Meta status */}
        <a
          href="/api/meta/auth"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
            metaConectado
              ? 'bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] text-[#10b981] hover:bg-[rgba(16,185,129,0.14)]'
              : 'bg-[#0c0f18] border border-[#182030] text-[#5c6e8a] hover:border-[#6366f1] hover:text-[#6366f1]'
          }`}
        >
          <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
            metaConectado ? 'bg-[#10b981] live-dot' : 'bg-[#5c6e8a]'
          }`} />
          Meta Ads
        </a>
      </nav>
    </header>
  );
}

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        active
          ? 'bg-[rgba(99,102,241,0.12)] text-[#6366f1] border border-[rgba(99,102,241,0.25)]'
          : 'text-[#5c6e8a] hover:text-[#dde3f0] hover:bg-[#10141f] border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
