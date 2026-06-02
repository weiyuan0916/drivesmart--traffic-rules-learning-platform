import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Question } from '../types';

interface LeftSidebarProps {
  questions: Question[];
  currentIndex: number;
  confirmedAnswers: (string | null)[];
  isCollapsed: boolean;
  onToggle: () => void;
  onSelectQuestion: (index: number) => void;
}

export default function LeftSidebar({
  questions,
  currentIndex,
  confirmedAnswers,
  isCollapsed,
  onToggle,
  onSelectQuestion,
}: LeftSidebarProps) {
  const getStatusColor = (index: number) => {
    const confirmed = confirmedAnswers[index];
    if (!confirmed) return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';

    const isCorrect = confirmed === questions[index].correctAnswer;
    return isCorrect
      ? 'bg-[var(--color-success)] text-white'
      : 'bg-[var(--color-error)] text-white';
  };

  const answeredCount = confirmedAnswers.filter(Boolean).length;

  return (
    <div
      className={`
        flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)]
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        {!isCollapsed && (
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Câu hỏi</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {answeredCount}/{questions.length} đã trả lời
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Question Grid */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={() => onSelectQuestion(index)}
                  className={`
                    relative aspect-square rounded-lg font-semibold text-sm transition-all duration-200
                    ${getStatusColor(index)}
                    ${isCurrent ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}
                    hover:scale-105
                  `}
                >
                  {index + 1}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-4 h-4 rounded bg-[var(--bg-tertiary)]" />
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-4 h-4 rounded bg-[var(--color-success)]" />
              <span>Đúng</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-4 h-4 rounded bg-[var(--color-error)]" />
              <span>Sai</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed state - show mini grid */}
      {isCollapsed && (
        <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-2 gap-1">
            {questions.slice(0, 12).map((_, index) => (
              <button
                key={index}
                onClick={() => onSelectQuestion(index)}
                className={`
                  aspect-square rounded font-semibold text-xs transition-all duration-200
                  ${getStatusColor(index)}
                  ${index === currentIndex ? 'ring-2 ring-[var(--color-primary)]' : ''}
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {questions.length > 12 && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              +{questions.length - 12}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
