import React from 'react';
import { Car } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const DashboardDesktopHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[45] flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 lg:px-6">
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--text-primary)]">
          <Car className="h-5 w-5 text-[var(--bg-primary)]" />
        </div>
        <span className="truncate font-bold tracking-tight text-[var(--text-primary)]">DriveSmart</span>
      </div>

      <div className="flex-1" />

      <div className="flex shrink-0 items-center justify-end gap-1">
        <LanguageSwitcher className="relative right-auto top-auto z-auto flex items-center gap-2" />
      </div>
    </header>
  );
};

export default DashboardDesktopHeader;
