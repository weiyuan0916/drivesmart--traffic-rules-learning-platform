import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ArrowLeft, 
  Search, 
  Loader2, 
  Mic, 
  BookMarked,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  List,
  Flame,
  Star,
  Trophy,
  Crown,
  Zap,
  Target,
  Clock,
  ChevronRight as ChevronRightIcon,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageCircle,
  Headphones,
  Sparkles,
  Award,
  RefreshCw,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { SmoothScroll } from './SmoothScroll';
import opalData from '../../opal_extracted.json';

interface OPALItem {
  headword: string;
  uk_mp3: string | null;
  us_mp3: string | null;
  href: string | null;
  pos: string | null;
  category: string;
}

type OPALCategory = 'spoken_phrases' | 'written_phrases' | 'written' | 'spoken';

interface CategoryInfo {
  id: OPALCategory;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  colorHex: string;
  gradient: string;
  bgGradient: string;
  description: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'spoken_phrases',
    name: 'Spoken Phrases',
    shortName: 'Speak',
    icon: '💬',
    color: 'text-blue-400',
    colorHex: '#60A5FA',
    gradient: 'from-blue-500 to-cyan-400',
    bgGradient: 'bg-gradient-to-br from-blue-600/20 to-cyan-500/20',
    description: 'Essential phrases for everyday conversations'
  },
  {
    id: 'written_phrases',
    name: 'Written Phrases',
    shortName: 'Write',
    icon: '✍️',
    color: 'text-emerald-400',
    colorHex: '#34D399',
    gradient: 'from-emerald-500 to-teal-400',
    bgGradient: 'bg-gradient-to-br from-emerald-600/20 to-teal-500/20',
    description: 'Professional phrases for written communication'
  },
  {
    id: 'written',
    name: 'Written Vocab',
    shortName: 'Vocab',
    icon: '📝',
    color: 'text-purple-400',
    colorHex: '#A78BFA',
    gradient: 'from-purple-500 to-pink-400',
    bgGradient: 'bg-gradient-to-br from-purple-600/20 to-pink-500/20',
    description: 'Academic vocabulary for writing excellence'
  },
  {
    id: 'spoken',
    name: 'Spoken Vocab',
    shortName: 'Voice',
    icon: '🎤',
    color: 'text-amber-400',
    colorHex: '#FBBF24',
    gradient: 'from-amber-500 to-orange-400',
    bgGradient: 'bg-gradient-to-br from-amber-600/20 to-orange-500/20',
    description: 'Vocabulary for fluent speaking'
  }
];

const MP3_BASE_URL = 'https://www.oxfordlearnersdictionaries.com';

// Mock user data
const USER_DATA = {
  streak: 7,
  xp: 2450,
  dailyGoal: 5,
  dailyProgress: 3,
  totalLearned: 156,
  isPremium: false,
  lastCategory: 'written',
  lastSubcategory: 'Sublist 1',
  lastProgress: 45,
};

// Level indicators
const LEVELS = ['A2', 'B1', 'B2', 'C1'];

type PracticeMode = 'phrases' | 'listen_repeat' | 'conversation' | 'feedback';

