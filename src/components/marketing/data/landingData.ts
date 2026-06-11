// Centralized data for the DriveSmart landing page

// ============================================================
// TRUST METRICS
// ============================================================
export const TRUST_METRICS = [
  { value: '50.000+', label: 'Học viên', labelEn: 'Active Learners' },
  { value: '600', label: 'Câu hỏi GPLX', labelEn: 'GPLX Questions' },
  { value: '95%', label: 'Tỷ lệ đậu', labelEn: 'Pass Rate' },
  { value: '5.000+', label: 'Từ vựng', labelEn: 'Vocab Words' },
  { value: '1.200+', label: 'Bài luyện nghe', labelEn: 'Listening Exercises' },
  { value: '500+', label: 'Cụm từ OPAL', labelEn: 'OPAL Phrases' },
] as const;

// ============================================================
// SOCIAL PROOF LOGOS (placeholder company/university names)
// ============================================================
export const SOCIAL_LOGOS = [
  { name: 'Đại học Bách Khoa TPHCM', abbr: 'HCMUT' },
  { name: 'Đại học FPT', abbr: 'FPTU' },
  { name: 'Đại học RMIT Việt Nam', abbr: 'RMIT' },
  { name: 'Trung tâm GDNN & Dạy nghề', abbr: 'TVET' },
  { name: 'Sở GTVT TPHCM', abbr: 'SGTVT' },
  { name: 'Tổng cục Đường bộ Việt Nam', abbr: 'VNRA' },
] as const;

// ============================================================
// DRIVING TEST FEATURES
// ============================================================
export const DRIVING_TEST_FEATURES = [
  {
    icon: '📋',
    titleVi: '600 câu hỏi chính thức',
    titleEn: '600 Official Questions',
    descVi: 'Bám sát đề thi thực tế từ Tổng cục Đường bộ Việt Nam. Cập nhật theo phiên bản mới nhất 2024.',
    descEn: 'Aligned with the official exam from Vietnam Road Administration. Updated to the latest 2024 version.',
  },
  {
    icon: '🤖',
    titleVi: 'AI phân tích tình huống',
    titleEn: 'AI Traffic Analyzer',
    descVi: 'Gemini AI nhận diện biển báo, làn đường, và tình huống giao thông từ ảnh chụp thực tế.',
    descEn: 'Gemini AI recognizes traffic signs, lanes, and road situations from real photos.',
  },
  {
    icon: '📊',
    titleVi: 'Theo dõi tiến độ theo chương',
    titleEn: 'Chapter Progress Tracking',
    descVi: 'Phân tích chi tiết từng chương, biết ngay mình đang yếu chỗ nào để ôn tập đúng trọng tâm.',
    descEn: 'Detailed chapter analysis shows exactly where you need to focus your study.',
  },
  {
    icon: '🎯',
    titleVi: 'Thi thử theo chuẩn B1',
    titleEn: 'Realistic B1 Mock Exam',
    descVi: '30 câu hỏi thi thử với phân bổ chương chuẩn. Kết quả chi tiết ngay sau khi nộp bài.',
    descEn: '30 questions with standard chapter distribution. Detailed results immediately after submission.',
  },
] as const;

// ============================================================
// VOCABULARY FEATURES
// ============================================================
export const VOCABULARY_FEATURES = [
  {
    icon: '🔊',
    titleVi: 'Phát âm chuẩn Oxford',
    titleEn: 'Native Oxford Pronunciation',
    descVi: 'Âm thanh chuẩn từ Oxford Dictionary. Nghe và phát âm đúng ngay từ lần đầu.',
    descEn: 'Crystal-clear pronunciations from Oxford. Learn the correct sound from day one.',
  },
  {
    icon: '🧠',
    titleVi: 'Spaced Repetition thông minh',
    titleEn: 'Smart Spaced Repetition',
    descVi: 'Thuật toán spaced repetition nhắc bạn ôn lại đúng lúc. Nhớ từ lâu hơn 3 lần so với học truyền thống.',
    descEn: 'Spaced repetition algorithm reminds you at the optimal moment. Remember words 3x longer.',
  },
  {
    icon: '📚',
    titleVi: '4 cấp độ từ cơ bản đến chuyên sâu',
    titleEn: '4 Levels: Beginner to Expert',
    descVi: 'Beginner, Intermediate, Advanced, Expert. Mỗi cấp độ có hàng trăm từ vựng và bài tập riêng.',
    descEn: 'Beginner, Intermediate, Advanced, Expert. Each level has hundreds of words and exercises.',
  },
  {
    icon: '🔁',
    titleVi: '5.000+ từ vựng theo chủ đề',
    titleEn: '5,000+ Topic-Based Words',
    descVi: 'Học theo chủ đề: Du lịch, Kinh doanh, Y tế, Công nghệ. Phù hợp với mọi mục tiêu học tập.',
    descEn: 'Learn by topic: Travel, Business, Health, Technology. Fit for any learning goal.',
  },
] as const;

