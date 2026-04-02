import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  aiAnalyzerTitle: { vi: 'TRỢ LÝ GIAO THÔNG AI', en: 'AI TRAFFIC ASSISTANT' },
  aiAnalyzerDesc: { vi: 'Tải lên bất kỳ ảnh tình huống giao thông, biển báo hoặc ngã tư nào để nhận phân tích chi tiết về các quy tắc, mối nguy hiểm và hành động đúng.', en: 'Upload any traffic situation, sign, or intersection photo to get a detailed analysis of rules, hazards, and correct actions.' },
  ruleDesc: { vi: 'Gemini xác định các luật và quy định giao thông cụ thể áp dụng cho cảnh được tải lên.', en: 'Gemini identifies specific traffic laws and regulations applicable to the uploaded scene.' },
  hazardDesc: { vi: 'AI làm nổi bật các mối nguy hiểm tiềm ẩn có thể không rõ ràng ngay lập tức đối với người mới lái xe.', en: 'AI highlights potential dangers that might not be immediately obvious to a student driver.' },
  actionDesc: { vi: 'Nhận hướng dẫn từng bước về cách an toàn nhất và hợp pháp nhất để tiến hành trong tình huống đó.', en: 'Get step-by-step instructions on the safest and most legal way to proceed in the situation.' },
  theory600Title: { vi: 'LÝ THUYẾT 600 CÂU', en: '600 THEORY QUESTIONS' },
  version2026: { vi: 'PHIÊN BẢN 2026', en: '2026 EDITION' },
  chooseExamPaper: { vi: 'Chọn Đề thi:', en: 'Exam paper:' },
  gplxRank: { vi: 'Hạng GPLX:', en: 'License class:' },
  status: { vi: 'Trạng thái:', en: 'Status:' },
  setupStatusPending: { vi: 'Chờ kiểm tra', en: 'Pending check' },
  setupStatusVerified: { vi: 'Đã kiểm tra', en: 'Verified' },
  candidateName: { vi: 'Họ tên thí sinh', en: 'Candidate name' },
  verifyCandidate: { vi: 'KIỂM TRA THÔNG TIN THÍ SINH', en: 'VERIFY CANDIDATE INFO' },
  startExamNow: { vi: 'BẮT ĐẦU THI NGAY!', en: 'START EXAM NOW!' },
  setupDisclaimer: {
    vi: '* Lưu ý: Bạn phải nhấn vào \'Kiểm tra thông tin thí sinh\' mới có thể ấn nút \'Bắt đầu thi ngay\'.',
    en: '* You must tap \'Verify candidate info\' before \'Start exam now\' is enabled.',
  },
  guide: { vi: 'Hướng dẫn', en: 'Guide' },
  support: { vi: 'Hỗ trợ', en: 'Support' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

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