const OPALFlashcards: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<OPALCategory>('spoken_phrases');
  const [cards, setCards] = useState<OPALItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownItems, setKnownItems] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(true);
  const [showTopicDetail, setShowTopicDetail] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccent, setSelectedAccent] = useState<'uk' | 'us'>('uk');
  
  // Voice practice states
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('phrases');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingPhrase, setIsPlayingPhrase] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState(0);
  const [feedbackTip, setFeedbackTip] = useState('');
  const [conversationTurn, setConversationTurn] = useState(0);
  const [isAITalking, setIsAITalking] = useState(false);
  
  // Topic progress (mock)
  const [topicProgress, setTopicProgress] = useState(45);

  // Touch/swipe state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = Math.abs(touchStartY.current - (touchStartY.current || 0));
    
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
      const currentIdx = CATEGORIES.findIndex(c => c.id === activeCategory);
      
      if (diffX > 0 && currentIdx < CATEGORIES.length - 1) {
        const nextCat = CATEGORIES[currentIdx + 1];
        setActiveCategory(nextCat.id);
        setShowCategories(true);
        setCards([]);
      } else if (diffX < 0 && currentIdx > 0) {
        const prevCat = CATEGORIES[currentIdx - 1];
        setActiveCategory(prevCat.id);
        setShowCategories(true);
        setCards([]);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const opal = opalData as Record<OPALCategory, OPALItem[]>;

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, OPALItem[]> = {};
    const currentItems = opal[activeCategory] || [];
    
    currentItems.forEach(item => {
      const cat = item.category;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    });
    
    return grouped;
  }, [activeCategory, opal]);

  // Get unique categories sorted
  const uniqueCategories = useMemo(() => {
    return Object.keys(itemsByCategory).sort();
  }, [itemsByCategory]);

  const currentItem = cards[currentIndex] || null;

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const query = searchQuery.toLowerCase();
    return cards.filter(card => 
      card.headword.toLowerCase().includes(query) ||
      card.category.toLowerCase().includes(query)
    );
  }, [cards, searchQuery]);

  // Audio playback
  const playAudio = (mp3Url: string | null, accent: 'uk' | 'us') => {
    if (!mp3Url) return;
    
    const fullUrl = mp3Url.startsWith('http') ? mp3Url : `${MP3_BASE_URL}${mp3Url}`;
    const audio = new Audio(fullUrl);
    
    setPlayingAudio(`${currentItem?.headword}-${accent}`);
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      console.error('Failed to load audio:', fullUrl);
      setPlayingAudio(null);
    };
    audio.play().catch(console.error);
  };

  // Play phrase audio
  const playPhraseAudio = (item: OPALItem) => {
    const mp3Url = selectedAccent === 'uk' ? item.uk_mp3 : item.us_mp3;
    if (!mp3Url) return;
    
    setIsPlayingPhrase(true);
    const fullUrl = mp3Url.startsWith('http') ? mp3Url : `${MP3_BASE_URL}${mp3Url}`;
    const audio = new Audio(fullUrl);
    audio.onended = () => setIsPlayingPhrase(false);
    audio.onerror = () => setIsPlayingPhrase(false);
    audio.play().catch(() => setIsPlayingPhrase(false));
  };

  // Navigation
  const goNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setShowFeedback(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setShowFeedback(false);
    }
  };

  const markAsKnown = () => {
    if (currentItem) {
      setKnownItems(prev => new Set([...prev, currentItem.headword]));
    }
    goNext();
  };

  const resetProgress = () => {
    setKnownItems(new Set());
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const selectSubcategory = (category: string) => {
    const subcategoryCards = itemsByCategory[category] || [];
    setCards(subcategoryCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowTopicDetail(true);
    setCurrentTopic(category);
    setPracticeMode('phrases');
    setShowFeedback(false);
    setConversationTurn(0);
  };

  const categoryInfo = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const dailyProgressPercent = (USER_DATA.dailyProgress / USER_DATA.dailyGoal) * 100;

  // Start voice recording
  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      // Generate mock feedback
      const score = Math.floor(Math.random() * 30) + 70;
      setFeedbackScore(score);
      setFeedbackTip(score >= 90 
        ? 'Excellent pronunciation! Try to speak a bit faster.'
        : score >= 80 
          ? 'Good job! Focus on the vowel sounds.'
          : 'Try to relax your jaw and open your mouth more.');
      setShowFeedback(true);
    }, 3000);
  };

  // Start conversation practice
  const startConversation = () => {
    setPracticeMode('conversation');
    setConversationTurn(0);
    simulateAITurn();
  };

  const simulateAITurn = () => {
    setIsAITalking(true);
    setTimeout(() => {
      setIsAITalking(false);
    }, 2000);
  };

  const userResponds = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      if (conversationTurn < 4) {
        setConversationTurn(prev => prev + 1);
        simulateAITurn();
      } else {
        // Conversation complete
        setPracticeMode('feedback');
      }
    }, 2500);
  };

  // Go back from topic detail
  const goBackToTopics = () => {
    setShowTopicDetail(false);
    setCards([]);
    setShowCategories(true);
    setPracticeMode('phrases');
    setShowFeedback(false);
    setConversationTurn(0);
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
    >
      {/* Topic Detail View */}
      <AnimatePresence mode="wait">
        {showTopicDetail ? (
          <motion.div
            key="topic-detail"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header */}
            <header className="shrink-0 sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/90 border-b border-slate-800/50">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={goBackToTopics}
                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${categoryInfo.gradient}`}>
                      B1
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">+50 XP</span>
                    </div>
                  </div>
                </div>
                
                {/* Topic Title & Progress */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryInfo.gradient} flex items-center justify-center`}>
                    <span className="text-2xl">{categoryInfo.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold capitalize">
                      {currentTopic.replace(/_/g, ' ')}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${categoryInfo.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${topicProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400">{topicProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Mode Tabs */}
              <div className="px-4 pb-3">
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
                  {[
                    { id: 'phrases', icon: BookOpen, label: 'Phrases' },
                    { id: 'listen_repeat', icon: Headphones, label: 'Listen & Repeat' },
                    { id: 'conversation', icon: MessageCircle, label: 'Conversation' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setPracticeMode(mode.id as PracticeMode);
                        setShowFeedback(false);
                        if (mode.id === 'conversation') {
                          startConversation();
                        }
                      }}
                      className={`
                        flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-medium text-xs transition-all
                        ${practiceMode === mode.id 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white'
                        }
                      `}
                    >
                      <mode.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Main Content */}
            <SmoothScroll className="flex-1">
              <div className="px-4 py-4">
                
                {/* Phrases Mode */}
                {practiceMode === 'phrases' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Phrase Cards */}
                    {filteredCards.slice(0, 5).map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-2xl bg-slate-800/60 backdrop-blur border border-slate-700/50"
                      >
                        {/* Phrase Text */}
                        <h3 className="text-lg font-semibold mb-3">
                          {item.headword}
                        </h3>
                        
                        {/* Audio Controls */}
                        <div className="flex items-center gap-3 mb-3">
                          <button
                            onClick={() => playPhraseAudio(item)}
                            disabled={isPlayingPhrase}
                            className={`
                              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
                              ${isPlayingPhrase 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-700/80 hover:bg-slate-600 text-slate-200'
                              }
                            `}
                          >
                            {isPlayingPhrase ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Playing...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-5 h-5" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={startRecording}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
                          >
                            <Mic className="w-6 h-6 text-white" />
                          </button>
                        </div>

                        {/* Feedback Display */}
                        {showFeedback && idx === 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-400">Pronunciation Score</span>
                              <span className={`text-lg font-bold ${
                                feedbackScore >= 90 ? 'text-emerald-400' :
                                feedbackScore >= 80 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {feedbackScore}/100
                              </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                              <motion.div
                                className={`h-full rounded-full ${
                                  feedbackScore >= 90 ? 'bg-emerald-500' :
                                  feedbackScore >= 80 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${feedbackScore}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {feedbackTip}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}

                    {/* Practice CTA */}
                    <div className="pt-4 space-y-3">
                      <button
                        onClick={() => setPracticeMode('listen_repeat')}
                        className={`w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${categoryInfo.gradient} flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform`}
                      >
                        <Headphones className="w-6 h-6" />
                        <span>Start Voice Practice</span>
                      </button>
                      <button
                        onClick={shuffleCards}
                        className="w-full py-3 rounded-xl font-medium bg-slate-800/80 border border-slate-700/50 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Shuffle Phrases</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Listen & Repeat Mode */}
                {practiceMode === 'listen_repeat' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                  >
                    {/* Current Phrase */}
                    {currentItem && (
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-4">
                          {currentItem.headword}
                        </h2>
                        
                        {/* Wave Animation */}
                        <div className="flex items-center justify-center gap-1 mb-6 h-12">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={isPlayingPhrase || isRecording ? {
                                height: [8, 24 + Math.random() * 24, 8],
                              } : { height: 8 }}
                              transition={isPlayingPhrase || isRecording ? {
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.05,
                              } : {}}
                              className={`w-1.5 rounded-full ${
                                isRecording 
                                  ? 'bg-red-500' 
                                  : isPlayingPhrase 
                                    ? 'bg-blue-500' 
                                    : 'bg-slate-600'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Play Button */}
                        {!isPlayingPhrase && !isRecording && (
                          <button
                            onClick={() => playPhraseAudio(currentItem)}
                            className={`w-20 h-20 rounded-full bg-gradient-to-r ${categoryInfo.gradient} flex items-center justify-center shadow-xl mb-6 active:scale-95 transition-transform`}
                          >
                            <Play className="w-8 h-8 text-white ml-1" />
                          </button>
                        )}

                        {isPlayingPhrase && (
                          <div className="flex items-center gap-2 text-slate-400 mb-6">
                            <Volume2 className="w-5 h-5 animate-pulse" />
                            <span>Listen carefully...</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recording Button */}
                    <div className="relative">
                      <motion.button
                        onClick={startRecording}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all
                          ${isRecording 
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 animate-pulse shadow-red-500/50' 
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/50'
                          }
                        `}
                      >
                        <Mic className={`w-10 h-10 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                      </motion.button>
                      
                      {isRecording && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                        </motion.div>
                      )}
                    </div>

                    <p className="mt-4 text-slate-400">
                      {isRecording ? 'Recording... Speak now!' : 'Tap to start recording'}
                    </p>

                    {/* Feedback */}
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 rounded-2xl bg-slate-800/80 border border-slate-700/50 w-full max-w-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold">Your Score</span>
                          <div className="flex items-center gap-2">
                            <Award className={`w-6 h-6 ${
                              feedbackScore >= 90 ? 'text-emerald-400' :
                              feedbackScore >= 80 ? 'text-amber-400' : 'text-red-400'
                            }`} />
                            <span className={`text-2xl font-bold ${
                              feedbackScore >= 90 ? 'text-emerald-400' :
                              feedbackScore >= 80 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {feedbackScore}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Pronunciation</span>
                            <span className="font-medium">{Math.min(100, feedbackScore + 5)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Fluency</span>
                            <span className="font-medium">{Math.min(100, feedbackScore - 3)}</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80">
                          <p className="text-sm text-slate-300 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            {feedbackTip}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setShowFeedback(false);
                            goNext();
                          }}
                          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold flex items-center justify-center gap-2"
                        >
                          <SkipForward className="w-4 h-4" />
                          <span>Next Phrase</span>
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Conversation Mode */}
                {practiceMode === 'conversation' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-[60vh] flex flex-col"
                  >
                    {/* Conversation Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/50 mb-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium">AI Conversation</span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Turn {conversationTurn + 1} of 5
                      </p>
                    </div>

                    {/* Conversation Messages */}
                    <div className="flex-1 space-y-4 mb-6">
                      {/* AI Message */}
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo.gradient} flex items-center justify-center shrink-0`}>
                          <span className="text-lg">{categoryInfo.icon}</span>
                        </div>
                        <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/50">
                          {isAITalking ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>AI is typing...</span>
                            </div>
                          ) : (
                            <p className="text-white">
                              {conversationTurn === 0 && "Hello! Can you tell me about yourself?"}
                              {conversationTurn === 1 && "That's great! What do you like to do in your free time?"}
                              {conversationTurn === 2 && "Interesting! How long have you been learning English?"}
                              {conversationTurn === 3 && "Perfect! Can you explain why you want to improve your English?"}
                              {conversationTurn === 4 && "Thank you for the conversation! You did great!"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* User Response Area */}
                      {isAITalking && (
                        <div className="flex justify-end">
                          <div className="p-4 rounded-2xl rounded-tr-none bg-blue-600/20 border border-blue-500/30">
                            <p className="text-slate-400 italic">Your response will appear here...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recording Control */}
                    <div className="sticky bottom-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-4 pb-2">
                      <div className="flex flex-col items-center gap-3">
                        <motion.button
                          onClick={userResponds}
                          whileTap={{ scale: 0.95 }}
                          disabled={isAITalking || isRecording}
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all
                            ${isAITalking 
                              ? 'bg-slate-700 cursor-not-allowed' 
                              : isRecording 
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 animate-pulse' 
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                            }
                          `}
                        >
                          {isRecording ? (
                            <Mic className="w-10 h-10 text-white animate-pulse" />
                          ) : (
                            <Mic className="w-10 h-10 text-white" />
                          )}
                        </motion.button>
                        <p className="text-sm text-slate-400">
                          {isRecording ? 'Recording...' : 'Tap to respond'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Completion/Feedback Mode */}
                {practiceMode === 'feedback' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
                    <p className="text-slate-400 mb-6">You completed the conversation practice</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
                      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                        <p className="text-xl font-bold">+120</p>
                        <p className="text-xs text-slate-500">XP Earned</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                        <p className="text-xl font-bold">85</p>
                        <p className="text-xs text-slate-500">Avg Score</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <p className="text-xl font-bold">5:30</p>
                        <p className="text-xs text-slate-500">Time</p>
                      </div>
                    </div>

                    <button
                      onClick={goBackToTopics}
                      className="w-full max-w-sm py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Continue Learning</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </SmoothScroll>
          </motion.div>
        ) : (
          <motion.div
            key="topics-list"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header with Stats Bar */}
            <header 
              className="shrink-0 sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/50"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              
              {/* Stats Bar */}
              <div className="px-4 py-2 flex items-center justify-between bg-slate-900/50 border-b border-slate-800/30">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-orange-400">{USER_DATA.streak}</span>
                    <span className="text-[9px] text-slate-500 -mt-0.5">day streak</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-violet-400">{USER_DATA.xp.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 -mt-0.5">total XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="#334155" strokeWidth="3" />
                      <circle 
                        cx="16" cy="16" r="13" 
                        fill="none" 
                        stroke="url(#progressGradient)" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${dailyProgressPercent * 0.82} 82`}
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22D3EE" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-cyan-400">
                      {USER_DATA.dailyProgress}/{USER_DATA.dailyGoal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Content */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-lg">{categoryInfo.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-base font-bold">Oxford Phrase Academy</h1>
                    <p className="text-xs text-slate-500">{categoryInfo.name} • {USER_DATA.totalLearned} learned</p>
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-all active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Category Tabs */}
              <div className="px-2 pb-2">
                <div className="grid grid-cols-4 gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setShowCategories(true);
                        setCards([]);
                      }}
                      className={`
                        min-h-[44px] flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg font-medium transition-all duration-200
                        ${activeCategory === cat.id
                          ? `bg-gradient-to-br ${cat.gradient} text-white shadow-lg`
                          : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'
                        }
                      `}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-[9px] font-semibold leading-tight">{cat.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Main Content */}
            <SmoothScroll className="flex-1">
              <div className="px-4 py-4 space-y-4">
                {/* Premium Upsell Card */}
                {!USER_DATA.isPremium && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">Premium</span>
                        </div>
                        <h3 className="text-base font-bold mb-1">Unlock All Features</h3>
                        <p className="text-xs text-slate-400 mb-3">Get unlimited access to all 2,660 phrases, offline mode & AI pronunciation feedback</p>
                        <button className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-sm text-white shadow-lg shadow-amber-500/30 active:scale-95 transition-transform">
                          Start 7-Day Free Trial
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Category Hero */}
                <div className={`text-center p-4 rounded-xl ${categoryInfo.bgGradient} border border-slate-800/50`}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${categoryInfo.gradient} mb-3`}>
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <span className="font-semibold text-sm">{categoryInfo.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{categoryInfo.description}</p>
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Zap className="w-3 h-3" />
                    <span>{(opal[activeCategory] || []).length} phrases available</span>
                  </div>
                </div>

                {/* Subcategory Grid - Enhanced Cards */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    <span>All Topics ({uniqueCategories.length})</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {uniqueCategories.map((category, idx) => {
                      const phraseCount = itemsByCategory[category].length;
                      const progress = Math.floor(Math.random() * 100);
                      const isComplete = progress >= 100;
                      const isStarted = progress > 0;
                      
                      return (
                        <motion.button
                          key={category}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => selectSubcategory(category)}
                          className={`
                            relative p-3 rounded-xl text-left transition-all duration-200 cursor-pointer select-none
                            backdrop-blur border
                            ${isComplete 
                              ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' 
                              : isStarted 
                                ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/90 hover:border-slate-600'
                                : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/80 hover:border-slate-600'
                            }
                          `}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {isComplete && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 ${
                            isComplete 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                              : `bg-gradient-to-br ${categoryInfo.gradient}`
                          }`}>
                            <span className="text-xl">{categoryInfo.icon}</span>
                          </div>
                          
                          <h4 className="text-xs font-semibold mb-1 leading-tight line-clamp-2">
                            {category.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-[10px] text-slate-500 mb-2">
                            {phraseCount} phrases
                          </p>
                          
                          <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                  : `bg-gradient-to-r ${categoryInfo.gradient}`
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                    <Trophy className={`w-5 h-5 mx-auto mb-1 ${categoryInfo.color}`} />
                    <p className="text-lg font-bold">{USER_DATA.totalLearned}</p>
                    <p className="text-[10px] text-slate-500">Phrases Learned</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                    <Clock className={`w-5 h-5 mx-auto mb-1 ${categoryInfo.color}`} />
                    <p className="text-lg font-bold">12h</p>
                    <p className="text-[10px] text-slate-500">Time Spent</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                    <Target className={`w-5 h-5 mx-auto mb-1 ${categoryInfo.color}`} />
                    <p className="text-lg font-bold">{Math.round((USER_DATA.totalLearned / 2660) * 100)}%</p>
                    <p className="text-[10px] text-slate-500">Complete</p>
                  </div>
                </div>
              </div>
            </SmoothScroll>

            {/* Footer */}
            <div className="shrink-0 bg-gradient-to-t from-slate-950 via-slate-900/95 to-transparent pt-6 pb-4 px-4 border-t border-slate-800/50">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <span>Powered by</span>
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Oxford Learner
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OPALFlashcards;
