'use client';

export default function TabsPanel({ tabs, activeTab, onChange, children }) {
  return (
    <div>
      <div className="flex gap-1 border-b border-[#2a2d3e] mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 border-b-2 text-[13px] font-medium transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-[#6366f1] text-[#6366f1]'
                : 'border-transparent text-[#8892a4] hover:text-[#e2e8f0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
