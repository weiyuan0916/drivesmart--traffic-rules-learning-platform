import React, { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle2, ChevronDown, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { SmoothScroll } from './SmoothScroll';
import examSetupAvatar from '../assets/exam-setup-avatar.png';

const TRAINING_OPTIONS = [
  'CƠ SỞ ĐÀO TẠO SÁT HẠCH LÁI XE',
  'TRUNG TÂM SÁT HẠCH LÁI XE HẢI DƯƠNG',
  'TRUNG TÂM SÁT HẠCH LÁI XE HÀ NỘI',
  'TRUNG TÂM SÁT HẠCH LÁI XE HƯNG YÊN',
  'TRUNG TÂM SÁT HẠCH LÁI XE GIA LAI',
];

const DEFAULT_TRAINING_CENTER = 'TRUNG TÂM SÁT HẠCH LÁI XE GIA LAI';

const COURSE_OPTIONS = ['TỰ LUYỆN LÝ THUYẾT', 'KHÓA 25B1K01', 'KHÓA 25B1K02', 'KHÓA 25B1K03'];

const VEHICLE_OPTIONS = ['Ô tô', 'Mô tô'] as const;
type VehicleType = (typeof VEHICLE_OPTIONS)[number];

const OTO_RANK_OPTIONS = [
  'Ô tô hạng B (tự động & sàn)',
  'Ô tô hạng C1',
  'Ô tô hạng C',
  'Ô tô hạng D1',
  'Ô tô hạng D2',
  'Ô tô hạng D',
  'Ô tô hạng BE',
  'Ô tô hạng C1E',
  'Ô tô hạng CE',
  'Ô tô hạng D1E',
  'Ô tô hạng D2E',
  'Ô tô hạng DE',
];

const MOTO_RANK_OPTIONS = ['Mô tô hạng A1 (dưới 125cc)', 'Mô tô hạng A (trên 125 cc)**'];

const OTO_GROUP_LABEL = '+ Ô TÔ NĂM 2025 - bộ công an';
const MOTO_GROUP_LABEL = '+ HẠNG MÔ TÔ - Bộ công an';

const EXAM_PAPER_GROUPS: { label: string; options: string[] }[] = [
  { label: 'Đề thi ngẫu nhiên', options: ['Ngẫu nhiên'] },
  {
    label: 'Đề thi cố định để ôn tập (20 đề)',
    options: Array.from({ length: 20 }, (_, i) => `Cố định ${i + 1}`),
  },
];

function rankOptionsForVehicle(v: VehicleType): { label: string; options: string[] }[] {
  return [
    {
      label: v === 'Ô tô' ? OTO_GROUP_LABEL : MOTO_GROUP_LABEL,
      options: v === 'Ô tô' ? OTO_RANK_OPTIONS : MOTO_RANK_OPTIONS,
    },
  ];
}

interface ExamSetupScreenProps {
  onStartExam: () => void;
}

const ExamSetupScreen: React.FC<ExamSetupScreenProps> = ({ onStartExam }) => {
  const { t } = useLanguage();
  const [candidateName, setCandidateName] = useState('LÊ VĂN TÙNG');
  const [examPaper, setExamPaper] = useState('Ngẫu nhiên');
  const [trainingCenter, setTrainingCenter] = useState(DEFAULT_TRAINING_CENTER);
  const [course, setCourse] = useState(COURSE_OPTIONS[0]);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Ô tô');
  const [licenseRank, setLicenseRank] = useState(OTO_RANK_OPTIONS[0]);
  const [verified, setVerified] = useState(false);

  const statusLabel = useMemo(
    () => (verified ? t('setupStatusVerified') : t('setupStatusPending')),
    [verified, t],
  );

  const canStart = verified && candidateName.trim().length > 0;

  const licenseGroups = useMemo(() => rankOptionsForVehicle(vehicleType), [vehicleType]);

  const onVehicleChange = (v: VehicleType) => {
    setVehicleType(v);
    setLicenseRank(v === 'Ô tô' ? OTO_RANK_OPTIONS[0] : MOTO_RANK_OPTIONS[0]);
    setVerified(false);
  };

  return (
    <SmoothScroll className="relative flex min-h-0 w-full flex-1 flex-col bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] text-[var(--text-primary)] dark:bg-gradient-to-b dark:from-[#12142a] dark:via-[#0f1020] dark:to-[var(--bg-primary)]">
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher className="relative flex items-center gap-2" />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
        <header className="text-center">
          <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)] sm:text-2xl">
            {t('theory600Title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('version2026')}</p>
        </header>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-full bg-sky-400/25 blur-md dark:bg-cyan-400/25"
              aria-hidden
            />
            <img
              src={examSetupAvatar}
              alt=""
              className="relative h-24 w-24 rounded-full border-2 border-sky-500/55 object-cover shadow-lg shadow-sky-500/25 ring-2 ring-white dark:border-cyan-400/60 dark:shadow-cyan-500/20 dark:ring-0 sm:h-28 sm:w-28"
            />
          </div>
          <label className="w-full max-w-xs">
            <span className="sr-only">{t('candidateName')}</span>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => {
                setCandidateName(e.target.value);
                setVerified(false);
              }}
              className="w-full border-b-2 border-[var(--border)] bg-transparent py-1.5 text-center text-base font-bold uppercase tracking-wide text-[var(--text-primary)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:border-blue-600 focus:bg-transparent dark:border-transparent dark:placeholder:text-[var(--text-secondary)] dark:focus:border-cyan-500/50"
              placeholder={t('candidateName')}
            />
          </label>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 shadow-sm shadow-slate-900/[0.06] ring-1 ring-black/[0.03] dark:shadow-none dark:ring-0">
          <div className="space-y-3 text-sm">
            <div className="flex flex-col gap-2">
              <span className="block text-center text-[var(--text-secondary)]">
                {t('chooseExamPaper')}
              </span>
              <div className="relative w-full min-w-0">
                <SelectField
                  variant="compact"
                  textAlign="center"
                  value={examPaper}
                  onChange={(v) => {
                    setExamPaper(v);
                    setVerified(false);
                  }}
                  groups={EXAM_PAPER_GROUPS}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-start sm:gap-4">
              <span className="shrink-0 text-left text-[var(--text-secondary)]">{t('gplxRank')}</span>
              <span className="min-w-0 flex-1 text-center font-semibold leading-snug text-[var(--text-primary)]">
                {licenseRank}
              </span>
            </div>
            <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-start sm:gap-4">
              <span className="shrink-0 text-left text-[var(--text-secondary)]">{t('status')}</span>
              <span className="flex min-w-0 flex-1 justify-center">
                <span className="inline-flex items-center justify-center gap-1.5 text-center font-semibold text-[var(--text-primary)]">
                  {statusLabel}
                  {verified ? (
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                  ) : (
                    <AlertCircle
                      className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500"
                      aria-hidden
                    />
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <SelectField
            value={trainingCenter}
            onChange={(v) => {
              setTrainingCenter(v);
              setVerified(false);
            }}
            options={TRAINING_OPTIONS}
          />
          <SelectField
            value={course}
            onChange={(v) => {
              setCourse(v);
              setVerified(false);
            }}
            options={COURSE_OPTIONS}
          />
          <SelectField
            value={vehicleType}
            onChange={(v) => onVehicleChange(v as VehicleType)}
            options={[...VEHICLE_OPTIONS]}
          />
          <SelectField
            textAlign="center"
            value={licenseRank}
            onChange={(v) => {
              setLicenseRank(v);
              setVerified(false);
            }}
            groups={licenseGroups}
          />
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <button
            type="button"
            onClick={() => setVerified(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 px-4 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-900/35 transition-colors hover:bg-orange-600 active:scale-[0.99] dark:bg-orange-500 dark:shadow-orange-600/25 dark:hover:bg-orange-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {t('verifyCandidate')}
          </button>
          <button
            type="button"
            disabled={!canStart}
            onClick={onStartExam}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-4 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_10px_40px_-6px_rgba(5,150,105,0.5),0_4px_14px_-4px_rgba(21,128,61,0.38)] ring-1 ring-white/20 transition-all hover:from-emerald-500 hover:to-green-600 hover:shadow-[0_14px_44px_-6px_rgba(5,150,105,0.55),0_6px_18px_-4px_rgba(21,128,61,0.42)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-none disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] disabled:shadow-none disabled:ring-0 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-green-600 dark:text-white dark:shadow-[0_10px_36px_-6px_rgba(16,185,129,0.45)] dark:ring-emerald-400/25 dark:hover:from-emerald-400 dark:hover:to-green-500 dark:disabled:bg-none dark:disabled:bg-[var(--bg-hover)] dark:disabled:text-[var(--text-secondary)] dark:disabled:shadow-none"
          >
            {t('startExamNow')}
          </button>
        </div>

        <p className="text-center text-[11px] font-medium leading-relaxed text-red-600 dark:text-red-400">
          {t('setupDisclaimer')}
        </p>

        <footer className="flex items-center justify-center gap-10 pb-4 text-sm text-[var(--text-secondary)]">
          <button
            type="button"
            className="inline-flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-cyan-400"
          >
            <BookOpen className="h-5 w-5" />
            {t('guide')}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-cyan-400"
          >
            <Headphones className="h-5 w-5" />
            {t('support')}
          </button>
        </footer>
      </div>
    </SmoothScroll>
  );
};

function SelectField({
  value,
  onChange,
  options,
  groups,
  disabled,
  variant = 'default',
  textAlign = 'left',
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  groups?: { label: string; options: string[] }[];
  disabled?: boolean;
  variant?: 'default' | 'compact';
  textAlign?: 'left' | 'center' | 'right';
}) {
  const padding = variant === 'compact' ? 'py-2 pl-3 pr-9' : 'py-3.5 pl-4 pr-10';
  const textSize = variant === 'compact' ? 'text-sm' : 'text-sm';
  const alignClass =
    textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xl border font-semibold outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${padding} ${textSize} ${alignClass} border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm ring-1 ring-black/[0.04] hover:border-[var(--text-muted)] focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-[var(--border)] dark:bg-[var(--bg-tertiary)] dark:shadow-none dark:ring-0 dark:hover:border-[var(--border)] dark:focus:border-transparent dark:focus:ring-cyan-500/40`}
      >
        {groups
          ? groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </optgroup>
            ))
          : (options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
    </div>
  );
}

export default ExamSetupScreen;
