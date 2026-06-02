import { Car, Clock, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ExamSetupProps {
  onStartExam: () => void;
  isLoading?: boolean;
}

export function ExamSetup({ onStartExam, isLoading }: ExamSetupProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-8">
      {/* Logo / Icon */}
      <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
        <Car size={48} className="text-[var(--color-primary)]" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
        DriveSmart
      </h1>
      <p className="text-sm text-[var(--color-primary)] font-medium mb-6">
        {t('theory600Title')}
      </p>

      {/* Description */}
      <p className="text-center text-[var(--text-secondary)] text-sm mb-8 max-w-xs">
        {t('examDescription')}
      </p>

      {/* Features */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Car size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">B1 License Exam</p>
            <p className="text-xs text-[var(--text-muted)]">30 questions from 600</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
            <Award size={20} className="text-[var(--color-success)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('passScore')}</p>
            <p className="text-xs text-[var(--text-muted)]">26/30 to pass</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center">
            <Clock size={20} className="text-[var(--color-warning)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No Time Limit</p>
            <p className="text-xs text-[var(--text-muted)]">Take your time</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStartExam}
        disabled={isLoading}
        className={`w-full max-w-sm py-4 rounded-xl font-bold text-lg transition-all min-h-[56px] ${
          isLoading
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98]'
        }`}
      >
        {isLoading ? t('loading') : t('startExam')}
      </button>
    </div>
  );
}