// ============================================================
// OPAL FEATURES
// ============================================================
export const OPAL_CATEGORIES = [
  {
    titleVi: 'Viết',
    titleEn: 'Writing',
    color: '#3B82F6',
    phrases: [
      { phrase: '"The findings suggest that..."', vi: 'Kết quả cho thấy rằng...' },
      { phrase: '"In contrast, previous studies..."', vi: 'Trái ngược với, các nghiên cứu trước...' },
      { phrase: '"This approach enables researchers..."', vi: 'Phương pháp này cho phép các nhà nghiên cứu...' },
    ],
  },
  {
    titleVi: 'Nói',
    titleEn: 'Speaking',
    color: '#F59E0B',
    phrases: [
      { phrase: '"I would argue that..."', vi: 'Tôi cho rằng...' },
      { phrase: '"On the one hand... on the other hand..."', vi: 'Một mặt... mặt khác...' },
      { phrase: '"To put it another way..."', vi: 'Nói cách khác...' },
    ],
  },
  {
    titleVi: 'Đọc',
    titleEn: 'Reading',
    color: '#10B981',
    phrases: [
      { phrase: '"The text argues that..."', vi: 'Văn bản cho rằng...' },
      { phrase: '"As illustrated in the passage..."', vi: 'Như được minh họa trong đoạn văn...' },
      { phrase: '"The author claims that..."', vi: 'Tác giả khẳng định rằng...' },
    ],
  },
] as const;

// ============================================================
// LISTENING FEATURES
// ============================================================
export const LISTENING_FEATURES = [
  {
    icon: '🎛️',
    titleVi: 'Điều khiển tốc độ linh hoạt',
    titleEn: 'Flexible Speed Control',
    descVi: 'Từ 0.5x đến 1.5x. Nghe chậm để hiểu kỹ, tăng dần tốc độ khi đã quen thuộc.',
    descEn: 'From 0.5x to 1.5x. Slow down for comprehension, speed up as you improve.',
  },
  {
    icon: '📝',
    titleVi: 'Chép chính tả & so sánh tự động',
    titleEn: 'Dictation with Auto-Compare',
    descVi: 'Nhập transcript bạn nghe được, hệ thống tự động so sánh và highlight từng từ đúng/sai.',
    descEn: 'Type what you hear, the system auto-compares and highlights each correct/incorrect word.',
  },
  {
    icon: '💡',
    titleVi: 'Feedback AI cá nhân hóa',
    titleEn: 'Personalized AI Feedback',
    descVi: 'AI phân tích lỗi thường gặp: mạo từ, thì quá khứ, linking sounds. Gợi ý cách cải thiện cụ thể.',
    descEn: 'AI analyzes common errors: articles, past tense, linking sounds. Suggests specific improvements.',
  },
  {
    icon: '📈',
    titleVi: 'Theo dõi tiến độ & bookmark',
    titleEn: 'Progress Tracking & Bookmarks',
    descVi: 'Lưu lại bài đã học, xem lịch sử luyện tập, theo dõi cải thiện điểm listening theo thời gian.',
    descEn: 'Save completed lessons, review history, track listening score improvement over time.',
  },
] as const;

// ============================================================
// TESTIMONIALS
// ============================================================
export const TESTIMONIALS = [
  {
    name: 'Nguyễn Minh Hoàng',
    role: 'Nhân viên văn phòng',
    avatar: '👨‍💼',
    rating: 5,
    textVi: 'Mình thi GPLX B1 lần đầu và đậu ngay với 95 điểm. Giao diện rất dễ dùng, câu hỏi sát thực tế. AI phân tích tình huống giao thông rất hữu ích.',
    textEn: 'Passed B1 GPLX on first try with 95 points. Easy interface, realistic questions. AI traffic analysis is very helpful.',
    product: 'Thi GPLX',
    accentColor: 'var(--accent)',
  },
  {
    name: 'Trần Thị Lan',
    role: 'Giảng viên đại học',
    avatar: '👩‍🏫',
    rating: 5,
    textVi: 'Tôi dùng flashcard từ vựng mỗi sáng. Đã học được hơn 2.000 từ mới. Spaced repetition giúp nhớ lâu hơn rất nhiều so với cách học truyền thống.',
    textEn: 'Using vocabulary flashcards every morning. Learned 2,000+ new words. Spaced repetition makes remembering so much easier.',
    product: 'Từ vựng',
    accentColor: 'var(--success)',
  },
  {
    name: 'Lê Văn Đức',
    role: 'Kỹ sư phần mềm',
    avatar: '👨‍💻',
    rating: 5,
    textVi: 'Phần luyện nghe chép chính tả rất tốt. Tôi cải thiện được kỹ năng nghe từ IELTS 5.0 lên 7.0 sau 3 tháng. Bài tập đa dạng từ dễ đến khó.',
    textEn: 'Dictation exercises are excellent. Improved listening from IELTS 5.0 to 7.0 in 3 months. Exercises vary from easy to hard.',
    product: 'Luyện nghe',
    accentColor: '#7C3AED',
  },
  {
    name: 'Phạm Thu Hà',
    role: 'Du học sinh',
    avatar: '👩‍🎓',
    rating: 5,
    textVi: 'OPAL phrases giúp tôi tự tin hơn khi viết essay và thuyết trình ở trường. Các cụm từ học thuật rất chuẩn và dễ áp dụng.',
    textEn: 'OPAL phrases helped me feel more confident writing essays and presenting. Academic phrases are very standard and easy to apply.',
    product: 'OPAL',
    accentColor: '#3B82F6',
  },
] as const;

