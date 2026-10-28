'use client';

export default function BottomNav({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'riwayat', label: 'Riwayat' },
    { id: 'budget', label: 'Budget' },
    { id: 'insight', label: 'Insight' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto bg-white border-t border-gray-200 grid grid-cols-4 py-2 px-1 text-center shadow-lg z-20">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
            activeTab === item.id
              ? 'bg-neutral-800 text-white font-bold shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <div className="w-4 h-3.5 border-2 border-current rounded-sm mb-1" />
          <span className="text-[10px] sm:text-xs">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}