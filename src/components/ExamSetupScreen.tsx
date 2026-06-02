import React, { useMemo, useState, useEffect } from 'react';
import { Car, CheckCircle2, ChevronDown, Bike, Clock, FileQuestion, ShieldCheck, Play, Loader2, Check, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { LicenseType, EXAM_CONFIGS } from '../services/examGenerator';

const TRAINING_OPTIONS = [
  'CƠ SỞ ĐÀO TẠO SÁT HẠCH LÁI XE',
  'TRUNG TÂM SÁT HẠCH LÁI XE HẢI DƯƠNG',
  'TRUNG TÂM SÁT HẠCH LÁI XE HÀ NỘI',
  'TRUNG TÂM SÁT HẠCH LÁI XE HƯNG YÊN',
  'TRUNG TÂM SÁT HẠCH LÁI XE GIA LAI',
];
const DEFAULT_TRAINING_CENTER = 'TRUNG TÂM SÁT HẠCH LÁI XE GIA LAI';
const COURSE_OPTIONS = ['TỰ LUYỆN LÝ THUYẾT', 'KHÓA 25B1K01', 'KHÓA 25B1K02', 'KHÓA 25B1K03'];

const VEHICLE_OPTIONS = [
  { id: 'car' as const, label: 'Ô tô', icon: Car },
  { id: 'moto' as const, label: 'Mô tô', icon: Bike },
];

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

const MOTO_RANK_OPTIONS = ['Mô tô hạng A1 (dưới 125cc)', 'Mô tô hạng A (trên 125 cc)'];

const OTO_GROUP_LABEL = '+ Ô TÔ NĂM 2025 - bộ công an';
const MOTO_GROUP_LABEL = '+ HẠNG MÔ TÔ - Bộ công an';

const RANK_TO_LICENSE_TYPE: Record<string, LicenseType> = {
  'Ô tô hạng B (tự động & sàn)': 'B',
  'Ô tô hạng C1': 'C1',
  'Ô tô hạng C': 'C',
  'Ô tô hạng D1': 'D1',
  'Ô tô hạng D2': 'D2',
  'Ô tô hạng D': 'D',
  'Ô tô hạng BE': 'BE',
  'Ô tô hạng C1E': 'C1E',
  'Ô tô hạng CE': 'CE',
  'Ô tô hạng D1E': 'D1E',
  'Ô tô hạng D2E': 'D2E',
  'Ô tô hạng DE': 'DE',
  'Mô tô hạng A1 (dưới 125cc)': 'A1',
  'Mô tô hạng A (trên 125 cc)': 'A',
};

const EXAM_PAPER_GROUPS: { label: string; options: string[] }[] = [
  { label: 'Đề thi ngẫu nhiên', options: ['Ngẫu nhiên'] },
  {
    label: 'Đề thi cố định để ôn tập (20 đề)',
    options: Array.from({ length: 20 }, (_, i) => `Cố định ${i + 1}`),
  },
];

function rankOptionsForVehicle(v: string): { label: string; options: string[] }[] {
  return [
    {
      label: v === 'Ô tô' ? OTO_GROUP_LABEL : MOTO_GROUP_LABEL,
      options: v === 'Ô tô' ? OTO_RANK_OPTIONS : MOTO_RANK_OPTIONS,
    },
  ];
}

interface ExamSetupScreenProps {
  onStartExam: (licenseType: LicenseType) => void;
  isStarting?: boolean;
  onBack?: () => void;
}

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { num: 1, label: 'Thông tin' },
    { num: 2, label: 'Bài thi' },
    { num: 3, label: 'Kết quả' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                currentStep > step.num
                  ? 'bg-emerald-500 text-white'
                  : currentStep === step.num
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
              }`}
            >
              {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                currentStep >= step.num ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 rounded-full transition-all duration-300 ${
                currentStep > step.num ? 'bg-emerald-500' : 'bg-[var(--bg-tertiary)]'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Status badge component
const StatusBadge = ({ isValid }: { isValid: boolean }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
      isValid
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}
    />
    {isValid ? 'Sẵn sàng bắt đầu' : 'Cần hoàn tất thông tin'}
  </div>
);

// Exam info card component
const ExamInfoCard = ({ licenseRank }: { licenseRank: string }) => {
  const config = EXAM_CONFIGS[RANK_TO_LICENSE_TYPE[licenseRank]];

  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-primary)]/80 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }} />
      </div>

      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--bg-primary)]">Thông tin bài thi</h3>
          <span className="text-[10px] font-medium text-[var(--bg-primary)]/60">Chuẩn 2026</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--bg-primary)]/10 rounded-xl p-3 text-center">
            <FileQuestion className="w-5 h-5 mx-auto mb-1.5 text-blue-300" />
            <p className="text-lg font-black text-white">{config.totalQuestions}</p>
            <p className="text-[10px] font-medium text-white/60">câu hỏi</p>
          </div>

          <div className="bg-[var(--bg-primary)]/10 rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1.5 text-emerald-300" />
            <p className="text-lg font-black text-white">{config.timeMinutes}</p>
            <p className="text-[10px] font-medium text-white/60">phút</p>
          </div>

          <div className="bg-[var(--bg-primary)]/10 rounded-xl p-3 text-center">
            <ShieldCheck className="w-5 h-5 mx-auto mb-1.5 text-amber-300" />
            <p className="text-lg font-black text-white">≥{config.passingScore}</p>
            <p className="text-[10px] font-medium text-white/60">để đạt</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ExamSetupScreen: React.FC<ExamSetupScreenProps> = ({ onStartExam, isStarting, onBack }) => {
  const { t } = useLanguage();
  const [candidateName, setCandidateName] = useState('');
  const [examPaper] = useState('Ngẫu nhiên');
  const [trainingCenter] = useState(DEFAULT_TRAINING_CENTER);
  const [course, setCourse] = useState(COURSE_OPTIONS[0]);
  const [vehicleType, setVehicleType] = useState<'car' | 'moto'>('car');
  const [licenseRank, setLicenseRank] = useState(OTO_RANK_OPTIONS[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-validate on mount and when fields change
  const isFormValid = useMemo(() => {
    return candidateName.trim().length > 0;
  }, [candidateName]);

  // Determine current step based on form completion
  const currentStep = useMemo(() => {
    if (!isFormValid) return 1;
    return 2;
  }, [isFormValid]);

  const licenseGroups = useMemo(() => rankOptionsForVehicle(vehicleType === 'car' ? 'Ô tô' : 'Mô tô'), [vehicleType]);

  const onVehicleChange = (v: 'car' | 'moto') => {
    setVehicleType(v);
    setLicenseRank(v === 'car' ? OTO_RANK_OPTIONS[0] : MOTO_RANK_OPTIONS[0]);
  };

  // Show success animation when name is entered
  useEffect(() => {
    if (candidateName.trim().length > 0) {
      setShowSuccess(true);
    }
  }, [candidateName]);

  const handleStartExam = () => {
    if (isFormValid) {
      onStartExam(RANK_TO_LICENSE_TYPE[licenseRank] || 'B1');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* LEFT PANEL — Branding (Desktop only) */}
      <div className="relative hidden lg:flex lg:w-[42%] shrink-0 flex-col overflow-hidden bg-[#111318]">
        <div className="relative flex flex-col h-full p-10 xl:p-14">
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
              <Car className="h-6 w-6 text-[#111318]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">DriveSmart</h1>
              <p className="text-[10px] font-medium text-[#6B7280] tracking-widest uppercase">Driver License Platform</p>
            </div>
          </motion.div>

          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative"
            >
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm">
                <Car className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                600 Câu hỏi
              </h2>
              <p className="text-xl xl:text-2xl font-bold text-[#9CA3AF]">
                Lý thuyết GPLX
              </p>
              <p className="text-sm text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                Hệ thống ôn thi bằng lái xe chuẩn bộ công an 2026
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <span className="text-[11px] font-medium text-[#4B5563] tracking-widest uppercase">Phiên bản 2026</span>
            </motion.div>
          </div>

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-4"
          >
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between text-[11px] text-[#4B5563]">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                20 câu / phút
              </span>
              <span className="flex items-center gap-1.5">
                <FileQuestion className="h-3.5 w-3.5" />
                6 chương
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 flex flex-col overflow-y-auto modern-scrollbar scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
        {/* Back button - fixed to viewport but contained in panel */}
        {onBack && (
          <div className="sticky top-0 z-10 px-4 sm:px-6 lg:px-10 pt-4">
            <button
              onClick={onBack}
              className="p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-sm hover:bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-10 xl:px-14 max-w-lg mx-auto w-full py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--text-primary)] shadow-lg">
                <Car className="h-6 w-6 text-[var(--bg-primary)]" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-tight">DriveSmart</h1>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wider">Driver License Platform</p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-1">
                Bắt đầu bài thi
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Nhập thông tin để bắt đầu ôn thi
              </p>
            </div>

            {/* Step indicator */}
            <StepIndicator currentStep={currentStep} />

            {/* Status badge */}
            <div className="mb-6">
              <StatusBadge isValid={isFormValid} />
            </div>

            {/* Form sections with consistent spacing */}
            <div className="space-y-5">
              {/* Candidate name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Họ và tên thí sinh
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3.5 pr-12 text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
                    placeholder="NHẬP HỌ TÊN"
                  />
                  <AnimatePresence>
                    {showSuccess && candidateName.trim().length > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Vehicle type - improved segmented control */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Phương tiện
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                  {VEHICLE_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onVehicleChange(id)}
                      className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 min-h-[48px] ${
                        vehicleType === id
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* License rank */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Hạng GPLX
                </label>
                <SelectField
                  value={licenseRank}
                  onChange={setLicenseRank}
                  groups={licenseGroups}
                />
              </div>

              {/* Course */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Khóa học
                </label>
                <SelectField
                  value={course}
                  onChange={setCourse}
                  options={COURSE_OPTIONS}
                />
              </div>

              {/* Exam info card */}
              <ExamInfoCard licenseRank={licenseRank} />
            </div>

            {/* CTA - Single primary action */}
            <div className="mt-8 mb-4">
              <motion.button
                type="button"
                whileTap={{ scale: isFormValid && !isStarting ? 0.98 : 1 }}
                onClick={handleStartExam}
                disabled={!isFormValid || isStarting}
                className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 min-h-[52px]
                  ${isFormValid && !isStarting
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang khởi tạo…
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Bắt đầu thi ngay
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              {/* Helper text */}
              <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
                Kết quả thi chỉ mang tính tham khảo
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/* ── SelectField ── */
function SelectField({
  value,
  onChange,
  options,
  groups,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  groups?: { label: string; options: string[] }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const displayOptions = useMemo(() => {
    if (groups) return groups.flatMap(g => g.options);
    return options ?? [];
  }, [groups, options]);

  const isOptGroup = !!groups;
  const optGroups = groups ?? [{ label: '', options: options ?? [] }];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className="w-full flex items-center appearance-none rounded-xl border-2 border-[var(--border)] font-semibold outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70 py-3 pl-4 pr-10 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:border-[var(--text-primary)]"
      >
        <span className="flex-1 text-left truncate">{value}</span>
      </button>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)] transition-transform duration-200"
        style={{ transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden shadow-xl"
            style={{ left: 0, right: 0 }}
          >
            <div className="max-h-56 overflow-y-auto modern-scrollbar py-1">
              {isOptGroup
                ? optGroups.map((group) => (
                    <div key={group.label}>
                      {group.label && (
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
                          {group.label}
                        </div>
                      )}
                      {group.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { onChange(opt); setOpen(false); }}
                          className={`w-full px-3 py-2.5 text-sm text-left font-medium transition-colors ${
                            opt === value
                              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ))
                : displayOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onChange(opt); setOpen(false); }}
                      className={`w-full px-3 py-2.5 text-sm text-left font-medium transition-colors ${
                        opt === value
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
}

export default ExamSetupScreen;
