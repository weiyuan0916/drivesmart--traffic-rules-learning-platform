import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Clock, RotateCcw, ArrowLeft, Search, Volume2, Loader2,
  Mic, BookMarked, Home, BarChart2, Sparkles, ChevronRight,
  X, Trash2, TrendingUp, Target, Zap, Star, ChevronLeft
} from 'lucide-react';
import { fetchWordInfo, WordInfo, WordNotFoundError, getCefrLevel, commonWords } from '../services/oxfordDictionaryService';

// ─── Types ───────────────────────────────────────────────────────────────────

type DictView = 'home' | 'search' | 'flashcards';

interface Flashcard {
  id: number;
  word: string;
  isHidden: boolean;
  wordInfo?: WordInfo;
}

interface LearningProgress {
  totalSearches: number;
  wordsStudied: number;
  cardsLearned: number;
  streakDays: number;
  lastVisit: string;
  lastWord: string | null;
}

interface StorageState {
  recentSearches: string[];
  progress: LearningProgress;
  vocabularyWords: string[];
  learnedCardIds: number[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'drivesmart_dict_v2';

const defaultProgress: LearningProgress = {
  totalSearches: 0,
  wordsStudied: 0,
  cardsLearned: 0,
  streakDays: 0,
  lastVisit: '',
  lastWord: null,
};

const defaultVocabulary = ['ephemeral', 'ubiquitous', 'serendipity', 'eloquent', 'resilient', 'meticulous', 'pragmatic', 'altruistic'];

function loadStorage(): StorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { recentSearches: [], progress: defaultProgress, vocabularyWords: defaultVocabulary, learnedCardIds: [] };
    return JSON.parse(raw) as StorageState;
  } catch {
    return { recentSearches: [], progress: defaultProgress, vocabularyWords: defaultVocabulary, learnedCardIds: [] };
  }
}

function saveStorage(state: StorageState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* storage unavailable */ }
}

function isSameDay(a: string, b: string) {
  return a.split('T')[0] === b.split('T')[0];
}

function fnv32a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

function getWordOfTheDay(): string {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const idx = Math.abs(fnv32a(today)) % commonWords.length;
  return commonWords[idx];
}

