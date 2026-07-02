import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { LogoWithTheme } from './ui/LogoWithTheme';

const DashboardDesktopHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[45] flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 lg:px-6">
      {/* Spacer for back button */}
      <div className="w-24 shrink-0" />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <LogoWithTheme className="h-9" />
        </div>
      </div>
      
      {/* Spacer for language switcher */}
      <div className="w-24 shrink-0" />

      <div className="flex shrink-0 items-center justify-end gap-1">
        <LanguageSwitcher className="relative right-auto top-auto z-auto flex items-center gap-2" />
      </div>
    </header>
  );
};

export default DashboardDesktopHeader;
