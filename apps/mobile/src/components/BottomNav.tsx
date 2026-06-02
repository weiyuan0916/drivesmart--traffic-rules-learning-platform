import { Home, BarChart2, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: 'questions' | 'stats' | 'settings';
  onTabChange: (tab: 'questions' | 'stats' | 'settings') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'questions' as const, label: t('questions'), icon: Home },
    { id: 'stats' as const, label: t('stats'), icon: BarChart2 },
    { id: 'settings' as const, label: t('settings'), icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--border)] bg-[var(--bg-secondary)] pb-safe pt-2"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--text-muted)]'
            }`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="mt-1 text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
