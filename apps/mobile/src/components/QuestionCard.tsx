import { CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import type { Question, QuestionOption } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isSubmitted: boolean;
  onSelectAnswer: (answerId: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onShowExplanation?: () => void;
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isSubmitted,
  onSelectAnswer,
  onSubmit,
  onNext,
}: QuestionCardProps) {
  const { t } = useLanguage();
  const isCorrect = selectedAnswer === question.correctAnswer;

  const getOptionStyle = (option: QuestionOption) => {
    if (!isSubmitted) {
      return selectedAnswer === option.id
        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
        : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]';
    }

    if (option.id === question.correctAnswer) {
      return 'border-[var(--color-success)] bg-[var(--color-success)]/10';
    }

    if (option.id === selectedAnswer && option.id !== question.correctAnswer) {
      return 'border-[var(--color-error)] bg-[var(--color-error)]/10';
    }

    return 'border-[var(--border)] bg-[var(--bg-secondary)] opacity-60';
  };

  const getOptionIcon = (option: QuestionOption) => {
    if (!isSubmitted) return null;

    if (option.id === question.correctAnswer) {
      return <CheckCircle size={20} className="text-[var(--color-success)]" />;
    }

    if (option.id === selectedAnswer && option.id !== question.correctAnswer) {
      return <XCircle size={20} className="text-[var(--color-error)]" />;
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {t('question')} {questionIndex + 1}/{totalQuestions}
          </span>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
          {t('chapter')} {question.chapterNumber}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Question Image */}
        {question.image && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={question.image}
              alt={`Question ${question.id}`}
              className="w-full h-auto max-h-48 object-contain bg-[var(--bg-tertiary)]"
              loading="lazy"
            />
          </div>
        )}

        {/* Question Text */}
        <p className="text-base font-medium text-[var(--text-primary)] leading-relaxed mb-6">
          {question.text}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => !isSubmitted && onSelectAnswer(option.id)}
              disabled={isSubmitted}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left min-h-[56px] ${getOptionStyle(
                option
              )}`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-sm font-bold">
                {option.id}
              </span>
              <span className="flex-1 text-sm text-[var(--text-primary)]">{option.text}</span>
              {getOptionIcon(option)}
            </button>
          ))}
        </div>

        {/* Result Badge */}
        {isSubmitted && (
          <div
            className={`mt-4 p-4 rounded-xl ${
              isCorrect ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-error)]/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle size={24} className="text-[var(--color-success)]" />
                  <span className="font-semibold text-[var(--color-success)]">{t('correct')}</span>
                </>
              ) : (
                <>
                  <XCircle size={24} className="text-[var(--color-error)]" />
                  <span className="font-semibold text-[var(--color-error)]">{t('incorrect')}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        {isSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} className="text-[var(--color-primary)]" />
              <span className="font-semibold text-[var(--text-primary)]">{t('explanation')}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        {!isSubmitted ? (
          <button
            onClick={onSubmit}
            disabled={!selectedAnswer}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all min-h-[52px] flex items-center justify-center gap-2 ${
              selectedAnswer
                ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {t('submit')}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl font-semibold text-base bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all min-h-[52px] flex items-center justify-center gap-2"
          >
            {t('nextQuestion')}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
