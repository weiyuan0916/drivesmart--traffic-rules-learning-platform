import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

export const translations: Translations = {
  dashboard: { vi: 'Bảng điều khiển', en: 'Dashboard' },
  aiAnalyzer: { vi: 'Phân tích AI', en: 'AI Analyzer' },
  trafficRules: { vi: 'Luật giao thông', en: 'Traffic Rules' },
  exercise: { vi: 'Bài tập', en: 'Exercise' },
  explanation: { vi: 'Giải thích', en: 'Explanation' },
  correct: { vi: 'Đúng', en: 'Correct' },
  incorrect: { vi: 'Sai', en: 'Incorrect' },
  current: { vi: 'Hiện tại', en: 'Current' },
  unanswered: { vi: 'Chưa trả lời', en: 'Unanswered' },
  republicOfSerbia: { vi: 'Cộng hòa Việt Nam', en: 'Republic of Vietnam' },
  laws: { vi: 'Luật', en: 'Laws' },
  regulations: { vi: 'Quy định', en: 'Regulations' },
  studyLiterature: { vi: 'Tài liệu học tập', en: 'Study Literature' },
  confirmAnswer: { vi: 'Xác nhận câu trả lời', en: 'Confirm Answer' },
  nextQuestion: { vi: 'Câu tiếp theo', en: 'Next Question' },
  finishTest: { vi: 'Kết thúc bài kiểm tra', en: 'Finish Test' },
  category: { vi: 'Hạng', en: 'Category' },
  theoryExam: { vi: 'Thi lý thuyết', en: 'Theory Exam' },
  practicalExam: { vi: 'Thi thực hành', en: 'Practical Exam' },
  recentChaptersShare: {
    vi: 'Câu hỏi 6 chương gần nhất',
    en: 'Last exam: share by chapter',
  },
  chapterShareSuffix: {
    vi: 'câu · tỷ lệ % theo chương (cao → thấp)',
    en: 'questions · chapter share % (high → low)',
  },
  masteryByChapter: { vi: 'Mức độ thông thạo theo chương', en: 'Mastery by chapter' },
  aiAssistant: { vi: 'Trợ lý Giao thông AI', en: 'AI Traffic Assistant' },
  aiDescription: { vi: 'Tải lên tình huống giao thông để AI phân tích ngay lập tức', en: 'Upload a traffic situation for instant AI analysis' },
  changeImage: { vi: 'Thay đổi ảnh', en: 'Change Image' },
  uploadImage: { vi: 'Tải ảnh lên', en: 'Upload Image' },
  analyzeSituation: { vi: 'Phân tích tình huống', en: 'Analyze Situation' },
  analysisResult: { vi: 'Kết quả phân tích', en: 'Analysis Result' },
  aiError: { vi: 'Lỗi phân tích AI. Vui lòng thử lại.', en: 'AI analysis error. Please try again.' },
  analyzing: { vi: 'Đang phân tích...', en: 'Analyzing...' },
  ruleIdentification: { vi: 'Xác định quy tắc', en: 'Rule Identification' },
  hazardDetection: { vi: 'Phát hiện mối nguy hiểm', en: 'Hazard Detection' },
  actionGuidance: { vi: 'Hướng dẫn hành động', en: 'Action Guidance' },
  progress: { vi: 'Tiến độ', en: 'Progress' },
  question: { vi: 'Câu hỏi', en: 'Question' },
  expandQuestionNav: { vi: 'Xem tất cả câu', en: 'Show all questions' },
  collapseQuestionNav: { vi: 'Thu gọn danh sách câu', en: 'Collapse question list' },
  stats: { vi: 'Thống kê', en: 'Stats' },
  languageSection: { vi: 'Ngôn ngữ', en: 'Language' },
  appearanceSection: { vi: 'Giao diện', en: 'Appearance' },
  langVi: { vi: 'Tiếng Việt', en: 'Vietnamese' },
  langEn: { vi: 'Tiếng Anh', en: 'English' },
  themeLight: { vi: 'Sáng', en: 'Light' },
  themeDark: { vi: 'Tối', en: 'Dark' },
  theory600Title: { vi: 'LÝ THUYẾT 600 CÂU', en: '600 THEORY QUESTIONS' },
  version2026: { vi: 'PHIÊN BẢN 2026', en: '2026 EDITION' },
  guide: { vi: 'Hướng dẫn', en: 'Guide' },
  support: { vi: 'Hỗ trợ', en: 'Support' },
  settings: { vi: 'Settings', en: 'Settings' },
  theme: { vi: 'THEME', en: 'THEME' },
  themeSystem: { vi: 'System', en: 'System' },
  language: { vi: 'LANGUAGE', en: 'LANGUAGE' },
  showAllAnswers: { vi: 'Show all answers', en: 'Show all answers' },
  order: { vi: 'ORDER', en: 'ORDER' },
  sequential: { vi: 'Sequential', en: 'Sequential' },
  shuffle: { vi: 'Shuffle', en: 'Shuffle' },
  fontSize: { vi: 'FONT SIZE', en: 'FONT SIZE' },
  reset: { vi: 'RESET', en: 'RESET' },
  resetSettings: { vi: 'Reset settings', en: 'Reset settings' },
  resetProgress: { vi: 'Reset progress', en: 'Reset progress' },
  startExam: { vi: 'Bắt đầu thi', en: 'Start Exam' },
  yourScore: { vi: 'Điểm của bạn', en: 'Your Score' },
  correctAnswers: { vi: 'Câu đúng', en: 'Correct' },
  wrongAnswers: { vi: 'Câu sai', en: 'Wrong' },
  tryAgain: { vi: 'Thử lại', en: 'Try Again' },
  chapter: { vi: 'Chương', en: 'Chapter' },
  questions: { vi: 'Câu hỏi', en: 'Questions' },
  examSetup: { vi: 'Thi thử GPLX', en: 'Practice Exam' },
  examDescription: { vi: 'Bài thi 30 câu hỏi, lấy ngẫu nhiên từ 600 câu hỏi', en: '30 questions randomly selected from 600 questions' },
  loading: { vi: 'Đang tải...', en: 'Loading...' },
  error: { vi: 'Đã xảy ra lỗi', en: 'An error occurred' },
  back: { vi: 'Quay lại', en: 'Back' },
  submit: { vi: 'Nộp', en: 'Submit' },
  skip: { vi: 'Bỏ qua', en: 'Skip' },
  passScore: { vi: 'Đạt yêu cầu (>= 26/30)', en: 'Pass score (>= 26/30)' },
  failScore: { vi: 'Chưa đạt (< 26/30)', en: 'Not passed (< 26/30)' },
};

const LS_KEY = 'language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
    return 'vi';
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