// ============================================================
// FAQ
// ============================================================
export const FAQ_ITEMS = [
  {
    questionVi: 'DriveSmart có miễn phí không?',
    questionEn: 'Is DriveSmart free?',
    answerVi: 'Có, DriveSmart hoàn toàn miễn phí. Bạn có thể học tất cả 600 câu hỏi GPLX, 5.000+ từ vựng, 500+ cụm từ OPAL và 1.200+ bài luyện nghe mà không cần trả bất kỳ phí nào.',
    answerEn: 'Yes, DriveSmart is completely free. You can practice all 600 GPLX questions, 5,000+ vocabulary words, 500+ OPAL phrases, and 1,200+ listening exercises without paying anything.',
  },
  {
    questionVi: 'Nội dung có cập nhật theo đề thi mới nhất không?',
    questionEn: 'Is the content updated with the latest exam format?',
    answerVi: 'Có. Chúng tôi cập nhật câu hỏi GPLX theo phiên bản mới nhất từ Tổng cục Đường bộ Việt Nam. Các thay đổi về biển báo, làn đường và quy tắc giao thông luôn được phản ánh nhanh chóng.',
    answerEn: 'Yes. We update GPLX questions according to the latest version from Vietnam Road Administration. Changes in traffic signs, lanes, and rules are always reflected quickly.',
  },
  {
    questionVi: 'AI phân tích tình huống giao thông hoạt động như thế nào?',
    questionEn: 'How does the AI traffic analyzer work?',
    answerVi: 'Bạn chụp hoặc tải lên ảnh tình huống giao thông thực tế. Gemini AI sẽ nhận diện biển báo, phân tích làn đường, đối tượng tham gia giao thông và đưa ra giải thích chi tiết bằng tiếng Việt và tiếng Anh.',
    answerEn: 'Upload or take a photo of a real traffic situation. Gemini AI recognizes signs, analyzes lanes, traffic participants, and gives detailed explanations in both Vietnamese and English.',
  },
  {
    questionVi: 'Tôi cần bao lâu để vượt qua kỳ thi GPLX?',
    questionEn: 'How long does it take to pass the GPLX exam?',
    answerVi: 'Hầu hết học viên đạt kết quả tốt sau 1-2 tuần luyện tập 30 phút mỗi ngày. Với DriveSmart, bạn tập trung vào đúng những phần yếu thay vì học thuộc toàn bộ 600 câu.',
    answerEn: 'Most learners achieve good results after 1-2 weeks of 30-minute daily practice. With DriveSmart, you focus on weak areas instead of memorizing all 600 questions.',
  },
  {
    questionVi: 'DriveSmart có hỗ trợ học IELTS không?',
    questionEn: 'Does DriveSmart support IELTS learning?',
    answerVi: 'Có, phần luyện nghe với 1.200+ bài từ DailyDictation và từ vựng Oxford là nền tảng tốt cho IELTS. Tuy nhiên, DriveSmart chưa có bài thi IELTS chuyên dụng.',
    answerEn: 'Yes, the listening practice with 1,200+ exercises from DailyDictation and Oxford vocabulary are great IELTS preparation. However, DriveSmart does not yet have dedicated IELTS exams.',
  },
  {
    questionVi: 'Tôi có thể học trên điện thoại không?',
    questionEn: 'Can I study on my phone?',
    answerVi: 'Có. DriveSmart được thiết kế mobile-first, hoạt động mượt mà trên mọi thiết bị iOS và Android. Giao diện tối ưu cho màn hình nhỏ, thao tác dễ dàng bằng một tay.',
    answerEn: 'Yes. DriveSmart is built mobile-first, works smoothly on all iOS and Android devices. Interface is optimized for small screens with one-handed operation.',
  },
] as const;