function getIeltsBand(cefrLevel: string): string {
  const map: Record<string, string> = {
    'A1': '1.0 – 2.5', 'A2': '3.0 – 4.0',
    'B1': '4.5 – 5.5', 'B2': '5.5 – 6.5',
    'C1': '7.0 – 8.0', 'C2': '8.5 – 9.0',
  };
  return map[cefrLevel] || 'N/A';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// --- ProgressCard ---
function ProgressCard({ progress }: { progress: LearningProgress }) {
  const streakActive = progress.lastVisit && isSameDay(progress.lastVisit, new Date().toISOString());
  const completionPct = Math.round((progress.cardsLearned / 8) * 100);

  const stats = [
    { label: 'Searches', value: progress.totalSearches, icon: <Search className="w-4 h-4" />, color: 'blue' },
    { label: 'Words', value: progress.wordsStudied, icon: <BookOpen className="w-4 h-4" />, color: 'green' },
    { label: 'Cards', value: progress.cardsLearned, icon: <BookMarked className="w-4 h-4" />, color: 'purple' },
    { label: 'Streak', value: progress.streakDays, icon: <Zap className="w-4 h-4" />, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="dict-glass rounded-2xl p-5 border-dict-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-dict-text-secondary uppercase tracking-wider">Your Progress</h3>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">{progress.streakDays}d streak</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-dict-text-muted">Flashcard mastery</span>
          <span className="text-xs font-bold text-dict-text-secondary">{completionPct}%</span>
        </div>
        <div className="h-2 bg-dict-surface-raised rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl border ${colorMap[s.color]} bg-dict-surface`}>
            {s.icon}
            <div>
              <p className="text-lg font-bold leading-none">{s.value}</p>
              <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- WordOfTheDayCard ---
function WordOfTheDayCard({ word, onExplore }: { word: string; onExplore: (w: string) => void }) {
  const level = getCefrLevel(word);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full" />

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Word of the Day</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-black text-dict-text-primary capitalize mb-2">{word}</h3>
          <div className="flex items-center gap-2">
            {level && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {level}
              </span>
            )}
            <span className="text-xs text-dict-text-muted">IELTS {getIeltsBand(level || '')}</span>
          </div>
        </div>

        <button
          onClick={() => onExplore(word)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30 min-h-[44px]"
        >
          Explore
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// --- RecentSearchList ---
function RecentSearchList({ searches, onSelect, onClear }: {
  searches: string[]; onSelect: (w: string) => void; onClear: () => void;
}) {
  if (searches.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-dict-text-secondary uppercase tracking-wider">Recent Searches</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-dict-text-muted hover:text-red-400 transition-colors min-h-[44px] px-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.slice(0, 6).map((word) => (
          <button
            key={word}
            onClick={() => onSelect(word)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dict-surface-raised hover:bg-dict-surface-hover border border-dict-border text-sm text-dict-text-secondary hover:text-dict-text-primary transition-all capitalize min-h-[44px]"
          >
            <Clock className="w-3.5 h-3.5 opacity-50" />
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- ContinueLearningCard ---
function ContinueLearningCard({ lastWord, onContinue }: {
  lastWord: string | null; onContinue: () => void;
}) {
  if (!lastWord) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onContinue}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-600/15 to-blue-600/15 border border-purple-500/30 hover:border-purple-400/50 transition-all group min-h-[80px]"
    >
      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
        <TrendingUp className="w-5 h-5 text-purple-400" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1">Continue Learning</p>
        <p className="text-base font-bold text-dict-text-primary capitalize">{lastWord}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
    </motion.button>
  );
}

// --- EmptyState (home with no history) ---
function HomeEmptyState({ onSearch }: { onSearch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-16 px-6"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-dict-text-primary mb-2">Start your vocabulary journey</h2>
      <p className="text-sm text-dict-text-secondary mb-6 max-w-xs">
        Search any English word to see definitions, pronunciations, and examples — or explore today's featured word.
      </p>
      <button
        onClick={onSearch}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-colors min-h-[48px]"
      >
        <Search className="w-4 h-4" />
        Search a word
      </button>
    </motion.div>
  );
}

// --- BottomNav ---
function BottomNav({ active, onChange }: { active: DictView; onChange: (v: DictView) => void }) {
  const items: { view: DictView; icon: React.ReactNode; label: string }[] = [
    { view: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { view: 'search', icon: <Search className="w-5 h-5" />, label: 'Search' },
    { view: 'flashcards', icon: <BookMarked className="w-5 h-5" />, label: 'Cards' },
  ];

  return (
    <nav
      role="tablist"
      aria-label="Dictionary navigation"
      className="fixed bottom-0 inset-x-0 z-50 dict-glass border-t border-dict-border-safe"
    >
      <div className="flex items-center justify-around px-2 pt-1 pb-safe">
        {items.map((item) => {
          const isActive = active === item.view;
          return (
            <button
              key={item.view}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.view)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl transition-all min-w-[64px] min-h-[56px] ${
                isActive
                  ? 'text-blue-400 bg-blue-500/15'
                  : 'text-dict-text-muted hover:text-dict-text-secondary'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-2 w-1 h-1 rounded-full bg-blue-400"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// --- SidebarNav ---
function SidebarNav({ active, onChange }: { active: DictView; onChange: (v: DictView) => void }) {
  const items: { view: DictView; icon: React.ReactNode; label: string }[] = [
    { view: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { view: 'search', icon: <Search className="w-5 h-5" />, label: 'Search' },
    { view: 'flashcards', icon: <BookMarked className="w-5 h-5" />, label: 'Flashcards' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-dict-surface border-r border-dict-border min-h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-dict-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-dict-text-primary leading-none">Dictionary</h1>
          <p className="text-xs text-dict-text-muted mt-0.5">Oxford Learner</p>
        </div>
      </div>

      {/* Nav items */}
      <nav role="tablist" aria-label="Dictionary navigation" className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = active === item.view;
          return (
            <button
              key={item.view}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border-l-2 border-blue-400'
                  : 'text-dict-text-secondary hover:text-dict-text-primary hover:bg-dict-surface-raised'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Stats summary */}
      <div className="px-4 py-5 border-t border-dict-border">
        <div className="flex items-center gap-2 text-xs text-dict-text-muted mb-2">
          <Star className="w-3.5 h-3.5" />
          Keep learning daily
        </div>
        <div className="h-1.5 bg-dict-surface-raised rounded-full overflow-hidden">
          <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>
      </div>
    </aside>
  );
}

// --- WordResultCard (extracted+styled existing content) ---
function WordResultCard({
  wordInfo,
  onClose,
  onSearchAnother,
}: {
  wordInfo: WordInfo;
  onClose: () => void;
  onSearchAnother: () => void;
}) {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const playAudio = useCallback((url: string, accent: string) => {
    const audio = new Audio(url);
    setPlayingAudio(accent);
    audio.onended = () => setPlayingAudio(null);
    audio.play();
  }, []);

  const level = wordInfo.cefrLevel || getCefrLevel(wordInfo.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="bg-dict-surface rounded-2xl border border-dict-border overflow-hidden"
    >
      {/* Word header */}
      <div className="p-5 border-b border-dict-border">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-black text-dict-text-primary capitalize">{wordInfo.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={onSearchAnother}
              className="p-2 rounded-xl bg-dict-surface-raised hover:bg-dict-surface-hover text-dict-text-muted hover:text-dict-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Search another word"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-dict-surface-raised hover:bg-red-500/20 text-dict-text-muted hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close result"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pronunciation */}
        {wordInfo.pronunciations.some(p => p.ipa) && (
          <div className="flex gap-3 mb-4">
            {wordInfo.pronunciations.map((pron, idx) =>
              pron.ipa ? (
                <button
                  key={idx}
                  onClick={() => pron.url && playAudio(pron.url, pron.prefix || String(idx))}
                  disabled={!pron.url}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all min-h-[44px] ${
                    pron.url
                      ? 'bg-dict-surface-raised hover:bg-dict-surface-hover cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  } ${playingAudio === pron.prefix ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <Mic className={`w-4 h-4 ${playingAudio === pron.prefix ? 'text-blue-400' : 'text-dict-text-muted'}`} />
                  <div className="text-left">
                    <span className="text-[10px] text-dict-text-muted font-medium">{pron.prefix}</span>
                    <p className="text-sm font-semibold text-dict-text-primary">{pron.ipa}</p>
                  </div>
                </button>
              ) : null
            )}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {wordInfo.wordform && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {wordInfo.wordform}
            </span>
          )}
          {level && (
            <>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {level}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                IELTS {getIeltsBand(level)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Definitions */}
      <div className="p-5 space-y-5 max-h-[50vh] overflow-y-auto dict-scrollbar">
        {wordInfo.definitions.map((ns, nsIdx) => (
          <div key={nsIdx}>
            {ns.namespace && ns.namespace !== '__GLOBAL__' && (
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">{ns.namespace}</h4>
            )}
            {ns.definitions.map((def, defIdx) => (
              <div key={defIdx} className="mb-4">
                {def.description && (
                  <p className="text-sm text-dict-text-secondary mb-2 leading-relaxed">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-dict-surface-raised text-[10px] text-dict-text-muted font-bold mr-2 shrink-0">
                      {defIdx + 1}
                    </span>
                    {def.description}
                  </p>
                )}
                {def.examples.length > 0 && (
                  <div className="ml-7 space-y-1">
                    {def.examples.slice(0, 2).map((ex, exIdx) => (
                      <p key={exIdx} className="text-xs text-dict-text-muted italic pl-3 border-l-2 border-dict-border">
                        &ldquo;{ex}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Topics */}
        {wordInfo.topics && wordInfo.topics.length > 0 && (
          <div className="pt-4 border-t border-dict-border">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Related Topics</h4>
            <div className="flex flex-wrap gap-2">
              {wordInfo.topics.map((topic, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {topic.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Words */}
        {wordInfo.nearbyWords && wordInfo.nearbyWords.length > 0 && (
          <div className="pt-4 border-t border-dict-border">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Related Words</h4>
            <div className="flex flex-wrap gap-2">
              {wordInfo.nearbyWords.slice(0, 8).map((nearby, idx) => {
                const cleanName = nearby.name
                  .replace(/\s+(noun|verb|adjective|adverb|preposition|conjunction|pronoun|phrase|determiner|auxiliary|combining form)$/i, '')
                  .trim();
                return (
                  <span key={idx} className="px-3 py-1.5 rounded-lg text-sm bg-dict-surface-raised text-dict-text-secondary border border-dict-border">
                    <span className="font-semibold">{cleanName}</span>
                    {nearby.wordform && <span className="text-dict-text-muted ml-1">({nearby.wordform})</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const VocabularyFlashcards: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // View routing — replaces showSearch boolean
  const [currentView, setCurrentView] = useState<DictView>('home');

  // Storage state
  const [storage, setStorage] = useState<StorageState>(() => loadStorage());

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<WordInfo | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Flashcard state (preserved from original)
  const vocabularyWords = storage.vocabularyWords;
  const [cards, setCards] = useState<Flashcard[]>(
    vocabularyWords.map((w, i) => ({
      id: i,
      word: w,
      isHidden: storage.learnedCardIds.includes(i),
    }))
  );
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showWord, setShowWord] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  // Persist helpers
  const updateStorage = useCallback((updater: (prev: StorageState) => StorageState) => {
    setStorage(prev => {
      const next = updater(prev);
      saveStorage(next);
      return next;
    });
  }, []);

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toISOString();
    updateStorage(prev => {
      const last = prev.progress.lastVisit;
      const newStreak = last && isSameDay(last, today)
        ? prev.progress.streakDays
        : last && isSameDay(last, new Date(Date.now() - 86400000).toISOString())
          ? prev.progress.streakDays + 1
          : 1;
      return {
        ...prev,
        progress: { ...prev.progress, streakDays: newStreak, lastVisit: today },
      };
    });
  }, [updateStorage]);

  // Countdown effect (preserved from original)
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowResult(true);
    }
  }, [countdown]);

  // ── Search handlers ───────────────────────────────────────────────────────

  const handleSearch = useCallback(async (word?: string) => {
    const query = (word || searchQuery).trim().toLowerCase();
    if (!query) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchQuery(query);

    try {
      const result = await fetchWordInfo(query);
      setSearchResult(result);
      updateStorage(prev => ({
        ...prev,
        recentSearches: [query, ...prev.recentSearches.filter(s => s !== query)].slice(0, 10),
        progress: { ...prev.progress, totalSearches: prev.progress.totalSearches + 1 },
      }));
    } catch (error) {
      setSearchError(error instanceof WordNotFoundError ? `&ldquo;${query}&rdquo; not found in dictionary` : 'Error searching for word');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, updateStorage]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleRecentSelect = useCallback((word: string) => {
    setSearchQuery(word);
    setCurrentView('search');
    setTimeout(() => handleSearch(word), 50);
  }, [handleSearch]);

  const handleWordOfDayExplore = useCallback((word: string) => {
    setSearchQuery(word);
    setCurrentView('search');
    setTimeout(() => handleSearch(word), 50);
  }, [handleSearch]);

  const handleContinueLearning = useCallback(() => {
    if (storage.progress.lastWord) handleRecentSelect(storage.progress.lastWord);
  }, [storage.progress.lastWord, handleRecentSelect]);

  // ── Flashcard handlers (preserved from original) ───────────────────────────

  const loadWordData = useCallback(async (word: string) => {
    setCardLoading(true);
    try {
      const wordInfo = await fetchWordInfo(word);
      setCards(prev => prev.map(c => c.word === word ? { ...c, wordInfo } : c));
    } catch (error) {
      console.error('Error loading word data:', error);
    } finally {
      setCardLoading(false);
    }
  }, []);

  const handleCardClick = useCallback(async (cardId: number) => {
    if (activeCard === cardId && showWord) return;

    const card = cards[cardId];
    setActiveCard(cardId);
    setShowWord(true);
    setShowResult(false);
    setCountdown(3);

    if (!card.wordInfo) await loadWordData(card.word);
  }, [activeCard, showWord, cards, loadWordData]);

  const handleDoubleClick = useCallback((cardId: number) => {
    if (activeCard !== cardId) return;
    setShowResult(true);
    setCountdown(null);

    updateStorage(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        cardsLearned: prev.learnedCardIds.includes(cardId)
          ? prev.progress.cardsLearned
          : prev.progress.cardsLearned + 1,
      },
      learnedCardIds: [...new Set([...prev.learnedCardIds, cardId])],
    }));

    setTimeout(() => {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, isHidden: true } : c));
      setActiveCard(null);
      setShowWord(false);
      setShowResult(false);
    }, 4000);
  }, [activeCard, updateStorage]);

  const resetCards = useCallback(() => {
    setCards(vocabularyWords.map((w, i) => ({ id: i, word: w, isHidden: false })));
      updateStorage(prev => ({
        ...prev,
        learnedCardIds: [],
        progress: { ...prev.progress, cardsLearned: 0 },
      }));
  }, [vocabularyWords, updateStorage]);

  const visibleCards = cards.filter(c => !c.isHidden);
  const activeCardData = activeCard !== null ? cards[activeCard] : null;

  // ── Derived state ──────────────────────────────────────────────────────────

  const wordOfTheDay = getWordOfTheDay();
  const progress = storage.progress;

  // ── Render views ───────────────────────────────────────────────────────────

  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Hero greeting */}
      <div>
        <h2 className="text-2xl font-black text-dict-text-primary mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-dict-text-secondary">
          Expand your vocabulary — one word at a time.
        </p>
      </div>

      {/* Quick search bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search any English word…"
          className="w-full px-5 py-4 pl-12 bg-dict-surface-raised border border-dict-border rounded-2xl text-dict-text-primary placeholder-dict-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[52px]"
          aria-label="Search dictionary"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dict-text-muted" />
        {searchQuery.trim() ? (
          <button
            onClick={() => handleSearch()}
            disabled={searchLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-400 disabled:bg-dict-surface-hover rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Submit search"
          >
            {searchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white" />
            )}
          </button>
        ) : null}
      </div>

      {/* Continue Learning */}
      <ContinueLearningCard
        lastWord={progress.lastWord}
        onContinue={handleContinueLearning}
      />

      {/* Word of the Day */}
      <WordOfTheDayCard word={wordOfTheDay} onExplore={handleWordOfDayExplore} />

      {/* Progress */}
      <ProgressCard progress={progress} />

      {/* Recent Searches */}
      <RecentSearchList
        searches={storage.recentSearches}
        onSelect={handleRecentSelect}
        onClear={() => updateStorage(prev => ({ ...prev, recentSearches: [] }))}
      />

      {/* Empty state */}
      {storage.recentSearches.length === 0 && progress.totalSearches === 0 && (
        <HomeEmptyState onSearch={() => setCurrentView('search')} />
      )}
    </motion.div>
  );

  const renderSearch = () => (
    <motion.div
      key="search"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search any English word…"
          className="w-full px-5 py-4 pl-12 bg-dict-surface-raised border border-dict-border rounded-2xl text-dict-text-primary placeholder-dict-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[52px]"
          aria-label="Search dictionary"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dict-text-muted" />
        {searchLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        ) : searchQuery.trim() ? (
          <button
            onClick={() => { setSearchQuery(''); setSearchResult(null); setSearchError(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-dict-text-muted hover:text-dict-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Inline recent searches */}
      {storage.recentSearches.length > 0 && !searchResult && (
        <div>
          <p className="text-xs text-dict-text-muted font-semibold uppercase tracking-wider mb-3">Recent</p>
          <div className="flex flex-wrap gap-2">
            {storage.recentSearches.slice(0, 5).map(word => (
              <button
                key={word}
                onClick={() => handleRecentSelect(word)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dict-surface-raised border border-dict-border text-sm text-dict-text-secondary hover:text-dict-text-primary hover:bg-dict-surface-hover transition-all capitalize min-h-[44px]"
              >
                <Clock className="w-3.5 h-3.5 opacity-50" />
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {searchError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
        >
          <p className="text-sm text-red-400">{searchError}</p>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence mode="wait">
        {searchResult && (
          <WordResultCard
            key={searchResult.name}
            wordInfo={searchResult}
            onClose={() => { setSearchResult(null); updateStorage(prev => ({ ...prev, progress: { ...prev.progress, wordsStudied: prev.progress.wordsStudied + 1, lastWord: searchResult.name } })); }}
            onSearchAnother={() => { setSearchResult(null); setSearchQuery(''); }}
          />
        )}
      </AnimatePresence>

      {/* Search prompt when idle */}
      {!searchResult && !searchError && !searchLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-dict-surface-raised border border-dict-border flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-dict-text-muted" />
          </div>
          <p className="text-sm text-dict-text-muted">Type a word above to search</p>
        </div>
      )}
    </motion.div>
  );

  const renderFlashcards = () => (
    <motion.div
      key="flashcards"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Stats bar */}
      <div className="flex items-center justify-between p-4 bg-dict-surface rounded-2xl border border-dict-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dict-text-primary">Flashcards</p>
            <p className="text-xs text-dict-text-muted">{visibleCards.length} of {cards.length} remaining</p>
          </div>
        </div>
        <button
          onClick={resetCards}
          className="flex items-center gap-2 px-4 py-2.5 bg-dict-surface-raised hover:bg-dict-surface-hover rounded-xl text-sm font-semibold text-dict-text-secondary hover:text-dict-text-primary transition-all border border-dict-border min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <AnimatePresence>
          {visibleCards.map(card => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.9, y: -16 }}
              onClick={() => handleCardClick(card.id)}
              onDoubleClick={() => handleDoubleClick(card.id)}
              className={`relative aspect-square rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 border overflow-hidden select-none ${
                activeCard === card.id
                  ? 'bg-gradient-to-br from-blue-600/80 to-purple-600/80 border-blue-400/60 shadow-xl'
                  : 'bg-dict-surface border-dict-border hover:border-dict-border-hover hover:bg-dict-surface-raised'
              }`}
            >
              {!showWord || activeCard !== card.id ? (
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-dict-surface-raised flex items-center justify-center">
                    <span className="text-2xl opacity-30">?</span>
                  </div>
                  <p className="text-dict-text-muted text-xs">Tap to reveal</p>
                </div>
              ) : (
                <div className="text-center w-full h-full flex flex-col">
                  {cardLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  ) : !showResult ? (
                    <>
                      <h3 className="text-lg font-black text-dict-text-primary mb-2 capitalize">{card.word}</h3>
                      {countdown !== null && (
                        <div className="flex items-center justify-center gap-2 text-amber-400">
                          <Clock className="w-5 h-5" />
                          <span className="text-3xl font-black">{countdown}</span>
                        </div>
                      )}
                      <p className="text-dict-text-muted text-xs mt-3">Double tap for answer</p>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-left overflow-y-auto flex-1 w-full"
                    >
                      <h3 className="text-base font-black text-dict-text-primary mb-1.5 capitalize">{activeCardData?.word}</h3>
                      {activeCardData?.wordInfo?.wordform && (
                        <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-semibold mb-2">
                          {activeCardData.wordInfo.wordform}
                        </span>
                      )}
                      {activeCardData?.wordInfo?.definitions[0]?.definitions[0]?.description && (
                        <p className="text-xs text-dict-text-secondary leading-relaxed">
                          {activeCardData.wordInfo.definitions[0].definitions[0].description}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* All done state */}
      {visibleCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-dict-text-primary mb-2">All done!</h2>
          <p className="text-sm text-dict-text-secondary mb-6">
            You&apos;ve mastered all {cards.length} flashcards. Ready for a new round?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetCards}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/25 min-h-[48px]"
            >
              <span className="flex items-center gap-2 justify-center">
                <RotateCcw className="w-4 h-4" />
                Start Again
              </span>
            </button>
            <button
              onClick={() => setCurrentView('search')}
              className="px-6 py-3 bg-dict-surface-raised hover:bg-dict-surface-hover rounded-xl font-bold text-dict-text-primary border border-dict-border transition-all min-h-[48px]"
            >
              <span className="flex items-center gap-2 justify-center">
                <Search className="w-4 h-4" />
                Search a Word
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="dict-theme min-h-screen bg-[var(--dict-bg,#0C0E16)] text-[var(--dict-text-primary,#F1F3F9)] flex">
      {/* Sidebar — tablet/desktop */}
      <SidebarNav active={currentView} onChange={setCurrentView} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 dict-glass border-b border-dict-border">
          {/* Mobile top bar */}
          <div className="lg:hidden px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-dict-text-primary leading-none">Dictionary</h1>
                <p className="text-[10px] text-dict-text-muted">Oxford Learner</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-dict-surface-raised hover:bg-dict-surface-hover text-dict-text-muted hover:text-dict-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop back button */}
          <div className="hidden lg:flex items-center gap-4 px-6 py-4 border-b border-dict-border">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-dict-text-muted hover:text-dict-text-primary transition-colors min-h-[44px] px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-4 w-px bg-dict-border" />
            <h2 className="text-base font-bold text-dict-text-primary">Oxford Learner Dictionary</h2>
          </div>

          {/* Desktop view tabs */}
          <div className="hidden lg:flex px-6 pt-3 gap-2">
            {(['home', 'search', 'flashcards'] as DictView[]).map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                  currentView === view
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'text-dict-text-muted hover:text-dict-text-secondary hover:bg-dict-surface-raised'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          <div className="hidden lg:block pb-3" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto dict-scrollbar">
          <div className="max-w-2xl mx-auto px-4 py-6 pb-28 lg:pb-8">
            <AnimatePresence mode="wait">
              {currentView === 'home' && renderHome()}
              {currentView === 'search' && renderSearch()}
              {currentView === 'flashcards' && renderFlashcards()}
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom nav — mobile only */}
        <BottomNav active={currentView} onChange={setCurrentView} />
      </div>
    </div>
  );
};

export default VocabularyFlashcards;
