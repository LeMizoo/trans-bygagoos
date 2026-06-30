import { useState, useEffect } from 'react';
import { Search, Calendar, Download, ChevronDown, RefreshCw } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

type TabKey = 'pointages' | 'courses' | 'versements' | 'depenses' | 'assistance';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const tabs: Tab[] = [
  { key: 'pointages', label: 'Pointages', icon: Calendar },
  { key: 'courses', label: 'Courses', icon: Search },
  { key: 'versements', label: 'Versements', icon: Download },
  { key: 'depenses', label: 'Dépenses', icon: ChevronDown },
  { key: 'assistance', label: 'Assistance', icon: RefreshCw },
];

export function JournauxPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pointages');
  const theme = useThemeStore((s) => s.theme);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journaux d'activité</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {Icon && <Icon size={18} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Affichage des logs pour : <strong>{tabs.find((t) => t.key === activeTab)?.label}</strong>
        </p>
      </div>
    </div>
  );
}
