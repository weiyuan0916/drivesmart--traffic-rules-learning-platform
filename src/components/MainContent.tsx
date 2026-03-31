import React, { useState } from 'react';
import { MOCK_QUESTIONS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronUp, Clock, Bookmark, LayoutGrid } from 'lucide-react';

import LanguageSwitcher from './LanguageSwitcher';
import { SmoothScroll } from './SmoothScroll';

const TOTAL_QUESTIONS = 20;

interface MainContentProps {
  onBack?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ onBack }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [questionNavExpanded, setQuestionNavExpanded] = useState(false);
  const { t } = useLanguage();
  const questionIndex = Math.max(0, Math.min(currentQuestionNumber - 1, MOCK_QUESTIONS.length - 1));
  const question = MOCK_QUESTIONS[questionIndex];

  const handleOptionClick = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
    setShowResult(true);
  };

  return (
    <SmoothScroll className="flex-1 bg-[var(--bg-primary)] flex flex-col transition-colors duration-300">
      <div className="lg:hidden sticky top-0 z-30 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] shadow-sm">
        <div className="grid grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 min-h-0">
          <button 
            type="button"
            onClick={onBack}
            className="p-2 -ml-1 text-[var(--text-primary)] shrink-0 min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl active:bg-[var(--bg-hover)]"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="text-[var(--text-primary)] font-bold text-sm sm:text-xl text-center truncate min-w-0 leading-tight">Exam</h1>
          <div className="flex items-center justify-end shrink-0">
            <LanguageSwitcher variant="menu" className="relative flex items-center justify-end" />
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-3 pt-2 border-t border-[var(--border)]">
          <div className="flex gap-2 items-start sm:hidden">
            <button
              type="button"
              onClick={() => setQuestionNavExpanded((e) => !e)}
              aria-expanded={questionNavExpanded}
              title={questionNavExpanded ? t('collapseQuestionNav') : t('expandQuestionNav')}
              aria-label={questionNavExpanded ? t('collapseQuestionNav') : t('expandQuestionNav')}
              className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm transition-colors active:bg-[var(--bg-hover)]"
            >
              {questionNavExpanded ? <ChevronUp className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
            </button>
            <div
              data-lenis-prevent
              className={
                questionNavExpanded
                  ? 'min-w-0 flex-1 grid grid-cols-5 gap-2 max-h-[min(14rem,48vh)] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]'
                  : 'min-w-0 flex-1 grid grid-cols-5 gap-2 grid-rows-2'
              }
            >
              {(questionNavExpanded
                ? Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1)
                : currentQuestionNumber <= 10
                  ? Array.from({ length: 10 }, (_, i) => i + 1)
                  : Array.from({ length: 10 }, (_, i) => i + 11)
              ).map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    setCurrentQuestionNumber(num);
                    setQuestionNavExpanded(false);
                  }}
                  className={`size-[26px] justify-self-center rounded-md flex items-center justify-center text-sm font-bold leading-none transition-all ${
                    num === currentQuestionNumber
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] active:bg-[var(--bg-hover)]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div
            data-lenis-prevent
            className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 w-full scrollbar-visible"
          >
            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setCurrentQuestionNumber(num)}
                className={`size-[26px] rounded-full flex items-center justify-center text-sm font-bold leading-none shrink-0 transition-all ${
                  num === currentQuestionNumber
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2.5 sm:p-4 lg:p-8 flex flex-col gap-3 lg:gap-6 w-full max-w-full overflow-x-hidden">
        {/* Question Info Bar (Mobile/Tablet only) */}
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[var(--text-primary)] font-bold text-sm sm:text-lg">
              {t('question')} {currentQuestionNumber}
            </span>
            <span className="text-[var(--text-secondary)] text-[10px] sm:text-sm font-medium">/ {TOTAL_QUESTIONS}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-blue-500 font-mono font-bold text-[10px] sm:text-sm">19:34</span>
            </div>
            <button className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Traffic Image */}
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--bg-tertiary)] shadow-xl shrink-0 border border-[var(--border)]">
          <img 
            src={question.image} 
            alt="Traffic Situation" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Question Text Box */}
        <div className="bg-[var(--bg-tertiary)] p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--text-primary)] text-xs sm:text-base lg:text-lg font-bold leading-relaxed">
            {question.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {question.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.id === 'B';
            
            let buttonClass = 'bg-[var(--bg-tertiary)] border-[var(--border)] hover:bg-[var(--bg-hover)]';
            let iconClass = 'bg-[var(--bg-hover)] text-[var(--text-secondary)]';
            let textClass = 'text-[var(--text-secondary)]';

            if (showResult) {
              if (isSelected) {
                if (isCorrect) {
                  buttonClass = 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20';
                  iconClass = 'bg-white text-emerald-600';
                  textClass = 'text-white';
                } else {
                  buttonClass = 'bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/20';
                  iconClass = 'bg-white text-rose-600';
                  textClass = 'text-white';
                }
              } else if (isCorrect) {
                buttonClass = 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20';
                iconClass = 'bg-white text-emerald-600';
                textClass = 'text-white';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`w-full p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex items-start gap-4 sm:gap-6 text-left transition-all duration-200 group border ${buttonClass}`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shrink-0 transition-colors ${iconClass}`}>
                  {option.id}
                </div>
                <p className={`text-sm sm:text-base font-bold pt-1 ${textClass}`}>
                  {option.text}
                </p>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 pb-52 lg:pb-0">
          <button className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors text-xs sm:text-base shadow-lg shadow-blue-600/20">
            {t('confirmAnswer')}
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentQuestionNumber((n) => Math.min(TOTAL_QUESTIONS, n + 1));
              setSelectedOption(null);
              setShowResult(false);
            }}
            disabled={currentQuestionNumber >= TOTAL_QUESTIONS}
            className="flex-1 lg:flex-none bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:pointer-events-none text-[var(--text-primary)] font-bold px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors text-xs sm:text-base border border-[var(--border)]"
          >
            {t('nextQuestion')}
          </button>
        </div>
      </div>
    </SmoothScroll>
  );
};

export default MainContent;
