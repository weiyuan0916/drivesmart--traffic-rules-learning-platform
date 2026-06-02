import { X } from 'lucide-react';

interface QuestionStatus {
  index: number;
  status: 'unanswered' | 'current' | 'correct' | 'wrong';
}

interface QuestionNavProps {
  questions: { id: number; chapterNumber: number }[];
  answers: Record<number, { selected: string; isCorrect: boolean }>;
  currentIndex: number;
  isSubmitted: boolean;
  onSelectQuestion: (index: number) => void;
  onClose: () => void;
}

export function QuestionNav({
  questions,
  answers,
  currentIndex,
  isSubmitted,
  onSelectQuestion,
  onClose,
}: QuestionNavProps) {
  const getStatus = (index: number): QuestionStatus['status'] => {
    if (index === currentIndex) return 'current';
    const answer = answers[questions[index].id];
    if (!answer) return 'unanswered';
    return answer.isCorrect ? 'correct' : 'wrong';
  };

  const getStatusStyles = (status: QuestionStatus['status']) => {
    switch (status) {
      case 'current':
        return 'bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)] ring-offset-2';
      case 'correct':
        return 'bg-[var(--color-success)] text-white';
      case 'wrong':
        return 'bg-[var(--color-error)] text-white';
      default:
        return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';
    }
  };

  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const wrongCount = Object.values(answers).filter((a) => !a.isCorrect).length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {answeredCount}/{questions.length}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">Questions answered</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close"
        >
          <X size={24} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Stats Bar */}
      {isSubmitted && (
        <div className="flex items-center justify-around px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--color-success)]"></span>
            <span className="text-sm text-[var(--text-secondary)]">{correctCount} Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--color-error)]"></span>
            <span className="text-sm text-[var(--text-secondary)]">{wrongCount} Wrong</span>
          </div>
        </div>
      )}

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const status = getStatus(index);
            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(index)}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all min-h-[44px] ${getStatusStyles(
                  status
                )}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${getStatusStyles('current')}`}></span>
              <span className="text-[var(--text-muted)]">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${getStatusStyles('unanswered')}`}></span>
              <span className="text-[var(--text-muted)]">Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${getStatusStyles('correct')}`}></span>
              <span className="text-[var-[var(--text-muted)]]">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${getStatusStyles('wrong')}`}></span>
              <span className="text-[var(--text-muted)]">Wrong</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
