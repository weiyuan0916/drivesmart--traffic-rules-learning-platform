import { Bike, CarFront, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DrivingLandingProps {
  onSelectCar: () => void;
  onSelectMotorcycle: () => void;
  onGoToLearning: () => void;
}

export default function DrivingLanding({ onSelectCar, onSelectMotorcycle, onGoToLearning }: DrivingLandingProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg-primary)] px-4 py-10 lg:px-8">
      <div className="w-full max-w-6xl space-y-6 lg:space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">{t('sim3dSubtitle')}</p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">{t('drivingLandingTitle')}</h1>
          <p className="mx-auto max-w-3xl text-sm text-[var(--text-secondary)] lg:text-lg">{t('drivingLandingDescription')}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <button
            type="button"
            onClick={onSelectCar}
            className="group rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 text-left shadow-[var(--shadow-md)] transition-transform hover:-translate-y-1 hover:bg-[var(--bg-tertiary)] lg:p-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600">
                <CarFront className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-[var(--text-secondary)] transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">{t('carTestMenu')}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] lg:text-base">{t('carTestDescription')}</p>
          </button>

          <button
            type="button"
            onClick={onSelectMotorcycle}
            className="group rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 text-left shadow-[var(--shadow-md)] transition-transform hover:-translate-y-1 hover:bg-[var(--bg-tertiary)] lg:p-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/15 text-amber-700">
                <Bike className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-[var(--text-secondary)] transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">{t('motorcycleTestMenu')}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] lg:text-base">{t('motorcycleTestDescription')}</p>
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onGoToLearning}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('backToLearning')}
          </button>
        </div>
      </div>
    </div>
  );
}
