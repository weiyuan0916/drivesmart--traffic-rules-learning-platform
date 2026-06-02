import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

export type QuestionOrder = 'sequential' | 'shuffle';
export type FontSizeLevel = 1 | 2 | 3 | 4 | 5;

interface SettingsState {
  showAllAnswers: boolean;
  questionOrder: QuestionOrder;
  fontSizeLevel: FontSizeLevel;
}

interface SettingsContextType extends SettingsState {
  setShowAllAnswers: (v: boolean) => void;
  setQuestionOrder: (o: QuestionOrder) => void;
  setFontSizeLevel: (l: FontSizeLevel) => void;
  resetSettings: () => void;
}

const DEFAULTS: SettingsState = {
  showAllAnswers: false,
  questionOrder: 'sequential',
  fontSizeLevel: 3,
};

const LS_KEY = 'appSettings';

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        showAllAnswers: Boolean(parsed.showAllAnswers),
        questionOrder: parsed.questionOrder === 'shuffle' ? 'shuffle' : 'sequential',
        fontSizeLevel: Math.min(5, Math.max(1, Number(parsed.fontSizeLevel) || 3)) as FontSizeLevel,
      };
    }
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setPreference } = useTheme();
  const { setLanguage } = useLanguage();

  const [state, setState] = useState<SettingsState>(loadSettings);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    document.documentElement.setAttribute('data-font-size', String(state.fontSizeLevel));
  }, [state]);

  const setShowAllAnswers = useCallback((v: boolean) => {
    setState((s) => ({ ...s, showAllAnswers: v }));
  }, []);

  const setQuestionOrder = useCallback((o: QuestionOrder) => {
    setState((s) => ({ ...s, questionOrder: o }));
  }, []);

  const setFontSizeLevel = useCallback((l: FontSizeLevel) => {
    setState((s) => ({ ...s, fontSizeLevel: l }));
  }, []);

  const resetSettings = useCallback(() => {
    setState({ ...DEFAULTS });
    setPreference('dark');
    setLanguage('vi');
  }, [setPreference, setLanguage]);

  return (
    <SettingsContext.Provider
      value={{
        ...state,
        setShowAllAnswers,
        setQuestionOrder,
        setFontSizeLevel,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
