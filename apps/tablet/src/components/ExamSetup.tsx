import { Car, Play, Settings } from 'lucide-react';

interface ExamSetupProps {
  onStartExam: () => void;
  isStarting: boolean;
  onOpenSettings?: () => void;
}

export default function ExamSetup({ onStartExam, isStarting, onOpenSettings }: ExamSetupProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[var(--bg-primary)]">
      {/* Logo & Title */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="w-24 h-24 bg-[var(--color-primary)] rounded-3xl flex items-center justify-center shadow-lg">
          <Car className="w-14 h-14 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">
            DriveSmart
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Bài thi lý thuyết B1
          </p>
        </div>
      </div>

      {/* Exam Info Card */}
      <div className="bg-[var(--bg-secondary)] rounded-3xl p-8 mb-8 w-full max-w-md shadow-sm border border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Thông tin bài thi</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
            <span className="text-[var(--text-secondary)]">Số câu hỏi</span>
            <span className="font-semibold text-[var(--text-primary)]">30 câu</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
            <span className="text-[var(--text-secondary)]">Thời gian</span>
            <span className="font-semibold text-[var(--text-primary)]">25 phút</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
            <span className="text-[var(--text-secondary)]">Điểm đạt</span>
            <span className="font-semibold text-[var(--text-primary)]">28/30 (93%)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[var(--text-secondary)]">Hạng GPLX</span>
            <span className="font-semibold text-[var(--text-primary)]">B1</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStartExam}
        disabled={isStarting}
        className="w-full max-w-md flex items-center justify-center gap-3 px-8 py-5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl transition-all duration-200 shadow-lg"
      >
        {isStarting ? (
          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Play className="w-7 h-7" />
            <span>{isStarting ? 'Đang tải...' : 'Bắt đầu thi'}</span>
          </>
        )}
      </button>

      {/* Settings Button */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="mt-6 flex items-center gap-2 px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Cài đặt</span>
        </button>
      )}

      {/* Footer */}
      <p className="mt-12 text-sm text-[var(--text-muted)]">
        Phiên bản 2026 · DriveSmart
      </p>
    </div>
  );
}
