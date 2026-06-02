import React from 'react';
import { Car, Settings } from 'lucide-react';

interface DashboardDesktopHeaderProps {
  onOpenSettings: () => void;
}

const DashboardDesktopHeader: React.FC<DashboardDesktopHeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[45] flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 lg:px-6">
      {/* Spacer for back button */}
      <div className="w-24 shrink-0" />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--text-primary)]">
            <Car className="h-5 w-5 text-[var(--bg-primary)]" />
          </div>
          <span className="truncate font-bold tracking-tight text-[var(--text-primary)]">DriveSmart</span>
        </div>
      </div>
      
      {/* Spacer for language switcher */}
      <div className="w-24 shrink-0" />

      <div className="flex shrink-0 items-center justify-end gap-1">
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm transition-colors hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)]"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

export default DashboardDesktopHeader;
