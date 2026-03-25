'use client';

export default function TabsPanel({ tabs, activeTab, onChange, children }) {
  return (
    <div>
      <div className="flex gap-0 border-b border-[#182030] mb-5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative px-5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'text-[#dde3f0]'
                : 'text-[#5c6e8a] hover:text-[#8a95b0]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1] rounded-t-full" />
            )}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
