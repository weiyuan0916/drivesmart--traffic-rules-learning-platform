import React from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { dashboardNavItems, type DashboardTabId } from './dashboardNavItems';

const spring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.78,
};

const iconSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 28,
  mass: 0.45,
};

interface MobileDashboardTabBarProps {
  active: DashboardTabId;
  onChange: (id: DashboardTabId) => void;
}

const MobileDashboardTabBar: React.FC<MobileDashboardTabBarProps> = ({ active, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 32, mass: 0.9 }}
        className="pointer-events-auto w-full max-w-lg"
      >
        <div
          className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_12px_40px_-10px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-[1.5] dark:border-white/10 dark:bg-[#12131f]/72 dark:shadow-[0_16px_56px_-12px_rgba(0,0,0,0.65)]"
          style={{ WebkitBackdropFilter: 'blur(28px) saturate(160%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-100/40 to-transparent dark:from-white/[0.07]"
          />
          <LayoutGroup id="dashboard-mobile-tabs">
            <div className="relative grid grid-cols-3 gap-1">
              {dashboardNavItems.map(({ id, icon: Icon, labelKey }) => {
                const isActive = active === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                    className="relative flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="dashboard-mobile-tab-pill"
                        className="absolute inset-0 rounded-[1.15rem] bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_10px_28px_-6px_rgba(37,99,235,0.65),inset_0_1px_0_rgba(255,255,255,0.22)]"
                        transition={spring}
                      />
                    ) : null}
                    <motion.span
                      className="relative z-[1] flex flex-col items-center gap-0.5"
                      animate={{ scale: isActive ? 1.02 : 1, y: isActive ? -1 : 0 }}
                      transition={iconSpring}
                    >
                      <motion.span
                        animate={{
                          scale: isActive ? 1.08 : 1,
                          filter: isActive ? 'brightness(1.12)' : 'none',
                        }}
                        transition={iconSpring}
                      >
                        <Icon
                          className={`h-6 w-6 ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}
                          strokeWidth={isActive ? 2.25 : 2}
                        />
                      </motion.span>
                      <span
                        className={`max-w-full truncate text-center text-[11px] font-semibold leading-tight tracking-tight sm:text-xs ${
                          isActive ? 'text-white' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {t(labelKey)}
                      </span>
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileDashboardTabBar;
