import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, RotateCcw, ArrowLeft } from 'lucide-react';
import { fetchWordInfo, WordInfo } from '../services/oxfordDictionaryService';

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

  // Start countdown when word is shown
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
            <strong>How to use:</strong> Single-click a card to reveal the English word • You have 3 seconds to guess its meaning and word type • Double-click to see the full result from the Oxford Dictionary • The card will then hide and move to the next one
          </p>
        </div>

        {/* Flashcards Grid */}
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

        {/* All cards completed */}
        {visibleCards.length === 0 && (
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