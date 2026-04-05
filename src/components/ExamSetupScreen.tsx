import React, { useMemo, useState } from 'react';
import { Car, CheckCircle2, ChevronDown, BookOpen, Clock, FileQuestion, Headphones, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

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
  isStarting?: boolean;
}

const ExamSetupScreen: React.FC<ExamSetupScreenProps> = ({ onStartExam, isStarting }) => {
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
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Language switcher */}
      <div className="fixed right-4 top-4 z-20">
        <LanguageSwitcher className="relative flex items-center gap-2" />
      </div>

      {/* ═══ LEFT PANEL — Branding ═══ */}
      <div className="relative hidden lg:flex lg:w-[42%] shrink-0 flex-col overflow-hidden bg-[#111318]">

        <div className="relative flex flex-col h-full p-10 xl:p-14">
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
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
            {/* Simple icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-20 h-20 rounded-3xl bg-[#1a1d24] border border-[#2a2f3a] flex items-center justify-center"
            >
              <Car className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
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

            {/* Benefit pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: FileQuestion, text: '30 câu' },
                { icon: Clock, text: '20 phút' },
                { icon: ShieldCheck, text: 'Chuẩn 2026' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold bg-[#1a1d24] border border-[#2a2f3a] text-[#9CA3AF]"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <span className="text-[11px] font-medium text-[#4B5563] tracking-widest uppercase">Phiên bản 2026</span>
          </motion.div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-primary)]">
        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-8 lg:px-14 xl:px-20 max-w-xl lg:max-w-none mx-auto lg:mx-0 w-full lg:w-auto">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--text-primary)]">
                <Car className="h-5 w-5 text-[var(--bg-primary)]" />
              </div>
              <div>
                <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tight leading-tight">DriveSmart</h1>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium tracking-wider">Driver License Platform</p>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                Bắt đầu bài thi
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Điền thông tin và chọn hạng GPLX của bạn
              </p>
            </div>

            {/* Candidate name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Họ và tên thí sinh
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  setVerified(false);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3.5 pr-12 text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
                placeholder="NHẬP HỌ TÊN"
              />
            </div>

            {/* Exam paper */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Đề thi
              </label>
              <SelectField
                value={examPaper}
                onChange={(v) => { setExamPaper(v); setVerified(false); }}
                groups={EXAM_PAPER_GROUPS}
              />
            </div>

            {/* Training center + Course */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Cơ sở
                </label>
                <SelectField
                  value={trainingCenter}
                  onChange={(v) => { setTrainingCenter(v); setVerified(false); }}
                  options={TRAINING_OPTIONS}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Khóa học
                </label>
                <SelectField
                  value={course}
                  onChange={(v) => { setCourse(v); setVerified(false); }}
                  options={COURSE_OPTIONS}
                />
              </div>
            </div>

            {/* Vehicle type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Phương tiện
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.values(VEHICLE_OPTIONS) as VehicleType[]).map((v) => (
                  <motion.button
                    key={v}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onVehicleChange(v)}
                    className={`rounded-2xl border py-3 px-4 text-sm font-bold transition-colors ${
                      vehicleType === v
                        ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)]'
                        : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* License rank */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Hạng GPLX
              </label>
              <SelectField
                value={licenseRank}
                onChange={(v) => { setLicenseRank(v); setVerified(false); }}
                groups={licenseGroups}
              />
            </div>

            {/* Status pill */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                  {statusLabel}
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">{licenseRank.length > 28 ? licenseRank.slice(0, 26) + '…' : licenseRank}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setVerified(true)}
                className="w-full rounded-2xl bg-[var(--text-primary)] px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--bg-primary)] transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Xác nhận thông tin
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: canStart ? 0.98 : 1 }}
                onClick={onStartExam}
                disabled={!canStart || isStarting}
                className={`w-full rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-wide transition-opacity flex items-center justify-center gap-2
                  ${canStart && !isStarting
                    ? 'bg-emerald-500 text-white hover:opacity-80'
                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
              >
                {isStarting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang khởi tạo…
                  </>
                ) : (
                  <>
                    <Car className="h-5 w-5" />
                    Bắt đầu làm bài thi
                  </>
                )}
              </motion.button>
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-center gap-8 pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <BookOpen className="h-4 w-4" />
                Hướng dẫn
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <Headphones className="h-4 w-4" />
                Hỗ trợ
              </button>
            </div>

            <p className="text-center text-[10px] leading-relaxed text-[var(--text-muted)]">
              Kết quả thi chỉ mang tính tham khảo. Vui lòng kiểm tra tại trang của cơ quan có thẩm quyền.
            </p>
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
  textAlign = 'left',
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  groups?: { label: string; options: string[] }[];
  disabled?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}) {
  const [open, setOpen] = useState(false);

  const displayOptions = useMemo(() => {
    if (groups) return groups.flatMap(g => g.options);
    return options ?? [];
  }, [groups, options]);

  const isOptGroup = !!groups;
  const optGroups = groups ?? [{ label: '', options: options ?? [] }];

  const alignClass =
    textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`w-full flex items-center appearance-none rounded-xl border font-semibold outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70 py-3 pl-4 pr-10 text-sm bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:border-[var(--text-primary)] ${alignClass}`}
      >
        <span className="flex-1 text-left truncate">{value}</span>
      </button>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] transition-transform duration-200"
        style={{ transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden"
            style={{ left: 0, right: 0 }}
          >
            <div className="max-h-56 overflow-y-auto py-1">
              {isOptGroup
                ? optGroups.map((group) => (
                    <div key={group.label}>
                      {group.label && (
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {group.label}
                        </div>
                      )}
                      {group.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { onChange(opt); setOpen(false); }}
                          className={`w-full px-3 py-2.5 text-sm text-left font-semibold transition-colors ${
                            opt === value
                              ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
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
                      className={`w-full px-3 py-2.5 text-sm text-left font-semibold transition-colors ${
                        opt === value
                          ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
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
