import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, RotateCcw, ArrowLeft, Search, Volume2, Loader2 } from 'lucide-react';
import { fetchWordInfo, WordInfo, WordNotFoundError, getCefrLevel } from '../services/oxfordDictionaryService';

interface Flashcard {
  id: number;
  word: string;
  isHidden: boolean;
  wordInfo?: WordInfo;
}

const VocabularyFlashcards: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const vocabularyWords = ['ephemeral', 'ubiquitous', 'serendipity', 'eloquent', 'resilient', 'meticulous', 'pragmatic', 'altruistic'];
  
  const [cards, setCards] = useState<Flashcard[]>(
    vocabularyWords.map((w, i) => ({ id: i, word: w, isHidden: false }))
  );
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showWord, setShowWord] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search state
  const [showSearch, setShowSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<WordInfo | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Audio playback function
  const playAudio = (url: string, accent: string) => {
    const audio = new Audio(url);
    setPlayingAudio(accent);
    audio.onended = () => setPlayingAudio(null);
    audio.play();
  };

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await fetchWordInfo(searchQuery.trim().toLowerCase());
      setSearchResult(result);
    } catch (error) {
      setSearchError(error instanceof WordNotFoundError ? 'Word not found in dictionary' : 'Error searching for word');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Convert CEFR level to IELTS band
  const getIeltsBand = (cefrLevel: string): string => {
    const levelMap: { [key: string]: string } = {
      'A1': '1.0 - 2.5',
      'A2': '3.0 - 4.0',
      'B1': '4.5 - 5.5',
      'B2': '5.5 - 6.5',
      'C1': '7.0 - 8.0',
      'C2': '8.5 - 9.0',
    };
    return levelMap[cefrLevel] || 'N/A';
  };
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Time's up, automatically show result
      setShowResult(true);
    }
  }, [countdown]);

  // Load word data when a card is activated
  const loadWordData = async (word: string) => {
    setLoading(true);
    try {
      const wordInfo = await fetchWordInfo(word);
      setCards(prev => prev.map(c => 
        c.word === word ? { ...c, wordInfo } : c
      ));
    } catch (error) {
      console.error('Error loading word data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle single click on card to show word and start timer
  const handleCardClick = async (cardId: number) => {
    if (activeCard === cardId && showWord) return; // Ignore if already active
    
    const card = cards[cardId];
    setActiveCard(cardId);
    setShowWord(true);
    setShowResult(false);
    setCountdown(3);
    
    // Load word data if not already loaded
    if (!card.wordInfo) {
      await loadWordData(card.word);
    }
  };

  // Handle double click to show full result
  const handleDoubleClick = (cardId: number) => {
    if (activeCard !== cardId) return;
    setShowResult(true);
    setCountdown(null);
    
    // Hide this card after 4 seconds and load next
    setTimeout(() => {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, isHidden: true } : c));
      setActiveCard(null);
      setShowWord(false);
      setShowResult(false);
    }, 4000);
  };

  // Reset all hidden cards
  const resetCards = () => {
    setCards(prev => prev.map(c => ({ ...c, isHidden: false })));
  };

  const visibleCards = cards.filter(c => !c.isHidden);
  const activeCardData = activeCard !== null ? cards[activeCard] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">English Vocabulary Flashcards</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={resetCards}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Cards
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-slate-300">
            <strong>How to use:</strong> Single-click a card to reveal the English word. You have 3 seconds to guess its meaning and word type. Double-click to see the full result from the Oxford Dictionary. The card will then hide and move to the next one.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowSearch(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showSearch 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Search className="w-4 h-4" />
            Dictionary Search
          </button>
          <button
            onClick={() => setShowSearch(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              !showSearch 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Flashcards
          </button>
        </div>

        {/* Search Panel */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700"
          >
            <h2 className="text-xl font-bold mb-4">Search Oxford Dictionary</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Enter an English word..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {searchLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search
              </button>
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {searchError}
              </div>
            )}

            {/* Search Result */}
            {searchResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6"
              >
                {/* Word Header */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <h3 className="text-3xl font-bold capitalize">{searchResult.name}</h3>
                  
                  {/* Pronunciation Buttons */}
                  <div className="flex gap-3">
                    {searchResult.pronunciations.map((pron, idx) => (
                      pron.ipa && (
                        <div key={idx} className="flex flex-col items-center">
                          <button
                            onClick={() => pron.url && playAudio(pron.url, pron.prefix || String(idx))}
                            disabled={!pron.url}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              pron.url 
                                ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' 
                                : 'bg-slate-800 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Volume2 className={`w-5 h-5 ${playingAudio === pron.prefix ? 'text-blue-400' : ''}`} />
                            <span className="font-medium">{pron.prefix}</span>
                          </button>
                          <span className="mt-1 text-sm text-slate-400">{pron.ipa}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Word Type Badge */}
                {searchResult.wordform && (
                  <span className="inline-block px-3 py-1 bg-blue-500 rounded-full text-sm font-medium mb-2 mr-2">
                    {searchResult.wordform}
                  </span>
                )}

                {/* CEFR Level Badge */}
                {(() => {
                  const level = searchResult.cefrLevel || getCefrLevel(searchResult.name);
                  return level && (
                    <span className="inline-block px-3 py-1 bg-green-600 rounded-full text-sm font-medium mb-2 mr-2">
                      {level}
                    </span>
                  );
                })()}

                {/* IELTS Band Indicator */}
                {(() => {
                  const level = searchResult.cefrLevel || getCefrLevel(searchResult.name);
                  return level && (
                    <span className="inline-block px-3 py-1 bg-purple-600 rounded-full text-sm font-medium mb-2">
                      IELTS {getIeltsBand(level)}
                    </span>
                  );
                })()}

                {/* Property (e.g., transitive, countable) */}
                {searchResult.property && (
                  <p className="text-slate-400 text-sm mb-4 italic">{searchResult.property}</p>
                )}

                {/* Definitions */}
                <div className="space-y-4">
                  {searchResult.definitions.map((ns, nsIdx) => (
                    <div key={nsIdx}>
                      {ns.namespace && ns.namespace !== '__GLOBAL__' && (
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">{ns.namespace}</h4>
                      )}
                      {ns.definitions.map((def, defIdx) => (
                        <div key={defIdx} className="mb-4 pl-4 border-l-2 border-slate-600">
                          {/* Definition Description */}
                          {def.description && (
                            <p className="text-slate-200 mb-2">
                              <span className="text-slate-400">{defIdx + 1}.</span> {def.description}
                            </p>
                          )}
                          
                          {/* Examples */}
                          {def.examples.length > 0 && (
                            <ul className="space-y-1 ml-4">
                              {def.examples.map((ex, exIdx) => (
                                <li key={exIdx} className="text-slate-400 italic text-sm">
                                  "{ex}"
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Idioms Section */}
                {searchResult.idioms.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">Idioms</h4>
                    {searchResult.idioms.map((idiom, idx) => (
                      <div key={idx} className="mb-3">
                        <p className="font-medium text-slate-200">{idiom.name}</p>
                        {idiom.definitions[0]?.description && (
                          <p className="text-slate-400 text-sm ml-4">
                            {idiom.definitions[0].description}
                          </p>
                        )}
                        {idiom.definitions[0]?.examples[0] && (
                          <p className="text-slate-500 text-sm ml-4 italic">
                            "{idiom.definitions[0].examples[0]}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Topics Section */}
                {searchResult.topics && searchResult.topics.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-3">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.topics.map((topic, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-cyan-600/30 border border-cyan-500/50 rounded-full text-sm text-cyan-300"
                        >
                          {topic.name}
                          {topic.cefr && (
                            <span className="ml-1 text-xs text-cyan-400">({topic.cefr.toUpperCase()})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby Words Section */}
                {searchResult.nearbyWords && searchResult.nearbyWords.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-amber-400 mb-3">Nearby Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.nearbyWords.map((nearby, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(nearby.name.split(' ')[0]);
                            handleSearch();
                          }}
                          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600 border border-slate-600 rounded-full text-sm transition-colors"
                        >
                          {nearby.name}
                          {nearby.wordform && (
                            <span className="ml-1 text-xs text-slate-400">({nearby.wordform})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Flashcards Grid - Only show when not in search mode */}
        {!showSearch && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
            {visibleCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                onClick={() => handleCardClick(card.id)}
                onDoubleClick={() => handleDoubleClick(card.id)}
                className={`relative aspect-square rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 border-2 overflow-hidden ${
                  activeCard === card.id
                    ? 'bg-blue-600 border-blue-400 scale-105 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                {/* Card front - hidden word state */}
                {!showWord || activeCard !== card.id ? (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-2xl">?</span>
                    </div>
                    <p className="text-slate-400 text-sm">Click to reveal</p>
                  </div>
                ) : (
                  /* Active card - showing word */
                  <div className="text-center w-full h-full flex flex-col">
                    {loading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    ) : !showResult ? (
                      <>
                        <h3 className="text-2xl font-bold mb-4 capitalize">{card.word}</h3>
                        {countdown !== null && (
                          <div className="flex items-center justify-center gap-2 text-yellow-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-2xl font-bold">{countdown}</span>
                          </div>
                        )}
                        <p className="text-slate-300 text-sm mt-4">Double-click to reveal answer</p>
                      </>
                    ) : (
                      /* Show full result from Oxford dictionary */
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-left overflow-y-auto flex-1"
                      >
                        <h3 className="text-xl font-bold mb-2 capitalize">{activeCardData?.word}</h3>
                        {activeCardData?.wordInfo?.wordform && (
                          <span className="inline-block px-2 py-1 bg-blue-500 rounded text-xs mb-3">
                            {activeCardData.wordInfo.wordform}
                          </span>
                        )}
                        {activeCardData?.wordInfo?.definitions[0]?.definitions[0]?.description && (
                          <p className="text-sm text-slate-200 mb-3">
                            <strong>Meaning:</strong> {activeCardData.wordInfo.definitions[0].definitions[0].description}
                          </p>
                        )}
                        {activeCardData?.wordInfo?.definitions[0]?.definitions[0]?.examples[0] && (
                          <p className="text-xs text-slate-400 italic">
                            <strong>Example:</strong> {activeCardData.wordInfo.definitions[0].definitions[0].examples[0]}
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
        )}

        {/* All cards completed */}
        {!showSearch && visibleCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h2 className="text-3xl font-bold mb-4">🎉 Great job!</h2>
            <p className="text-slate-400 mb-8">You've completed all the flashcards</p>
            <button
              onClick={resetCards}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold"
            >
              Start Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VocabularyFlashcards;