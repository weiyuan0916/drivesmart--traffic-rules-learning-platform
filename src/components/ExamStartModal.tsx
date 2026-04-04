import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, LayoutTemplate, Columns2, Car, Clock, FileQuestion } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ExamStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (layout: 'split' | 'sideBySide') => void;
  selectedLayout: 'split' | 'sideBySide';
  onLayoutChange: (layout: 'split' | 'sideBySide') => void;
  candidateName: string;
  licenseRank: string;
  examPaper: string;
  totalQuestions?: number;
}

const LAYOUT_PREVIEWS = {
  split: {
    name: 'Chia 2 khu vực',
    icon: LayoutTemplate,
    description: 'Ảnh & Câu hỏi bên trên, đáp án bên dưới',
  },
  sideBySide: {
    name: 'Chia đôi ngang',
    icon: Columns2,
    description: 'Ảnh & Câu hỏi bên trái, đáp án bên phải',
  },
} as const;

export const ExamStartModal: React.FC<ExamStartModalProps> = ({
  isOpen,
  onClose,
  onStart,
  selectedLayout,
  onLayoutChange,
  candidateName,
  licenseRank,
  examPaper,
  totalQuestions = 30,
}) => {
  const { t } = useLanguage();
  const [confirming, setConfirming] = useState(false);

  const handleStart = () => {
    if (confirming) return;
    setConfirming(true);
    setTimeout(() => {
      onStart(selectedLayout);
      setConfirming(false);
    }, 150);
  };

  const handleClose = () => {
    if (confirming) return;
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Outer glow */}
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/10 blur-xl" aria-hidden />

          {/* Main card */}
          <div className="relative rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

            <div className="p-6 sm:p-7 space-y-6">
              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 mb-3">
                  <Car className="w-7 h-7 text-emerald-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  Sẵn sàng bắt đầu?
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Xác nhận giao diện và bắt đầu bài thi
                </p>
              </div>

              {/* Exam summary pill */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <FileQuestion className="w-3.5 h-3.5 text-blue-500" />
                  {totalQuestions} câu hỏi
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  20 phút
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Car className="w-3.5 h-3.5 text-emerald-500" />
                  {licenseRank.length > 20 ? licenseRank.slice(0, 18) + '…' : licenseRank}
                </span>
              </div>

              {/* Candidate info */}
              <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 text-center border border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                  Thí sinh
                </p>
                <p className="text-[var(--text-primary)] font-black text-lg tracking-wide uppercase">
                  {candidateName || '—'}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{examPaper}</p>
              </div>

              {/* Layout selector */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] text-center">
                  Chọn giao diện làm bài
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(LAYOUT_PREVIEWS) as [keyof typeof LAYOUT_PREVIEWS, typeof LAYOUT_PREVIEWS[keyof typeof LAYOUT_PREVIEWS]][]).map(([key, layout]) => {
                    const isSelected = selectedLayout === key;
                    const Icon = layout.icon;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onLayoutChange(key)}
                        className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/8 shadow-lg shadow-blue-500/20'
                            : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        {/* Selected badge */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </motion.div>
                        )}

                        {/* Preview diagram */}
                        <div className="mb-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] p-1.5">
                          {key === 'split' ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                <div className="flex-1 h-10 rounded bg-blue-500/25 border border-blue-500/30 flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-blue-400/70">IMG</span>
                                </div>
                                <div className="w-2/5 h-10 rounded bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-blue-400/70">Q</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                {['A','B','C','D'].map((l) => (
                                  <div key={l} className="h-6 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)]">
                                    {l}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-1 h-[70px]">
                              <div className="w-1/2 h-full rounded bg-blue-500/25 border border-blue-500/30 flex flex-col items-center justify-center gap-0.5">
                                <span className="text-[8px] font-bold text-blue-400/70">IMG</span>
                                <span className="text-[7px] font-bold text-blue-400/50">Q</span>
                              </div>
                              <div className="w-1/2 grid grid-cols-2 gap-0.5">
                                {['A','B','C','D'].map((l) => (
                                  <div key={l} className="rounded bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)]">
                                    {l}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-500/20' : 'bg-[var(--bg-secondary)]'
                          }`}>
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-[var(--text-secondary)]'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-bold leading-tight ${isSelected ? 'text-blue-500' : 'text-[var(--text-primary)]'}`}>
                              {layout.name}
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)] leading-tight line-clamp-1">
                              {layout.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-center text-[var(--text-secondary)] leading-relaxed">
                  Khi thu gọn thanh bên, giao diện sẽ tự động chuyển sang <strong>Chia đôi ngang</strong>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <motion.button
                  type="button"
                  whileHover={!confirming ? { scale: 1.01 } : {}}
                  whileTap={!confirming ? { scale: 0.98 } : {}}
                  onClick={handleStart}
                  disabled={confirming}
                  className={`w-full rounded-2xl py-4 text-sm font-black uppercase tracking-wide transition-all shadow-xl ${
                    confirming
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-500 hover:to-green-600 shadow-[0_8px_30px_-4px_rgba(5,150,105,0.45)] hover:shadow-[0_12px_36px_-4px_rgba(5,150,105,0.5)]'
                  }`}
                >
                  {confirming ? 'Đang bắt đầu…' : (
                    <span className="flex items-center justify-center gap-2">
                      <Car className="w-5 h-5" />
                      Bắt đầu làm bài
                    </span>
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-2xl py-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Quay lại chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ExamStartModal;
