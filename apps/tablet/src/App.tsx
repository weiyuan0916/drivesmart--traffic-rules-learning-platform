import { useState, useCallback } from 'react';
import { Car, RotateCcw, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight } from 'lucide-react';
import ExamSetup from './components/ExamSetup';
import QuestionCard from './components/QuestionCard';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Results from './components/Results';
import type { Question } from './types';
import { loadExamQuestions } from './services/questionsService';
import { generateB1ExamQuestions } from './services/examGenerator';

type ExamPhase = 'setup' | 'exam' | 'results';

function AppContent() {
  const [examPhase, setExamPhase] = useState<ExamPhase>('setup');
  const [examLoading, setExamLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [confirmedAnswers, setConfirmedAnswers] = useState<(string | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sidebar states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const startExam = useCallback(async () => {
    if (examLoading) return;
    setExamLoading(true);
    try {
      const allQuestions = await loadExamQuestions();
      const seed = String(Date.now());
      const selected = generateB1ExamQuestions(allQuestions, seed);
      setExamQuestions(selected);
      setConfirmedAnswers(selected.map(() => null));
      setCurrentIndex(0);
      setExamPhase('exam');
      setLeftSidebarCollapsed(false);
      setRightSidebarCollapsed(true);
    } finally {
      setExamLoading(false);
    }
  }, [examLoading]);

  const handleSelectAnswer = useCallback((answerId: string) => {
    setConfirmedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answerId;
      return next;
    });
  }, [currentIndex]);

  const handleSubmitAnswer = useCallback(() => {
    // Answer is already saved - just confirm submission
    // This triggers the UI to show the result
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setExamPhase('results');
    }
  }, [currentIndex, examQuestions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSelectQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleRetry = useCallback(() => {
    setExamPhase('setup');
    setExamQuestions([]);
    setConfirmedAnswers([]);
    setCurrentIndex(0);
  }, []);

  const currentQuestion = examQuestions[currentIndex];
  const currentAnswer = confirmedAnswers[currentIndex];
  const isCurrentSubmitted = currentAnswer !== null;

  const showResults = examPhase === 'results' || currentIndex === examQuestions.length - 1 && isCurrentSubmitted;

  if (examPhase === 'results' || showResults) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
        <Results
          questions={examQuestions}
          confirmedAnswers={confirmedAnswers}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (examPhase === 'setup') {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
        <ExamSetup
          onStartExam={startExam}
          isStarting={examLoading}
          onOpenSettings={undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--text-primary)]">DriveSmart</h1>
            <p className="text-xs text-[var(--text-secondary)]">Bài thi B1</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="text-center">
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {confirmedAnswers.filter(Boolean).length}/{examQuestions.length}
            </span>
            <p className="text-xs text-[var(--text-secondary)]">đã trả lời</p>
          </div>

          {/* Sidebar toggles */}
          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className={`
              p-2 rounded-lg transition-colors
              ${leftSidebarCollapsed ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}
            `}
            title={leftSidebarCollapsed ? 'Mở sidebar trái' : 'Thu sidebar trái'}
          >
            {leftSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className={`
              p-2 rounded-lg transition-colors
              ${rightSidebarCollapsed ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}
            `}
            title={rightSidebarCollapsed ? 'Mở sidebar phải' : 'Thu sidebar phải'}
          >
            {rightSidebarCollapsed ? <PanelRight className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
          </button>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Thi lại"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Question Navigator */}
        {!leftSidebarCollapsed && (
          <LeftSidebar
            questions={examQuestions}
            currentIndex={currentIndex}
            confirmedAnswers={confirmedAnswers}
            isCollapsed={leftSidebarCollapsed}
            onToggle={() => setLeftSidebarCollapsed(true)}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {/* Center - Question Card */}
        <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
          {currentQuestion && (
            <QuestionCard
              key={currentIndex}
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={examQuestions.length}
              selectedAnswer={currentAnswer}
              isSubmitted={isCurrentSubmitted}
              onSelectAnswer={handleSelectAnswer}
              onSubmit={handleSubmitAnswer}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
              isFirst={currentIndex === 0}
              isLast={currentIndex === examQuestions.length - 1}
            />
          )}
        </main>

        {/* Right Sidebar - Statistics */}
        {!rightSidebarCollapsed && (
          <RightSidebar
            questions={examQuestions}
            confirmedAnswers={confirmedAnswers}
            isCollapsed={rightSidebarCollapsed}
            onToggle={() => setRightSidebarCollapsed(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
