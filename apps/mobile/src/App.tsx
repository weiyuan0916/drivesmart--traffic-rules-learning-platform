import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { QuestionCard } from './components/QuestionCard';
import { BottomNav } from './components/BottomNav';
import { QuestionNav } from './components/QuestionNav';
import { ChapterStats } from './components/ChapterStats';
import { ExamSetup } from './components/ExamSetup';
import { Results } from './components/Results';
import { SettingsScreen } from './components/SettingsScreen';
import { loadExamQuestions } from './services/questionsService';
import { generateB1ExamQuestions } from './services/examGenerator';
import type { Question, ExamResult, ChapterStat } from './types';
import { List, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';

type AppTab = 'questions' | 'stats' | 'settings';
type ExamState = 'setup' | 'exam' | 'results';

function AppContent() {
  const { t } = useLanguage();
  
  // App state
  const [activeTab, setActiveTab] = useState<AppTab>('questions');
  const [examState, setExamState] = useState<ExamState>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Questions state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Answer tracking
  const [answers, setAnswers] = useState<Record<number, { selected: string; isCorrect: boolean }>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // UI state
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  
  // Touch/swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Load questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        await loadExamQuestions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      }
    }
    loadQuestions();
  }, []);

  // Start exam
  const handleStartExam = useCallback(async () => {
    setIsLoading(true);
    try {
      const questions = await loadExamQuestions();
      const exam = generateB1ExamQuestions(questions);
      setExamQuestions(exam);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setExamState('exam');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate exam');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select answer
  const handleSelectAnswer = useCallback((answerId: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answerId);
    }
  }, [isSubmitted]);

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (!selectedAnswer || !examQuestions[currentQuestionIndex]) return;
    
    const question = examQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    setAnswers(prev => ({
      ...prev,
      [question.id]: { selected: selectedAnswer, isCorrect }
    }));
    setIsSubmitted(true);
  }, [selectedAnswer, examQuestions, currentQuestionIndex]);

  // Next question
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      calculateResults();
    }
  }, [currentQuestionIndex, examQuestions.length]);

  // Calculate results
  const calculateResults = useCallback(() => {
    const chapterMap = new Map<number, { correct: number; total: number }>();
    let totalCorrect = 0;

    examQuestions.forEach(q => {
      const answer = answers[q.id];
      if (!chapterMap.has(q.chapterNumber)) {
        chapterMap.set(q.chapterNumber, { correct: 0, total: 0 });
      }
      const stats = chapterMap.get(q.chapterNumber)!;
      stats.total++;
      if (answer?.isCorrect) {
        stats.correct++;
        totalCorrect++;
      }
    });

    const chapterStats: ChapterStat[] = Array.from(chapterMap.entries()).map(([chapterNumber, stats]) => ({
      chapterNumber,
      chapter: examQuestions.find(q => q.chapterNumber === chapterNumber)?.chapter || '',
      correct: stats.correct,
      total: stats.total,
    }));

    const result: ExamResult = {
      score: totalCorrect,
      correctCount: totalCorrect,
      wrongCount: examQuestions.length - totalCorrect,
      totalQuestions: examQuestions.length,
      chapterStats,
    };

    setExamResult(result);
    setExamState('results');
  }, [examQuestions, answers]);

  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Retry exam
  const handleRetry = useCallback(() => {
    handleStartExam();
  }, [handleStartExam]);

  // Back to setup
  const handleBackToSetup = useCallback(() => {
    setExamState('setup');
    setExamQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }, []);

  // Navigate to question
  const handleNavigateToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    const question = examQuestions[index];
    if (question && answers[question.id]) {
      setSelectedAnswer(answers[question.id].selected);
      setIsSubmitted(true);
    } else {
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
    setShowQuestionNav(false);
  }, [examQuestions, answers]);

  // Touch handlers for swipe
  const handleTouchStart = (e: { touches: { clientX: number }[] }) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: { touches: { clientX: number }[] }) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentQuestionIndex < examQuestions.length - 1) {
        if (isSubmitted) handleNext();
      } else if (diff < 0 && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        const question = examQuestions[currentQuestionIndex - 1];
        if (question && answers[question.id]) {
          setSelectedAnswer(answers[question.id].selected);
          setIsSubmitted(true);
        } else {
          setSelectedAnswer(null);
          setIsSubmitted(false);
        }
      }
    }
  };

  const currentQuestion = examQuestions[currentQuestionIndex];

  // Render content based on active tab and exam state
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-[var(--color-error)] mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === 'stats') {
      const chapterMap = new Map<number, { correct: number; total: number }>();
      examQuestions.forEach(q => {
        if (!chapterMap.has(q.chapterNumber)) {
          chapterMap.set(q.chapterNumber, { correct: 0, total: 0 });
        }
        const stats = chapterMap.get(q.chapterNumber)!;
        stats.total++;
        if (answers[q.id]?.isCorrect) {
          stats.correct++;
        }
      });

      const chapterStatsList: ChapterStat[] = Array.from(chapterMap.entries()).map(([chapterNumber, stats]) => ({
        chapterNumber,
        chapter: examQuestions.find(q => q.chapterNumber === chapterNumber)?.chapter || '',
        correct: stats.correct,
        total: stats.total,
      }));

      const totalCorrect = Object.values(answers).filter(a => a.isCorrect).length;

      if (examQuestions.length === 0) {
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-[var(--text-muted)] text-center">{t('stats')} will appear after starting an exam</p>
          </div>
        );
      }

      return (
        <div className="flex-1 overflow-y-auto pb-20">
          <ChapterStats
            stats={chapterStatsList}
            totalCorrect={totalCorrect}
            totalQuestions={examQuestions.length}
          />
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="flex-1 overflow-y-auto pb-20">
          <SettingsScreen />
        </div>
      );
    }

    // Questions tab
    if (examState === 'setup') {
      return (
        <div className="flex-1 flex flex-col">
          <ExamSetup onStartExam={handleStartExam} isLoading={isLoading} />
        </div>
      );
    }

    if (examState === 'results' && examResult) {
      return (
        <div className="flex-1 overflow-y-auto">
          <Results
            result={examResult}
            onRetry={handleRetry}
            onBackToSetup={handleBackToSetup}
          />
        </div>
      );
    }

    if (examState === 'exam' && currentQuestion) {
      return (
        <>
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
            <button
              onClick={() => setShowQuestionNav(true)}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Show question navigator"
            >
              <List size={24} className="text-[var(--text-primary)]" />
            </button>
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {currentQuestionIndex + 1}/{examQuestions.length}
            </span>
            <button
              onClick={() => setShowQuestionNav(true)}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Show all questions"
            >
              <Grid3X3 size={24} className="text-[var(--text-primary)]" />
            </button>
          </div>

          <div
            className="flex-1 overflow-hidden"
            onTouchStart={handleTouchStart as any}
            onTouchMove={handleTouchMove as any}
            onTouchEnd={handleTouchEnd}
          >
            <QuestionCard
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={examQuestions.length}
              selectedAnswer={selectedAnswer}
              isSubmitted={isSubmitted}
              onSelectAnswer={handleSelectAnswer}
              onSubmit={handleSubmit}
              onNext={handleNext}
            />
          </div>

          <div className="px-4 py-2 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
            Swipe left/right to navigate questions
          </div>

          {showQuestionNav && (
            <QuestionNav
              questions={examQuestions.map(q => ({ id: q.id, chapterNumber: q.chapterNumber }))}
              answers={answers}
              currentIndex={currentQuestionIndex}
              isSubmitted={isSubmitted}
              onSelectQuestion={handleNavigateToQuestion}
              onClose={() => setShowQuestionNav(false)}
            />
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          {examState === 'exam' && currentQuestionIndex > 0 && (
            <button
              onClick={() => handleNavigateToQuestion(currentQuestionIndex - 1)}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            >
              <ChevronLeft size={24} className="text-[var(--text-primary)]" />
            </button>
          )}
          <h1 className="text-lg font-semibold">DriveSmart</h1>
        </div>
        {examState === 'exam' && (
          <span className="text-sm font-medium text-[var(--color-primary)]">
            {Object.keys(answers).length}/{examQuestions.length}
          </span>
        )}
        {examState === 'exam' && currentQuestionIndex < examQuestions.length - 1 && (
          <button
            onClick={() => handleNavigateToQuestion(currentQuestionIndex + 1)}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronRight size={24} className="text-[var(--text-primary)]" />
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
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
