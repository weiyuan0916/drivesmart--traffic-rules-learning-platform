import React from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { Car } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { dashboardNavItems, type DashboardTabId } from './dashboardNavItems';

const spring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.78,
};

interface DashboardDesktopHeaderProps {
  active: DashboardTabId;
  onChange: (id: DashboardTabId) => void;
}

const DashboardDesktopHeader: React.FC<DashboardDesktopHeaderProps> = ({ active, onChange }) => {
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-[45] flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/95 px-4 shadow-sm backdrop-blur-md lg:px-6">
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Car className="h-5 w-5 text-white" />
        </div>
        <span className="truncate font-bold tracking-tight text-[var(--text-primary)]">DriveSmart</span>
      </div>

      <LayoutGroup id="dashboard-desktop-tabs">
        <nav
          className="mx-auto flex max-w-2xl flex-1 items-center justify-center gap-1 sm:gap-2"
          aria-label="Dashboard"
        >
          {dashboardNavItems.map(({ id, icon: Icon, labelKey }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/60 sm:px-4"
              >
                {isActive ? (
                  <motion.div
                    layoutId="dashboard-desktop-tab-pill"
                    className="absolute inset-0 rounded-xl bg-blue-600 shadow-md shadow-blue-600/25"
                    transition={spring}
                  />
                ) : null}
                <span className="relative z-[1] flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}
                    strokeWidth={isActive ? 2.25 : 2}
                  />
                  <span className={`hidden sm:inline ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                    {t(labelKey)}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

      <div className="flex shrink-0 items-center justify-end">
        <LanguageSwitcher className="relative right-auto top-auto z-auto flex items-center gap-2" />
      </div>
    </header>
  );
};

export default DashboardDesktopHeader;
