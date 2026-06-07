# VinaListen — Feature Specification Document
## Listening Practice · Speaking Practice · Progress Tracking · Streak System · History

**Date:** 2026-06-07  
**Version:** 1.0  
**Based on:** PRD VinaListen v1.0 + UX Specification + Implementation Plan

---

## MỤC LỤC

```
1. Listening Practice
2. Speaking Practice
3. Progress Tracking
4. Streak System
5. History
```

---

## FEATURE 1: LISTENING PRACTICE

### 1.1 Business Goal

```
PRIMARY GOAL:
Tạo trải nghiệm luyện nghe-chép chính tả hiệu quả nhất có thể,
giúp user cải thiện kỹ năng nghe tiếng Anh thông qua active recall.

SECONDARY GOALS:
├── Tăng engagement time (thời gian học mỗi session)
├── Xây dựng data về listening patterns của user
├── Tạo nền tảng cho speaking practice (transcript làm baseline)
└── Thu thập transcript accuracy data để cá nhân hóa AI feedback

BUSINESS CONTEXT:
├── Listening = entry point của toàn bộ product loop
├── Người dùng phải HOÀN THÀNH listening trước khi speaking
├── Accuracy từ listening = benchmark cho speaking score
└── Tỷ lệ completion của listening module = indicator cho retention

SUCCESS METRICS:
├── Completion rate: > 80% user hoàn thành ít nhất 1 clip
├── Accuracy distribution: 60-85% trung bình (not too easy, not too hard)
├── Session duration: 3-8 phút mỗi lesson
├── Repeat rate: User thử lại clip đã fail > 1 lần
└── Correlation: Accuracy > 80% → Higher speaking score
```

### 1.2 Functional Requirements

```
FR-1.1: Topic Browsing
├── [x] Display all available topics with metadata
├── [x] Show topic name, icon, lesson count, user progress %
├── [x] Filter topics by category (IELTS, TOEIC, Daily, Business)
├── [x] Search topics by name (realtime)
├── [x] Sort topics by: Popular, Recent, Alphabetical
└── [x] Show locked/unlocked status per topic

FR-1.2: Lesson Selection
├── [x] Display all lessons within a topic
├── [x] Show lesson name, duration, completion status, accuracy
├── [x] Group lessons by section (Part 1, Part 2...)
├── [x] Show overall topic progress (X/Y lessons completed)
├── [x] Indicate current/next recommended lesson
├── [x] Allow access to any lesson (not gated by sequence)
└── [x] Continue from last position if lesson in-progress

FR-1.3: Audio Playback
├── [x] Play/pause audio for current clip
├── [x] Display current time and total duration
├── [x] Seek forward/backward by 5 seconds
├── [x] Adjust playback speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x
├── [x] Loop current clip (repeat)
├── [x] Loop entire lesson (repeat all clips)
├── [x] Keep screen awake during playback
├── [x] Handle multiple audio formats (MP3, M4A, WAV)
└── [x] Fallback audio source if primary fails

FR-1.4: Transcript Input
├── [x] Display editable textarea for user to type transcript
├── [x] Show word count in real-time
├── [x] Disable paste to prevent cheating
├── [x] Disable spell-check on input
├── [x] Clear button to reset input
├── [x] Auto-focus textarea on page load
├── [x] Auto-capitalize first letter of sentences
└── [x] Keyboard shortcut: Ctrl/Cmd+Enter = Submit

FR-1.5: Transcript Comparison & Scoring
├── [x] Compare user input with ground truth transcript
├── [x] Normalize text (lowercase, trim whitespace, remove punctuation)
├── [x] Word-by-word matching algorithm
├── [x] Mark each word: correct / wrong / missing / extra
├── [x] Calculate accuracy percentage: (correct_words / total_expected_words) * 100
├── [x] Handle case-insensitive comparison
├── [x] Handle contractions: "don't" vs "dont" vs "do not"
├── [x] Handle hyphenated words
└── [x] Handle apostrophes in possessives

FR-1.6: Result Display
├── [x] Show accuracy score (0-100%)
├── [x] Display expected transcript with word-level highlighting
├── [x] Display user input with word-level highlighting
├── [x] Color coding: green (correct), red (wrong), underline (missing), orange (extra)
├── [x] Show summary: correct count, wrong count, missing count, extra count
├── [x] Provide basic AI feedback (rule-based pattern detection)
└── [x] Offer actions: Retry, Listen Again, Continue

FR-1.7: Clip Navigation
├── [x] Display current clip index (e.g., "Clip 1 of 3")
├── [x] Navigate to next clip after completion
├── [x] Navigate to previous clip
├── [x] Navigate to specific clip via progress indicator
├── [x] Show lesson complete screen after final clip
└── [x] Allow exit mid-lesson (auto-save progress)
```

### 1.3 User Actions

```
UA-1.1: Topic Browsing
├── User opens /topics page
│   └── System fetches topics from Supabase
├── User taps topic card
│   └── System navigates to /topics/[slug]
├── User types in search bar
│   └── System filters topics in real-time (debounce 300ms)
├── User taps filter chip
│   └── System applies filter, updates grid
├── User taps sort button
│   └── System re-sorts and re-renders list
└── User is not logged in
    └── System shows topics without progress %

UA-1.2: Lesson Selection
├── User opens topic page
│   └── System fetches lessons + user's progress
├── User taps lesson row
│   └── System navigates to /listen/[lesson-id]
├── User taps "Continue" (if in-progress lesson exists)
│   └── System resumes from last clip position
├── User scrolls through sections
│   └── System lazy-loads sections as needed
└── User taps "Back to Topics"
    └── System navigates to /topics

UA-1.3: Audio Playback
├── User taps Play button
│   └── System plays audio from current position
│   └── System starts timer
│   └── System updates progress bar in real-time
├── User taps Pause button
│   └── System pauses audio
│   └── System saves current position
├── User taps Skip Back (◀◀)
│   └── System seeks to current_position - 5s
├── User taps Skip Forward (▶▶)
│   └── System seeks to current_position + 5s
├── User taps progress bar
│   └── System seeks to tapped position
├── User selects playback speed
│   └── System changes playbackRate
│   └── System visualizes current speed selection
├── User taps Loop Clip
│   └── System enables clip loop mode
│   └── System auto-restarts clip on end
├── User taps Loop All
│   └── System enables lesson loop mode
│   └── System auto-restarts lesson on end
├── User taps speaker icon (mute)
│   └── System toggles mute state
└── User closes tab mid-playback
    └── System auto-saves last position

UA-1.4: Transcript Input
├── User types in textarea
│   └── System updates word count in real-time
├── User presses Space
│   └── System plays/pauses audio (if focus not in textarea)
├── User presses Ctrl+Enter
│   └── System submits transcript for checking
├── User taps Clear button
│   └── System clears textarea
│   └── System refocuses textarea
├── User tries to paste
│   └── System blocks paste
│   └── System shows tooltip: "Hãy gõ từ bạn nghe được"
└── User leaves page without submitting
    └── System discards input (no auto-save for transcript)
```

### 1.4 System Actions

```
SA-1.1: On Page Load (Lesson Player)
├── System checks authentication status
│   ├── If logged in: Fetch user's progress for this lesson
│   └── If not logged in: Proceed without progress data
├── System fetches lesson metadata (clips, transcripts)
├── System loads audio files (preload first clip)
├── System focuses transcript textarea
└── System initializes audio player with first clip

SA-1.2: On Transcript Submit
├── System validates input is not empty
│   └── If empty: Show error "Vui lòng nhập transcript"
├── System sends POST /api/listening/check
│   ├── Payload: { lesson_id, clip_id, transcript_input, user_id? }
│   └── Server processes comparison
├── Server normalizes both transcripts
├── Server performs word-by-word comparison
├── Server calculates scores
├── Server generates AI feedback (rule-based)
├── Server returns result to client
├── System displays result panel with animation
└── System unlocks "Tiếp tục" button

SA-1.3: On Clip Complete
├── System saves clip result to Supabase
│   ├── user_id, lesson_id, clip_id
│   ├── transcript_input, accuracy, score
│   ├── completed_at timestamp
│   └── Create or update record (upsert)
├── System increments clip counter
├── System checks if lesson is complete
│   ├── If not complete: Enable next clip navigation
│   └── If complete: Trigger lesson complete modal
└── System updates topic progress %

SA-1.4: On Lesson Complete
├── System calculates lesson-level stats
│   ├── Average accuracy across all clips
│   ├── Total time spent
│   ├── XP earned: accuracy * 10 (rounded)
├── System triggers confetti animation
├── System shows lesson complete modal
├── System awards XP to user (if logged in)
├── System updates daily_activity table
├── System updates streak (if applicable)
└── System redirects to next lesson or dashboard

SA-1.5: On Error
├── Audio fails to load
│   └── System shows retry button with error message
├── API request fails
│   └── System retries once, then shows error
├── Network offline
│   └── System saves state locally
│   └── System queues submission for later
└── Server error (500)
    └── System shows "Đã xảy ra lỗi. Vui lòng thử lại."
```

### 1.5 Validation Rules

```
VR-1.1: Topic Selection
├── Topic must exist in database
├── Topic must be active (not archived)
├── User must have valid session (if logged in)
└── Topic must have at least 1 lesson

VR-1.2: Lesson Access
├── Lesson must belong to the selected topic
├── Lesson must have audio file URL
├── Lesson must have at least 1 clip with transcript
└── Lesson must not be deleted

VR-1.3: Transcript Submission
├── Input must not be empty (min 1 character)
├── Input must not exceed 2000 characters
├── Input must be text only (no HTML/特殊字符)
├── User must be authenticated for scoring persistence
└── Lesson must be accessible by user

VR-1.4: Audio Playback
├── Audio URL must be valid and accessible
├── Audio duration must be > 0
├── Playback speed must be within 0.5x - 1.5x range
└── Audio format must be supported by browser
```

### 1.6 Scoring Logic

```
SL-1.1: Word Comparison Algorithm

Input:
  expected = "I was walking to school when it started raining."
  user_input = "I was walking to school when it start raining."

Step 1: Normalize
  expected_normalized = "i was walking to school when it started raining"
  user_normalized = "i was walking to school when it start raining"

Step 2: Tokenize
  expected_words = ["i", "was", "walking", "to", "school", "when", "it", "started", "raining"]
  user_words = ["i", "was", "walking", "to", "school", "when", "it", "start", "raining"]

Step 3: Align (Longest Common Subsequence)
  aligned_pairs = [
    ("i", "i"), ✅
    ("was", "was"), ✅
    ("walking", "walking"), ✅
    ("to", "to"), ✅
    ("school", "school"), ✅
    ("when", "when"), ✅
    ("it", "it"), ✅
    ("started", "start"), ❌ (wrong)
    ("raining", "raining"), ✅
  ]

Step 4: Score
  total_expected = 9
  correct = 8
  wrong = 1
  missing = 0
  extra = 0
  accuracy = (8 / 9) * 100 = 88.89%

Step 5: Edge Cases
  - Missing word: expected has word at position, user doesn't
  - Extra word: user has word, expected doesn't
  - Case difference: "I" vs "i" = correct
  - Punctuation: Strip before comparison
  - Contractions: Handle variations

SL-1.2: Score Display
  ├── Score >= 90%: "TUYỆT VỜI!" + Green + Celebration
  ├── Score >= 75%: "Khá tốt!" + Yellow
  ├── Score >= 60%: "Cần cải thiện" + Orange
  └── Score < 60%: "Thử lại nhé" + Red

SL-1.3: XP Calculation
  XP_per_lesson = round(average_accuracy * 10)
  Bonus: +10 XP if accuracy = 100%
  Bonus: +5 XP if completed in < 5 minutes
  Bonus: +3 XP if first attempt (no retry)
  Max XP per lesson: 100
```

### 1.7 Error Handling

```
EH-1.1: Audio Loading Error
├── Detection: Audio element onerror event
├── User Message: "Audio không tải được. Kiểm tra kết nối mạng."
├── Action: Show retry button
├── Fallback: Try alternative audio URL
├── Retry: User taps retry → reload audio
└── Log: Sentry event for monitoring

EH-1.2: Submission Timeout
├── Detection: Request timeout after 10 seconds
├── User Message: "Yêu cầu hết thời gian. Vui lòng thử lại."
├── Action: Auto-retry once
├── After retry fail: Show manual retry button
└── Log: Sentry event

EH-1.3: Empty Input Submission
├── Detection: Client-side validation
├── User Message: "Vui lòng nhập transcript trước khi kiểm tra."
├── Action: Focus textarea, highlight border
└── Prevention: Submit button disabled until input exists

EH-1.4: Server Error (500)
├── Detection: HTTP 500 response
├── User Message: "Đã xảy ra lỗi phía máy chủ. Chúng tôi đang khắc phục."
├── Action: Show retry button after 5 seconds
└── Log: Sentry with full request context

EH-1.5: Network Offline
├── Detection: navigator.onLine = false
├── User Message: "Bạn đang offline. Kết nối mạng để tiếp tục."
├── Action: Show offline banner, disable submission
├── Recovery: Auto-retry when online detected
└── State: Save user input locally for recovery

EH-1.6: Paste Attempt
├── Detection: onpaste event.preventDefault()
├── User Message: Tooltip "Hãy gõ từ bạn nghe được"
├── Duration: Tooltip auto-dismisses after 3 seconds
└── Action: Block paste, no error

EH-1.7: Browser Compatibility
├── Detection: Feature detection on mount
├── Missing MediaRecorder: Show "Trình duyệt không hỗ trợ"
├── Missing Web Audio: Show "Vui lòng dùng Chrome, Safari, hoặc Edge"
└── Fallback: Graceful degradation message
```

### 1.8 Edge Cases

```
EC-1.1: Very Long Transcript
├── User types 2000+ characters
├── System: Truncate at 2000, show warning
└── UX: "Transcript quá dài. Chỉ so sánh 2000 ký tự đầu."

EC-1.2: Numbers in Transcript
├── Expected: "I was born in 1995."
├── User types: "I was born in nineteen ninety five."
├── System: Mark "1995" as wrong, "nineteen ninety five" as extra
└── UX: "Lưu ý: Số có thể viết dưới dạng chữ hoặc số."

EC-1.3: Homophones
├── Expected: "I can see the bear."
├── User types: "I can see the bare."
├── System: Mark "bear" as wrong (same pronunciation, different spelling)
└── UX: "Chú ý: 'bear' và 'bare' phát âm giống nhau nhưng khác nghĩa."

EC-1.4: Very Fast Typing
├── User submits transcript in < 5 seconds
├── System: Accept normally
└── UX: No special handling (user might be very skilled)

EC-1.5: User Reloads Mid-Lesson
├── User presses refresh during lesson
├── System: No progress saved until clip is completed
├── On return: User starts lesson from beginning
└── UX: Brief "Lưu ý: Tiến độ sẽ được lưu khi hoàn thành clip."

EC-1.6: Audio Plays During Submit
├── User submits while audio is playing
├── System: Pause audio automatically
├── System: Submit transcript
└── UX: Seamless, no jarring experience

EC-1.7: Multiple Rapid Submissions
├── User double-taps submit button
├── System: Disable button after first tap
├── System: Process only first submission
└── UX: Single result shown, button re-enabled after result

EC-1.8: Clip With No Transcript Available
├── Edge case: New lesson added without transcript
├── System: Skip clip, move to next
└── UX: "Clip này đang được cập nhật."

EC-1.9: Zero Accuracy (All Wrong)
├── User submits completely wrong transcript
├── System: Calculate 0% accuracy
├── System: Show all words as wrong
├── System: Provide encouraging message
└── UX: "Đừng nản! Nghe lại và thử từng câu một."

EC-1.10: Perfect Score (100%)
├── User submits exact match
├── System: Calculate 100% accuracy
├── System: Trigger extra celebration
├── System: Award maximum XP bonus
└── UX: "TUYỆT VỜI! Perfect score! +10 bonus XP"
```

### 1.9 Acceptance Criteria

```
AC-1.1: Topic Browsing
□ [ ] User can view all available topics on /topics page
□ [ ] Each topic shows: name, icon, lesson count, progress (if logged in)
□ [ ] Search filters topics in < 500ms after typing
□ [ ] Filter chips correctly filter topics
□ [ ] Page loads in < 2 seconds with skeleton state
□ [ ] Mobile: Full-width cards, vertical scroll
□ [ ] Tablet: 2-column grid
□ [ ] Desktop: 3-4 column grid, max-width 1200px

AC-1.2: Audio Playback
□ [ ] Audio plays within 1 second of tap
□ [ ] Progress bar updates smoothly during playback
□ [ ] Seek forward/backward works correctly
□ [ ] All 5 speed options function correctly
□ [ ] Loop modes work correctly
□ [ ] Audio pauses when tab is backgrounded
□ [ ] Audio resumes when tab is foregrounded
□ [ ] Mobile: Touch targets minimum 44x44px
□ [ ] Desktop: Keyboard shortcuts work (Space, arrows)

AC-1.3: Transcript Input
□ [ ] Textarea accepts input immediately on focus
□ [ ] Word count updates in real-time
□ [ ] Paste is blocked with tooltip feedback
□ [ ] Ctrl+Enter submits form
□ [ ] Clear button resets input and refocuses
□ [ ] Mobile keyboard opens automatically
□ [ ] Keyboard does not cover input area

AC-1.4: Result Display
□ [ ] Results appear within 2 seconds of submit
□ [ ] Accuracy score animates from 0 to actual value
□ [ ] Word highlighting is color-accurate
□ [ ] All 4 word states shown: correct/wrong/missing/extra
□ [ ] AI feedback appears below result
□ [ ] Retry button clears input and refocuses
□ [ ] Continue button navigates to next clip

AC-1.5: Scoring Accuracy
□ [ ] 100% match returns 100% accuracy
□ [ ] Case differences are ignored
□ [ ] Punctuation differences are ignored
□ [ ] All words in expected are counted
□ [ ] Missing words decrease accuracy correctly
□ [ ] Extra words decrease accuracy correctly
□ [ ] Wrong words decrease accuracy correctly

AC-1.6: Progress Persistence
□ [ ] Logged-in user: Progress saved to Supabase
□ [ ] Unauthenticated user: No data saved (graceful)
□ [ ] Lesson completion updates topic progress
□ [ ] XP is awarded correctly
□ [ ] Daily activity is recorded

AC-1.7: Error Handling
□ [ ] Audio error: Retry button visible
□ [ ] Network error: Offline banner shown
□ [ ] Server error: Friendly message + retry
□ [ ] Empty input: Submit button disabled
□ [ ] No crash on any error scenario

AC-1.8: Responsive Design
□ [ ] 320px: Single column, full-width buttons
□ [ ] 768px: 2-column topic grid
□ [ ] 1024px: Side-by-side layout on player
□ [ ] No horizontal overflow at any breakpoint
□ [ ] Touch targets 44x44px minimum on mobile
□ [ ] Font sizes scale appropriately
```

---

## FEATURE 2: SPEAKING PRACTICE

### 2.1 Business Goal

```
PRIMARY GOAL:
Hoàn thiện kỹ năng nói thông qua việc nghe audio,
ghi âm giọng nói, và nhận AI-powered pronunciation feedback.

SECONDARY GOALS:
├── Tạo closed loop: Listen → Speak → Feedback
├── Thu thập speech data để train/improve recognition
├── Tăng engagement time (speaking adds ~2 phút mỗi clip)
├── Build pronunciation confidence through repetition
└── Differentiate from competitors (AI feedback)

BUSINESS CONTEXT:
├── Speaking là bước 2 của learning loop
├── Speaking requires completion of Listening first
├── Speech recognition quality = key differentiator
├── Pronunciation score = secondary metric to accuracy
└── Speaking practice increases session time = better retention

SUCCESS METRICS:
├── Speaking completion rate: > 60% of users who finish listening attempt speaking
├── Average pronunciation score: 65-80% (not discouraging)
├── Re-record rate: 30-40% (indicates engagement)
├── Correlation: Higher listening accuracy → Higher speaking score
└── Session duration increase: +2-4 minutes when speaking added
```

### 2.2 Functional Requirements

```
FR-2.1: Recording Interface
├── [x] Request microphone permission on first use
├── [x] Display permission guide if denied
├── [x] Show large record button (72x72px minimum)
├── [x] Display recording timer (count up, max 30s)
├── [x] Show live waveform during recording
├── [x] Auto-stop at 30-second limit
├── [x] Manual stop via button tap
├── [x] Cancel recording and restart
├── [x] Playback recorded audio
├── [x] Re-record option
└── [x] Disable recording if permission denied

FR-2.2: Speech Recognition
├── [x] Use Web Speech API (primary, browser-native)
├── [x] Support continuous recognition mode
├── [x] Display interim results (dashed)
├── [x] Display final results (solid)
├── [x] Fallback to Whisper API (Supabase Edge Function) for Safari/iOS
├── [x] Language: en-US (for English practice)
├── [x] Timeout: 30 seconds max
└── [x] Error handling for recognition failures

FR-2.3: Pronunciation Scoring
├── [x] Compare transcribed text with expected transcript
├── [x] Word-level matching (similar to listening)
├── [x] Calculate pronunciation accuracy: matched_words / total_words
├── [x] Factor in fluency (speaking pace)
├── [x] Factor in completeness (all words spoken)
├── [x] Display overall score (0-100%)
├── [x] Display breakdown: Accuracy, Fluency, Completeness
└── [x] Generate word-level feedback

FR-2.4: Feedback & Results
├── [x] Show overall pronunciation score
├── [x] Display word-by-word breakdown
├── [x] Highlight mispronounced words (⚠️)
├── [x] Show expected vs. spoken text side-by-side
├── [x] Provide AI-generated feedback tips
├── [x] Play back user's recording
├── [x] Offer re-record option
└── [x] Navigate to next clip or skip speaking

FR-2.5: Skip & Continue
├── [x] "Bỏ qua speaking" option available
├── [x] Skipping does not affect listening score
├── [x] "Tiếp tục" after speaking advances to next clip
├── [x] Speaking score is saved (even if skipped on later clips)
└── [x] Lesson completion requires listening only (speaking optional)
```

### 2.3 User Actions

```
UA-2.1: Permission Flow
├── User taps "Bắt đầu ghi âm"
│   └── System checks microphone permission
│   ├── If not determined: Request permission
│   ├── If granted: Start recording immediately
│   └── If denied: Show permission guide modal
├── User denies permission
│   └── System shows: "Cần quyền truy cập microphone"
│   └── System shows: "Mở cài đặt" button
│   └── System allows "Bỏ qua speaking"
└── User grants permission
    └── System starts recording automatically

UA-2.2: Recording Flow
├── User taps Record button
│   └── System starts MediaRecorder
│   └── System starts timer
│   └── System displays live waveform
│   └── System enables Stop button
├── User taps Stop button
│   └── System stops MediaRecorder
│   └── System converts blob to audio URL
│   └── System shows playback controls
├── User taps Play Recording
│   └── System plays back recorded audio
├── User taps Re-record
│   └── System discards recording
│   └── System resets to recording state
└── Timer reaches 30s
    └── System auto-stops recording
    └── System shows recorded state

UA-2.3: Speech Recognition Flow
├── After recording, user taps "Xem kết quả"
│   └── System shows "Đang nhận diện..." loading state
├── System transcribes via Web Speech API
│   └── If interim results: Show dashed preview
│   └── If final results: Process comparison
├── If Web Speech API unavailable
│   └── System calls Supabase Edge Function with Whisper
│   └── System receives transcribed text
├── Transcription complete
│   └── System compares with expected
│   └── System calculates scores
│   └── System generates feedback
│   └── System displays result screen
└── User sees pronunciation score

UA-2.4: Navigation
├── User taps "Tiếp tục clip X"
│   └── System saves speaking result
│   └── System navigates to next clip
├── User taps "Ghi âm lại"
│   └── System resets to recording state
│   └── User re-records
├── User taps "Bỏ qua speaking"
│   └── System marks clip as "skipped"
│   └── System navigates to next clip
└── After final clip
    └── System shows lesson complete (with speaking summary)
```

### 2.4 System Actions

```
SA-2.1: On Recording Start
├── System checks navigator.mediaDevices.getUserMedia support
│   ├── If supported: Request stream
│   └── If not: Show "Trình duyệt không hỗ trợ" error
├── System creates MediaRecorder instance
│   ├── Format: audio/webm;codecs=opus
│   ├── Bitrate: 128kbps
│   └── Timeslice: 100ms chunks
├── System starts recording
├── System initializes waveform analyzer
├── System starts timer
└── System updates UI to recording state

SA-2.2: On Recording Stop
├── System stops MediaRecorder
├── System collects all chunks into Blob
├── System creates object URL from Blob
├── System releases MediaStream tracks
├── System calculates recording duration
├── System updates UI to recorded state
└── System enables "Xem kết quả" button

SA-2.3: On Speech Recognition
├── System selects recognition engine
│   ├── Primary: Web Speech API
│   │   ├── recognition.continuous = false
│   │   ├── recognition.interimResults = true
│   │   └── recognition.lang = 'en-US'
│   └── Fallback: Whisper via Edge Function
│       ├── POST audio blob to /api/speech/transcribe
│       └── Receive transcribed text
├── System processes recognition result
│   ├── Filter out filler words (um, uh)
│   ├── Normalize text
│   └── Handle empty result
├── System compares with expected transcript
├── System calculates pronunciation score
└── System generates feedback

SA-2.4: On Pronunciation Score Calculation
├── System runs word alignment (LCS algorithm)
├── System marks words: correct / mispronounced / missing / extra
├── System calculates:
│   ├── Accuracy: (correct / expected_count) * 100
│   ├── Fluency: Based on pauses and speaking pace
│   │   ├── Normal: 120-160 words/minute
│   │   ├── Slow: < 100 wpm → penalty
│   │   └── Fast: > 200 wpm → slight penalty
│   └── Completeness: (spoken_words / expected_words) * 100
├── System combines into overall score:
│   └── Overall = (Accuracy * 0.5) + (Fluency * 0.25) + (Completeness * 0.25)
└── System generates word-level feedback

SA-2.5: On Speaking Result Save
├── System saves to user_clip_progress
│   ├── user_id, clip_id
│   ├── recording_url (Supabase Storage path)
│   ├── transcribed_text
│   ├── pronunciation_score
│   └── completed_at
├── System uploads recording to Supabase Storage
│   ├── Path: /recordings/{user_id}/{lesson_id}/{clip_id}_{timestamp}.webm
│   └── Public URL stored in record
└── System updates daily_activity (speaking_clips += 1)

SA-2.6: On Browser Unavailable (Fallback)
├── System detects Safari or Firefox without Web Speech
├── System calls /api/speech/transcribe
│   ├── Payload: FormData with audio blob
│   └── Endpoint uses Supabase Edge Function
├── Edge Function:
│   ├── Receives audio
│   ├── Sends to Whisper API (OpenAI)
│   ├── Returns transcribed text
│   └── Handles errors gracefully
├── System proceeds with comparison
└── Fallback cost: ~$0.001 per transcription
```

### 2.5 Validation Rules

```
VR-2.1: Microphone Permission
├── Permission must be "granted" to record
├── Permission "denied" shows guide to enable
├── Permission "prompt" triggers browser dialog
└── Permission "prompt" on user gesture (button tap) only

VR-2.2: Recording Constraints
├── Minimum recording: 1 second (ignore < 1s)
├── Maximum recording: 30 seconds
├── Audio format: audio/webm (Chrome), audio/mp4 (Safari)
├── Minimum sample rate: 16kHz
└── Recording must have audio (detect silence threshold)

VR-2.3: Speech Recognition
├── Language must be en-US
├── Recognition timeout: 30 seconds
├── Minimum confidence threshold: 0.5
├── Empty result: Retry once, then fail gracefully
└── No speech detected: Show "Không nhận diện được giọng nói"

VR-2.4: Pronunciation Scoring
├── Overall score: 0-100
├── Accuracy component: 0-100
├── Fluency component: 0-100
├── Completeness component: 0-100
└── Weighting: Accuracy (50%), Fluency (25%), Completeness (25%)

VR-2.5: Audio Storage
├── Maximum file size: 10MB per recording
├── Supported formats: webm, mp4, wav
├── Storage location: Supabase Storage
└── Retention: Keep for 90 days, then auto-delete
```

### 2.6 Scoring Logic

```
SL-2.1: Pronunciation Score Algorithm

Input:
  expected = "I was walking to school"
  transcribed = "I was walking to skul"

Step 1: Normalize
  expected_norm = "i was walking to school"
  transcribed_norm = "i was walking to skul"

Step 2: Word Alignment
  aligned = [
    ("i", "i"), ✅
    ("was", "was"), ✅
    ("walking", "walking"), ✅
    ("to", "to"), ✅
    ("school", "skul"), ❌ (mispronounced)
  ]

Step 3: Component Scores
  Accuracy = (4 correct / 5 expected) * 100 = 80%
  Fluency = Based on speaking pace
    - Speaking time: 4 seconds
    - Words: 5
    - WPM: 75 (slightly slow but acceptable)
    - Fluency = 75%
  Completeness = (5 spoken / 5 expected) * 100 = 100%

Step 4: Overall Score
  Overall = (80 * 0.5) + (75 * 0.25) + (100 * 0.25) = 83.75%

Step 5: Word Feedback
  "school" → Mispronounced. Try: /skuːl/ (long 'oo' sound)

SL-2.2: Score Display Thresholds
  ├── Score >= 90%: "TUYỆT VỜI! Gần như bản ngữ"
  ├── Score >= 80%: "Khá tốt! Cần cải thiện một chút"
  ├── Score >= 70%: "Khá ổn. Tiếp tục luyện tập."
  ├── Score >= 60%: "Cần cải thiện. Nghe lại audio."
  └── Score < 60%: "Thử phát âm từng từ một."

SL-2.3: Mispronunciation Detection
  ├── Phonetic similarity: Levenshtein on phonetic representation
  ├── Common confusions:
  │   ├── /v/ vs /w/ (very/wery)
  │   ├── /θ/ vs /s/ (think/sink)
  │   ├── /ð/ vs /d/ (this/dis)
  │   └── /æ/ vs /ɛ/ (bad/bed)
  └── System marks as "mispronounced" (⚠️) not "wrong" (❌)
```

### 2.7 Error Handling

```
EH-2.1: Permission Denied
├── Detection: permissionState = "denied"
├── User Message: "Cần quyền truy cập microphone để sử dụng tính năng này."
├── Action: Show "Mở cài đặt trình duyệt" button
├── Fallback: Allow user to skip speaking entirely
└── Guide: "Vào Settings > Privacy > Microphone > Allow [browser]"

EH-2.2: Microphone Not Available
├── Detection: navigator.mediaDevices.getUserMedia throws
├── User Message: "Microphone không khả dụng trên thiết bị này."
├── Action: Show skip option
└── Log: Track device/browser for monitoring

EH-2.3: Recording Fails
├── Detection: MediaRecorder.onerror event
├── User Message: "Ghi âm thất bại. Vui lòng thử lại."
├── Action: Auto-reset to ready state
├── Fallback: Retry button visible
└── Log: Sentry event with error details

EH-2.4: Speech Recognition Fails
├── Detection: recognition.onerror or API timeout
├── First retry: Automatic retry once
├── If retry fails:
│   ├── User Message: "Không nhận diện được giọng nói. Thử nói rõ hơn."
│   ├── Action: Show re-record + skip options
│   └── Fallback: Use Whisper API
├── Whisper fallback also fails:
│   ├── User Message: "Đã xảy ra lỗi. Vui lòng thử lại."
│   └── Action: Retry with Whisper again
└── Log: Track recognition failures by browser/type

EH-2.5: Silent Recording
├── Detection: No audio amplitude detected for 3+ seconds
├── User Message: "Không phát hiện giọng nói. Hãy nói to hơn."
├── Action: Auto-stop recording, show retry
└── UX: Warning during recording if too quiet

EH-2.6: Recording Too Long (> 30s)
├── Detection: Timer reaches 30 seconds
├── System: Auto-stop recording
├── User Message: Toast "Đã đạt giới hạn 30 giây."
└── Action: Show recorded state, allow submission

EH-2.7: Browser Doesn't Support MediaRecorder
├── Detection: typeof MediaRecorder === "undefined"
├── User Message: "Trình duyệt không hỗ trợ ghi âm."
├── Action: Show supported browsers: Chrome, Safari 14.1+, Edge
└── Fallback: Allow skip speaking

EH-2.8: Audio Storage Upload Fails
├── Detection: Supabase Storage upload error
├── System: Store recording in IndexedDB temporarily
├── System: Retry upload on next app load
├── User Message: "Recording đã lưu. Sẽ đồng bộ khi có mạng."
└── UX: No interruption to user flow
```

### 2.8 Edge Cases

```
EC-2.1: User Speaks Too Fast
├── Speaking time: 2 seconds for 5 words (150 WPM)
├── System: Fluency score = 100% (within normal range)
└── UX: No special handling needed

EC-2.2: User Speaks Too Slow
├── Speaking time: 15 seconds for 5 words (20 WPM)
├── System: Fluency score = 40% (below threshold)
├── Feedback: "Bạn nói hơi chậm. Thử nói tự nhiên hơn."
└── UX: Gentle encouragement, not penalizing

EC-2.3: User Says All Words But One Wrong
├── 4/5 words correct, 1 mispronounced
├── System: Accuracy = 80%, overall ~78%
├── Feedback: Specific tip for the wrong word
└── UX: Positive tone, focus on improvement

EC-2.4: Empty Transcription (Recognition Returns Nothing)
├── System: Detect empty string
├── User Message: "Không nhận diện được giọng nói."
├── Action: Offer retry or skip
└── Common cause: Background noise, too quiet, accent

EC-2.5: User Records But Doesn't Submit
├── User records audio but navigates away
├── System: Discard recording (don't save)
├── On return: Must re-record
└── UX: "Recording chưa được lưu. Ghi âm lại để tiếp tục."

EC-2.6: Simultaneous Listening + Speaking Confusion
├── User starts recording while audio still playing
├── System: Pause audio automatically when recording starts
└── UX: Seamless, no confusion

EC-2.7: Accent Variations
├── User has non-standard accent (Indian, Chinese, etc.)
├── System: Web Speech API may misrecognize
├── Whisper fallback: Better at accent handling
├── Feedback: Encourage without being discouraging
└── UX: "Phát âm của bạn có thể khác. Cố gắng gần với audio gốc nhất có thể."

EC-2.8: Very Short Recording (< 3 seconds)
├── User taps record, immediately taps stop
├── System: Reject recording, show "Recording quá ngắn. Thử lại."
└── Minimum enforced: 1 second

EC-2.9: Background Noise in Recording
├── MediaRecorder captures ambient noise
├── Speech recognition may misinterpret noise as words
├── System: Whisper is more robust to noise
├── For Web Speech API: May need to advise user
└── UX: "Nơi bạn đang ở khá ồn. Thử nơi yên tĩnh hơn."

EC-2.10: User Skips Speaking Multiple Times
├── User taps "Bỏ qua speaking" on all clips
├── System: Lesson still completes (speaking optional)
├── Speaking summary: "Bạn đã bỏ qua speaking trên X/Y clips"
└── No penalty to overall lesson score
```

### 2.9 Acceptance Criteria

```
AC-2.1: Recording Interface
□ [ ] Record button is minimum 72x72px, clearly visible
□ [ ] Timer counts up during recording, max 30s shown
□ [ ] Live waveform displays during recording
□ [ ] Recording auto-stops at 30 seconds
□ [ ] Stop button stops recording manually
□ [ ] Playback button plays recorded audio
□ [ ] Re-record button resets to recording state
□ [ ] Permission denied shows guide to enable

AC-2.2: Speech Recognition
□ [ ] Chrome: Web Speech API works without API key
□ [ ] Safari/iOS: Falls back to Whisper API
□ [ ] Transcription completes within 5 seconds
□ [ ] Empty result shows retry option
□ [ ] Interim results shown during recognition

AC-2.3: Pronunciation Scoring
□ [ ] Score displayed as 0-100%
□ [ ] Breakdown shows: Accuracy, Fluency, Completeness
□ [ ] Word-level highlighting correct
□ [ ] Mispronounced words marked ⚠️
□ [ ] Wrong words marked ❌
□ [ ] Score thresholds match specification

AC-2.4: Feedback Quality
□ [ ] AI feedback appears for each mispronounced word
□ [ ] Feedback is specific and actionable
□ [ ] General tip provided if multiple errors
□ [ ] Encouraging tone maintained

AC-2.5: Navigation & State
□ [ ] "Tiếp tục" navigates to next clip
□ [ ] "Ghi âm lại" resets to recording
□ [ ] "Bỏ qua speaking" advances without score
□ [ ] Speaking result saved to database
□ [ ] Recording uploaded to storage
□ [ ] Lesson complete screen shows speaking summary

AC-2.6: Error Handling
□ [ ] Permission denied: Guide visible
□ [ ] Recognition fails: Retry + skip options
□ [ ] Silent recording: Warning + retry
□ [ ] Network error: Offline handling
□ [ ] Browser incompatibility: Message + skip option

AC-2.7: Mobile UX
□ [ ] Touch targets minimum 44x44px
□ [ ] Keyboard does not cover UI during recording
□ [ ] Waveform visible on small screens
□ [ ] Recording state persists when keyboard shown

AC-2.8: Accessibility
□ [ ] Record button has aria-label
□ [ ] Recording state announced to screen reader
□ [ ] Score and feedback readable by screen reader
□ [ ] Keyboard navigation functional (Enter to record)
□ [ ] High contrast mode supported
```

---

## FEATURE 3: PROGRESS TRACKING

### 3.1 Business Goal

```
PRIMARY GOAL:
Cung cấp cho user một cái nhìn rõ ràng về tiến độ học tập,
tạo cảm giác achievement và motivation để quay lại mỗi ngày.

SECONDARY GOALS:
├── Increase perceived value (user thấy mình tiến bộ)
├── Surface learning gaps (topic nào cần cải thiện)
├── Drive engagement (người dùng muốn fill in the chart)
├── Data collection for personalization
└── Foundation for future features (analytics, recommendations)

BUSINESS CONTEXT:
├── Progress = tangible proof of learning
├── Visible progress = retention driver mạnh
├── Progress dashboard = first thing returning users check
├── Gaps in progress = opportunity for recommendation engine
└── Weekly/monthly charts = social sharing potential

SUCCESS METRICS:
├── Dashboard visits per user per week: > 2
├── User with progress > 0: > 70% of registered users
├── Most visited section: Progress dashboard (after home)
├── Correlation: Users who view progress → Higher retention
└── Feature engagement: Users explore breakdown details
```

### 3.2 Functional Requirements

```
FR-3.1: Progress Overview Dashboard
├── [x] Display total lessons completed
├── [x] Display total time practiced (hours/minutes)
├── [x] Display average accuracy across all lessons
├── [x] Display average pronunciation score
├── [x] Display current streak
├── [x] Display longest streak ever achieved
├── [x] Show weekly activity chart (7 days)
├── [x] Show monthly activity chart (4 weeks)
├── [x] Display topic-by-topic progress
└── [x] Show recommended next lesson

FR-3.2: Weekly Activity Chart
├── [x] Bar chart showing lessons completed per day
├── [x] 7 bars for current week (Mon-Sun)
├── [x] Color intensity based on activity level
├── [x] Show day labels (T2, T3, etc.)
├── [x] Show tooltip with details on hover/tap
├── [x] Highlight today with accent color
└── [x] Navigate to previous/next week

FR-3.3: Monthly Activity Chart
├── [x] Calendar heatmap (GitHub-style)
├── [x] 4-5 weeks visible
├── [x] Color: Gray (0) → Green (more activity)
├── [x] Click date to see day's detail
├── [x] Legend showing color scale
└── [x] Navigate to previous/next month

FR-3.4: Topic Progress Breakdown
├── [x] Show progress % for each topic
├── [x] Show lessons completed / total per topic
├── [x] Show average accuracy per topic
├── [x] Show last activity date per topic
├── [x] Indicate weakest topic (needs attention)
├── [x] Indicate strongest topic
└── [x] Click topic to see lesson breakdown

FR-3.5: XP & Level System
├── [x] Display current XP total
├── [x] Display current level (1-30+)
├── [x] Show XP progress to next level
├── [x] Display XP breakdown (from lessons, streaks, etc.)
├── [x] Show level badges/milestones
└── [x] Announce level-up when threshold reached

FR-3.6: Statistics Cards
├── [x] Total lessons completed (lifetime)
├── [x] Total clips completed
├── [x] Total time practiced
├── [x] Average accuracy (all time)
├── [x] Average pronunciation score (all time)
├── [x] Words learned (unique vocabulary)
└── [x] Days active

FR-3.7: Insights & Recommendations
├── [x] Show strongest skill area
├── [x] Show area needing most improvement
├── [x] Provide personalized next lesson recommendation
├── [x] Show weekly summary ("Bạn đã học X bài, tăng Y% so với tuần trước")
├── [x] Identify patterns (e.g., "Bạn học tốt hơn vào buổi sáng")
└── [x] Achievement notifications when milestones hit
```

### 3.3 User Actions

```
UA-3.1: View Dashboard
├── User navigates to /progress or dashboard
│   └── System fetches all progress data
│   ├── Fetch user stats
│   ├── Fetch weekly activity
│   ├── Fetch monthly activity
│   ├── Fetch topic progress
│   └── Fetch XP/Level data
├── System renders dashboard
└── User sees overview cards + charts

UA-3.2: Explore Weekly Chart
├── User hovers over bar (desktop)
│   └── System shows tooltip with day's details
│   ├── Lessons completed
│   ├── Accuracy average
│   └── Time spent
├── User taps bar (mobile)
│   └── System shows bottom sheet with day's details
├── User taps "<" to see previous week
│   └── System fetches previous week's data
│   └── System updates chart
└── User taps ">" to see next week
    └── System updates chart

UA-3.3: Explore Monthly Calendar
├── User views calendar heatmap
│   └── System shows current month by default
├── User taps on a date
│   └── System shows bottom sheet with date's activity
│   ├── Lessons completed that day
│   ├── Topics studied
│   ├── Accuracy
│   └── Streak status
├── User swipes left/right (mobile)
│   └── System navigates months
└── User taps month name
    └── System returns to current month

UA-3.4: View Topic Breakdown
├── User scrolls to Topic Progress section
│   └── System shows list of all topics
├── User taps on a topic
│   └── System expands topic details
│   ├── List of lessons in topic
│   ├── Completion status per lesson
│   ├── Accuracy per lesson
│   └── Best score
├── User taps "Học tiếp"
│   └── System navigates to next incomplete lesson
└── User taps "Xem tất cả"
    └── System navigates to topic page

UA-3.5: View XP & Level
├── User scrolls to XP section
│   └── System shows current level + progress bar
├── Level-up occurs
│   └── System triggers celebration animation
│   └── System shows level-up modal
│   └── New badge unlocked notification
├── User taps level badge
│   └── System shows level history / all levels
└── User views XP breakdown
    └── System shows chart: XP from lessons / streaks / achievements

UA-3.6: Share Progress
├── User taps "Chia sẻ tiến độ"
│   └── System generates shareable image/card
│   ├── Stats summary
│   ├── Current streak
│   ├── Level
│   └── VinaListen branding
├── User shares to social media
│   └── System tracks share event
└── User copies link
    └── System generates unique shareable URL
```

### 3.4 System Actions

```
SA-3.1: On Dashboard Load
├── System validates user authentication
│   ├── If not logged in: Redirect to login
│   └── If logged in: Fetch all data in parallel
├── System aggregates data from multiple tables
│   ├── users: streak, level, total_xp
│   ├── user_progress: lesson_completion, accuracy
│   ├── user_clip_progress: clip_completion, pronunciation
│   ├── daily_activity: time_practiced, lessons_count
│   └── vocabulary_learning: words_learned
├── System calculates derived metrics
│   ├── Average accuracy = sum(accuracy) / count(lessons)
│   ├── Total time = sum(time_practiced)
│   ├── Topics completed = count(completed_lessons) by topic
│   └── Weekly/monthly aggregates
├── System identifies insights
│   ├── Weakest topic = lowest avg accuracy
│   ├── Strongest topic = highest avg accuracy
│   ├── Improvement trend = this week vs last week
│   └── Best performing time of day
└── System renders dashboard with animations

SA-3.2: On Lesson Completion (Update Progress)
├── System receives lesson_complete event
├── System updates user_progress table
│   ├── Set completed = true
│   ├── Set accuracy = avg_clip_accuracy
│   ├── Set score = total_score
│   └── Set completed_at = now
├── System updates user's XP
│   ├── Calculate XP earned
│   ├── Add to total_xp
│   └── Check level-up threshold
├── System updates daily_activity
│   ├── Increment lessons_completed
│   ├── Add time_practiced
│   └── Update updated_at
├── System recalculates topic progress %
└── System triggers real-time update on dashboard (if open)

SA-3.3: On Clip Completion (Speaking Score)
├── System receives clip_complete event
├── System updates user_clip_progress
│   ├── recording_url, transcribed_text
│   ├── pronunciation_score
│   └── completed_at
├── System updates daily_activity
│   └── Increment speaking_clips_completed
└── System recalculates average pronunciation score

SA-3.4: Level-Up Detection
├── System checks XP against level thresholds
│   ├── Level 1: 0 XP
│   ├── Level 2: 100 XP
│   ├── Level 3: 250 XP
│   ├── Level 4: 500 XP
│   ├── Level 5: 800 XP
│   └── Each level: previous + level * 100 XP
├── If level threshold crossed:
│   ├── Set new level in users table
│   ├── Trigger celebration animation
│   ├── Check for badge unlocks
│   └── Send notification (in-app)
└── System logs level_up event

SA-3.5: On Weekly Data Request
├── System receives week parameter (ISO week number)
├── System queries daily_activity for user
│   └── WHERE date BETWEEN week_start AND week_end
├── System aggregates by day
│   └── Sum lessons_completed per day
├── System calculates week totals
│   ├── Total lessons
│   ├── Total time
│   └── Average accuracy
└── System returns JSON with daily breakdown

SA-3.6: On Recommendation Generation
├── System identifies user's weakest topic
│   └── Topic with lowest avg accuracy
├── System identifies next lesson
│   └── First incomplete lesson in weakest topic
├── System generates personalized message
│   └── "Based on your progress, we recommend: [Lesson Name]"
└── System surfaces on dashboard
```

### 3.5 Validation Rules

```
VR-3.1: Progress Data Integrity
├── All calculations must be non-negative
├── Average calculations must handle zero values
├── Time practiced must be in valid range (0-1440 minutes/day)
├── Accuracy must be 0-100%
└── XP must not exceed integer limits

VR-3.2: Activity Tracking
├── One daily_activity record per user per day
├── Use upsert to prevent duplicates
├── Validate date is within reasonable range
└── Handle timezone correctly (user's local time)

VR-3.3: XP System
├── XP earned per action must be within defined ranges
├── Level calculation must be deterministic
├── No XP can be negative
└── XP overflow protection (max 2^31)

VR-3.4: Chart Data
├── Weekly chart: Exactly 7 data points (or fewer for partial week)
├── Monthly chart: 28-31 data points
├── Empty days show 0, not null
└── Percentages rounded to 1 decimal
```

### 3.6 Scoring Logic

```
SL-3.1: XP Calculation

Lesson Completion:
  Base XP = round(accuracy * 10)
  Bonus (perfect score): +10 XP
  Bonus (fast completion < 5 min): +5 XP
  Bonus (first try, no retry): +3 XP
  Max per lesson: 100 XP

Speaking Practice:
  Base XP = round(pronunciation_score * 5)
  Bonus (score > 90%): +5 XP
  Bonus (first attempt): +2 XP
  Max per clip: 50 XP

Daily Streak Bonus:
  7-day streak: +20 XP bonus
  30-day streak: +100 XP bonus
  100-day streak: +500 XP bonus

Achievement Unlocks:
  First lesson: +50 XP
  7-day streak: +30 XP
  100 lessons: +200 XP
  Level milestones: +50-500 XP

SL-3.2: Level Thresholds

Level thresholds (cumulative XP):
  Level 1: 0
  Level 2: 100
  Level 3: 250
  Level 4: 500
  Level 5: 800
  Level 6: 1,200
  Level 7: 1,700
  Level 8: 2,300
  Level 9: 3,000
  Level 10: 3,800
  Level 15: 8,000
  Level 20: 15,000
  Level 25: 25,000
  Level 30: 40,000

Formula (for levels beyond defined):
  threshold(level) = 100 * level * (level + 1) / 2

SL-3.3: Topic Strength Score

For each topic:
  Strength = (avg_accuracy * 0.5) + (completion_rate * 0.3) + (consistency * 0.2)

Where:
  avg_accuracy = Average accuracy across lessons in topic
  completion_rate = Lessons completed / Total lessons
  consistency = Days practiced in topic / Days since first lesson

Weakest Topic = Lowest strength score
Strongest Topic = Highest strength score
```

### 3.7 Error Handling

```
EH-3.1: Dashboard Load Fails
├── Detection: API returns error or timeout (> 5s)
├── User Message: "Không thể tải tiến độ. Vui lòng thử lại."
├── Action: Show retry button
├── Fallback: Show cached data if available (localStorage)
└── Log: Sentry event

EH-3.2: Empty Progress Data (New User)
├── Detection: No records in user_progress
├── User Message: "Bạn chưa có tiến độ nào. Bắt đầu học ngay!"
├── Action: Show empty state with CTA
├── Content: "Hoàn thành bài đầu tiên để xem tiến độ của bạn"
└── CTA: "Chọn topic để học"

EH-3.3: Stale Data
├── Detection: Last update > 1 hour ago, dashboard open
├── System: Refresh data silently in background
├── User: No interruption
└── If refresh fails: Keep showing cached data

EH-3.4: Chart Rendering Fails
├── Detection: Chart library error
├── Fallback: Show data as text/table
├── User Message: "Biểu đồ không hiển thị được. Hiển thị dạng bảng."
└── Action: Render HTML table instead

EH-3.5: XP Calculation Error
├── Detection: Server-side calculation throws
├── System: Default to 0 XP for action
├── User: No visible error, action completes
└── Log: Sentry event for investigation

EH-3.6: Level-Up Detection Fails
├── Detection: Level not updated after XP add
├── System: Background job recalculates levels nightly
├── User: May see delayed level-up
└── Fix: Next action triggers re-check
```

### 3.8 Edge Cases

```
EC-3.1: User Completes Lesson But Not Logged In
├── Progress not saved
├── On next login: Progress does not appear
├── UX: "Đăng nhập để lưu tiến độ của bạn" prompt
└── Mitigation: Prompt after first lesson completion

EC-3.2: Very High XP User (> Level 30)
├── System: Continue leveling indefinitely
├── Formula: Use same threshold formula
├── Display: "Level 31: X,XXX / Y,YYY XP"
└── UX: Special badge for high-level users

EC-3.3: Zero Accuracy Lessons
├── System: Calculate average with zeros included
├── Chart: Show 0% in visualizations
└── UX: "Cần cải thiện [Topic Name]" recommendation

EC-3.4: Multiple Devices
├── User practices on different devices
├── System: Aggregate across all devices (same user_id)
├── Dashboard: Shows combined total
└── Last device used shown in session indicator

EC-3.5: Long Break (> 30 Days)
├── User returns after 30+ days
├── System: Show "Chào mừng trở lại!"
├── System: Compare with previous activity
├── Message: "Lần cuối bạn học là [date]. Tiếp tục nào!"
└── Streak: May be broken (see Streak System)

EC-3.6: Incomplete Dashboard Load
├── Some data loads, some fails
├── System: Show available data
├── System: Show skeleton for failed sections
├── System: Retry failed sections
└── UX: "Một phần tiến độ đang được tải..."

EC-3.7: Timezone Edge Cases
├── User travels across timezones
├── System: Store all dates in UTC
├── System: Display in user's local timezone
├── Daily activity: Based on local date at midnight
└── Edge: UTC midnight boundary (handles correctly)

EC-3.8: Very Long Activity (24+ Hours in One Day)
├── Theoretical max: User practices continuously
├── System: Cap display at 24 hours
├── Message: "Thực sự? Bạn học X tiếng liên tục!"
└── Gamification: Special badge for dedication
```

### 3.9 Acceptance Criteria

```
AC-3.1: Dashboard Load
□ [ ] Dashboard loads within 2 seconds
□ [ ] All stat cards show correct values
□ [ ] Charts render with correct data
□ [ ] Skeleton shown during loading
□ [ ] Empty state shown for new users
□ [ ] Mobile: Single column, scrollable
□ [ ] Desktop: Multi-column, card layout

AC-3.2: Weekly Chart
□ [ ] 7 bars displayed (Mon-Sun)
□ [ ] Today's bar highlighted in accent color
□ [ ] Tooltip shows details on hover/tap
□ [ ] Week navigation works (prev/next)
□ [ ] Empty days show zero (not missing)

AC-3.3: Monthly Calendar
□ [ ] Calendar grid renders correctly
□ [ ] Color intensity matches activity level
□ [ ] Click date shows day detail
□ [ ] Month navigation works
□ [ ] Legend displays color scale

AC-3.4: Topic Progress
□ [ ] All topics listed with progress %
□ [ ] Completion count accurate (X/Y)
□ [ ] Accuracy per topic correct
□ [ ] Weakest/strongest correctly identified
□ [ ] Tap topic expands details

AC-3.5: XP & Level
□ [ ] Current level displayed correctly
□ [ ] XP to next level shown
□ [ ] Level-up triggers celebration
□ [ ] XP breakdown chart accurate
□ [ ] Milestone badges unlock correctly

AC-3.6: Data Accuracy
□ [ ] Lesson count matches actual completions
□ [ ] Time practiced matches sum of session times
□ [ ] Accuracy is weighted average
□ [ ] Streak matches streak system
□ [ ] Charts match underlying data

AC-3.7: Real-time Updates
□ [ ] Dashboard updates after lesson completion
□ [ ] XP animates when earned
□ [ ] Streak counter updates immediately
□ [ ] Progress bar fills on completion

AC-3.8: Sharing
□ [ ] Share image generates correctly
□ [ ] Stats accurate on share card
□ [ ] Share link works for recipients
□ [ ] Social media share completes
```

---

## FEATURE 4: STREAK SYSTEM

### 4.1 Business Goal

```
PRIMARY GOAL:
Tạo và duy trì daily habit thông qua streak mechanic —
user bị "lose something" nếu không học mỗi ngày.

SECONDARY GOALS:
├── Increase daily active users (DAU)
├── Create "reason to return" every 24 hours
├── Leverage loss aversion psychology
├── Drive engagement during low-motivation periods
└── Build emotional investment in the app

BUSINESS CONTEXT:
├── Streak = Duolingo's most powerful retention mechanic
├── Research: Streak creates 3x higher retention
├── Risk: Streak fatigue (user quit after long streak)
├── Mitigation: Streak freeze, milestone celebrations
└── Data: Every streak day = 10% higher 30-day retention

SUCCESS METRICS:
├── Users with streak > 0: > 40% of registered users
├── Average streak length: > 5 days
├── Streak freeze usage: ~15% of users/week
├── Streak broken rate: < 30% per week
├── Users with streak > 30: > 10% of active users
└── Correlation: Streak > 7 → 2x more likely to be active in 30 days
```

### 4.2 Functional Requirements

```
FR-4.1: Streak Tracking
├── [x] Track current_streak (consecutive days)
├── [x] Track longest_streak (all-time record)
├── [x] Track streak_start_date (current streak began)
├── [x] Track last_lesson_date (most recent activity)
├── [x] Increment streak when user completes ≥1 lesson/day
├── [x] Reset streak to 0 if no activity yesterday
├── [x] Preserve streak if streak freeze available
├── [x] Update streak in real-time on lesson complete
└── [x] Persist streak in users table

FR-4.2: Streak Display
├── [x] Show streak counter in header (always visible)
├── [x] Show fire emoji (🔥) when streak > 0
├── [x] Show "0" with gray indicator when streak = 0
├── [x] Show streak number prominently on dashboard
├── [x] Show streak milestone badges
├── [x] Show streak at-risk indicator (11pm with 0 activity)
├── [x] Show streak protected indicator (freeze active)
└── [x] Animate streak counter on increment

FR-4.3: Streak Milestones
├── [x] Celebrate 7-day streak: "1 tuần! Bạn đang tạo thói quen!"
├── [x] Celebrate 14-day streak: "2 tuần! Impressive!"
├── [x] Celebrate 30-day streak: "Tháng! Bạn nghiêm túc!"
├── [x] Celebrate 60-day streak: "2 tháng! Commitment!"
├── [x] Celebrate 100-day streak: "100 ngày! Legendary!"
├── [x] Celebrate 365-day streak: "1 năm! Master!"
├── [x] Show milestone badge on profile
└── [x] Award XP bonus for milestone streaks

FR-4.4: Streak Freeze
├── [x] Provide 1 free streak freeze per week
├── [x] Reset freeze count every Monday at midnight
├── [x] Auto-apply freeze if user hasn't practiced today (11pm)
├── [x] Allow manual freeze activation
├── [x] Show freeze count remaining (e.g., "1 freeze left")
├── [x] Prevent freeze if none available
├── [x] Visual indicator (snowflake ❄️) on protected day
└── [x] Don't count freeze days as streak days

FR-4.5: Streak Calendar
├── [x] GitHub-style contribution graph
├── [x] Green = practiced that day
├── [x] Gray = no activity
├── [x] Blue = freeze protected
├── [x] Red = streak broken
├── [x] Tap date to view day's activity
└── [x] Show current month + 2 previous months

FR-4.6: Streak Notifications
├── [x] Reminder notification at user-chosen time
├── [x] "At risk" notification at 9pm if no activity today
├── [x] Streak broken notification (next day)
├── [x] Streak milestone notification
├── [x] Comeback notification if no activity for 3 days
└── [x] User can disable all streak notifications

FR-4.7: Streak Recovery (Comeback)
├── [x] After streak broken, offer "Start new streak"
├── [x] After 3 days inactive, send comeback notification
├── [x] After 7 days inactive, offer streak recovery (paid feature)
├── [x] Show motivational message on return
└── [x] Compare with previous streak length
```

### 4.3 User Actions

```
UA-4.1: View Streak
├── User opens app
│   └── System checks streak status
│   ├── Calculate days since last activity
│   ├── If yesterday had activity: Streak intact
│   ├── If yesterday no activity: Check freeze
│   │   ├── If freeze available: Apply freeze, streak intact
│   │   └── If no freeze: Streak broken
│   └── Update UI accordingly
├── User sees streak in header
│   └── If streak > 0: Fire emoji + number
│   └── If streak = 0: Gray "0"
└── User taps streak badge
    └── System shows streak detail modal
    └── Shows: Current, Longest, Calendar, Freeze

UA-4.2: Complete Lesson (Streak Update)
├── User completes a lesson
│   └── System checks if today already counted
│   ├── If today already active: No change
│   └── If today first activity:
│       ├── If streak == 0: Start new streak (1)
│       ├── If last activity was yesterday: Increment (+1)
│       └── If last activity was > 1 day ago: Reset to 1
├── System updates database
│   ├── current_streak = new_value
│   ├── longest_streak = max(longest, current)
│   ├── last_lesson_date = now
│   └── updated_at = now
├── System checks milestone
│   └── If milestone reached: Trigger celebration
└── System updates header streak display
    └── Animate number increment

UA-4.3: Streak At Risk
├── Time reaches 9pm, user has 0 lessons today
│   └── System sends push notification
│   └── "🔥 Streak 5 ngày! Còn 2 giờ để giữ streak!"
├── User has 1+ freeze available
│   └── System shows: "Streak sẽ được bảo vệ tự động"
├── User has 0 freezes
│   └── System shows: "Hết freeze! Hoàn thành 1 bài để giữ streak"
└── User ignores notification
    └── At midnight: Streak broken OR freeze applied

UA-4.4: Streak Break
├── Midnight passes, yesterday no activity, no freeze
│   └── System sets current_streak = 0
│   └── System logs streak_break event
│   └── System sends notification next morning
│   └── "😢 Streak đã reset về 0. Bắt đầu lại hôm nay nhé!"
├── User returns to app
│   └── System shows streak broken modal
│   └── Message: "Chuỗi của bạn đã kết thúc. Bắt đầu mới!"
│   └── CTA: "Bắt đầu streak mới"
└── User taps CTA
    └── System starts new streak from 1

UA-4.5: Use Streak Freeze
├── User opens streak detail
│   └── System shows freeze count: "1 freeze tuần này"
├── User taps "Sử dụng freeze"
│   └── System activates freeze for today
│   └── System decrements freeze count
│   └── System shows "❄️ Streak đang được bảo vệ"
├── Freeze auto-applied at midnight
│   └── System sets freeze_used_today = true
│   └── Streak continues to next day
└── Freeze count resets Monday midnight
    └── System resets freeze_count = 1

UA-4.6: View Streak Calendar
├── User taps calendar tab in streak modal
│   └── System fetches 90 days of activity
│   └── System renders GitHub-style grid
├── User taps on a date
│   └── System shows bottom sheet
│   ├── "Ngày X": Day name, date
│   ├── "✓ 3 bài học": Lessons completed
│   ├── "87% accuracy": Average accuracy
│   └── "32 phút": Time practiced
└── User swipes to see more months
    └── System loads older data
```

### 4.4 System Actions

```
SA-4.1: On App Open (Streak Check)
├── System gets current date (user's timezone)
├── System gets user's last_lesson_date
├── System calculates days difference
│   ├── 0 days: Same day, streak intact
│   ├── 1 day: Yesterday, streak intact
│   └── 2+ days: Streak potentially broken
├── If streak potentially broken:
│   ├── Check if streak_freeze_available_today
│   ├── If freeze available: Apply freeze
│   │   ├── Set freeze_used_today = true
│   │   ├── Decrement freeze_count
│   │   └── Streak continues
│   └── If no freeze: Break streak
│       ├── Set current_streak = 0
│       ├── Log streak_break event
│       └── Queue notification
└── System updates header with correct state

SA-4.2: On Lesson Complete (Streak Update)
├── System gets current date
├── System checks if today already counted
│   └── Query: Is there any lesson completed today?
├── If today already counted:
│   └── No streak change needed
├── If today first lesson:
│   ├── Get last_lesson_date
│   ├── Calculate days since last
│   ├── If streak == 0: current_streak = 1
│   ├── If days_since_last == 1: current_streak += 1
│   ├── If days_since_last > 1: current_streak = 1 (reset)
│   ├── Update longest_streak = max(longest, current)
│   ├── Set last_lesson_date = today
│   └── Trigger UI update
├── System checks milestone
│   └── If milestone reached: Trigger celebration
└── System checks freeze usage
    └── If freeze used today: Decrement freeze count

SA-4.3: Streak Freeze Logic (Nightly Job)
├── Cron job runs at 00:05 (5 minutes after midnight)
├── For each user:
│   ├── Check if last_lesson_date < today
│   ├── Check if freeze_available_today
│   ├── If both true: Apply freeze
│   │   ├── Set freeze_used_today = true
│   │   └── Decrement freeze_count
│   └── If last_lesson_date < yesterday AND no freeze:
│       └── Break streak (set to 0)
└── Reset freeze count for new week (Monday)

SA-4.4: Streak Freeze Weekly Reset
├── Cron job runs Monday 00:01
├── For each user:
│   └── Reset streak_freeze_count = 1
├── System ensures only 1 freeze per week
└── Grace period: Users who never used freeze get 1

SA-4.5: Streak Milestone Detection
├── System detects current_streak value changes
├── System checks against milestone thresholds
│   ├── Thresholds: 7, 14, 30, 60, 100, 365
├── If milestone reached:
│   ├── Trigger celebration animation
│   ├── Award XP bonus
│   ├── Unlock badge (if applicable)
│   ├── Send notification
│   └── Log milestone_reached event
└── System updates badge display

SA-4.6: On Streak Break
├── System sets current_streak = 0
├── System clears freeze_used_today flag
├── System logs event:
│   ├── user_id, previous_streak, date, reason
│   └── For analytics: Why did they break?
├── System queues notification (send at 9am)
│   └── Message: "Streak đã kết thúc. Bắt đầu lại hôm nay!"
├── System updates leaderboard
│   └── User removed from active streak leaderboard
└── System updates dashboard display

SA-4.7: Generate Streak Data for Calendar
├── System receives date range (last 90 days)
├── System queries daily_activity
│   └── WHERE user_id = ? AND date BETWEEN ? AND ?
├── System maps data to calendar format
│   ├── date, lessons_completed, accuracy, time_spent
│   ├── freeze_protected (boolean)
│   └── streak_day (boolean)
├── System returns calendar grid data
└── System handles missing dates (show as gray)
```

### 4.5 Validation Rules

```
VR-4.1: Streak Data
├── current_streak: 0 to 9999 (integer)
├── longest_streak: 0 to 9999 (integer, never < current_streak)
├── last_lesson_date: Valid date, not future
├── streak_start_date: Valid date, <= last_lesson_date
└── streak_freeze_count: 0 to 1 per week

VR-4.2: Streak Calculation
├── Streak increments only once per calendar day
├── Streak increments only on lesson completion (not clip)
├── Streak freeze prevents reset but doesn't extend
├── Broken streak starts from 0 (no carry-over)
└── Timezone: Based on user's device timezone

VR-4.3: Freeze Rules
├── Maximum 1 freeze per week
├── Freeze resets Monday midnight (user's timezone)
├── Freeze can only be used for current day
├── Freeze cannot be used retroactively
└── Freeze applied automatically at midnight if user hasn't practiced

VR-4.4: Milestone Thresholds
├── 7 days: 1 week
├── 14 days: 2 weeks
├── 30 days: 1 month
├── 60 days: 2 months
├── 100 days: 100 days
└── 365 days: 1 year
```

### 4.6 Scoring Logic

```
SL-4.1: Streak Day Determination

Logic:
  is_streak_day = (
    lesson_completed_today AND
    (last_lesson_date == today OR last_lesson_date == yesterday)
  )

Case Analysis:
  User completes lesson today:
    last_lesson_date = today
    current_streak += 1 (if yesterday had activity)
    OR current_streak = 1 (if first day)
  
  User completes lesson tomorrow (gap of 1 day):
    last_lesson_date = yesterday
    current_streak NOT incremented (already counted)
  
  User completes lesson day after tomorrow (gap of 2 days):
    last_lesson_date = 2 days ago
    Streak = 0 (broken, unless freeze)
  
  User has freeze available on gap day:
    Freeze applied automatically
    Streak continues

SL-4.2: Streak XP Bonuses

Milestone XP rewards:
  7 days: +30 XP
  14 days: +50 XP
  30 days: +100 XP
  60 days: +200 XP
  100 days: +500 XP
  365 days: +1000 XP

Total streak XP (example for 30-day user):
  = 7*5 + 14*5 + 30*5 (daily) + milestones
  = 35 + 70 + 150 + 100 (milestones)
  = 355 XP from streak alone

SL-4.3: Streak Freeze Cost/Benefit
  Freeze cost: 0 (free feature)
  Freeze benefit: Preserve streak value X
  Breakeven: Streak >= 1 day
  Value: For a user with 30-day streak, freeze = 30 "saved" days of effort
```

### 4.7 Error Handling

```
EH-4.1: Streak Calculation Race Condition
├── User completes 2 lessons simultaneously
├── System: Use database transaction with row lock
├── Ensure streak only increments once per day
└── Result: Only one increment recorded

EH-4.2: Timezone Edge Case (Midnight)
├── User starts lesson at 11:58pm, finishes at 12:05am
├── System: Use date from lesson completion time
├── System: Correctly attributes to "tomorrow"
└── UX: User sees streak increment next day

EH-4.3: Freeze Counter Desync
├── User uses freeze, but counter doesn't update
├── System: Verify freeze count on every request
├── System: Re-sync if mismatch detected
└── Fallback: Always check database as source of truth

EH-4.4: Milestone Celebration Fails
├── Animation library fails to load
├── System: Fallback to static badge unlock
├── System: Show milestone text without animation
└── UX: User still sees milestone achieved

EH-4.5: Streak Data Corruption
├── current_streak > longest_streak (impossible state)
├── System: Nightly job corrects inconsistencies
├── System: Log error for investigation
└── User: Sees corrected value on next load

EH-4.6: Notification Permission Denied
├── User blocks notification permission
├── System: Streak still functions normally
├── System: Show in-app notification instead
└── UX: "Bật thông báo để nhận nhắc nhở streak"

EH-4.7: Offline Streak Check
├── User opens app while offline
├── System: Use cached streak value
├── System: Cannot check today's activity
├── On reconnect: System re-syncs and updates
└── UX: Show "Đồng bộ..." indicator
```

### 4.8 Edge Cases

```
EC-4.1: User Completes Lesson Exactly at Midnight
├── Completion timestamp: 2026-06-08 00:00:00
├── System date check: 2026-06-08
├── last_lesson_date update: 2026-06-08
├── Streak: Increments correctly
└── Calendar: Shows as "today" activity

EC-4.2: User Travels Across Timezones
├── User lives in Vietnam (UTC+7)
├── User travels to Japan (UTC+9)
├── User completes lesson at 11pm JST (4pm UTC)
├── System: Stores in UTC, displays in local
├── Streak: Based on local calendar day
└── Result: Streak counts correctly

EC-4.3: Long Streak User (365+ Days)
├── System: Cap display at 365, continue counting internally
├── Badge: Special "1 Year" badge unlocked
├── Recognition: Featured in leaderboard
└── Mitigation: Prevent streak fatigue with variety

EC-4.4: Freeze on First Day (New User)
├── New user signs up
├── User has 0 streak
├── User can still use freeze
├── System: Freeze doesn't extend a streak that doesn't exist
└── UX: "Sử dụng freeze để bắt đầu streak!"

EC-4.5: Freeze But Already Practiced Today
├── User completed lesson earlier today
├── User tries to use freeze
├── System: "Bạn đã học hôm nay rồi! Freeze không cần thiết."
└── Prevention: Freeze button disabled

EC-4.6: Streak Break Then Immediate Practice
├── Streak broken at midnight
├── User opens app next morning, practices
├── System: New streak starts from 1
├── Message: "Bắt đầu streak mới!"
└── UX: Streak shows "1", not previous value

EC-4.7: Multiple Devices, Streak Desync
├── User practices on Phone (streak = 5)
├── User practices on Desktop (streak = 5)
├── System: Both sessions count for same user
├── Streak: Still 5 (not doubled)
└── Prevention: Same user_id, same streak value

EC-4.8: Freeze Last Day of Week
├── Friday 11pm, user hasn't practiced
├── User uses freeze
├── Monday midnight: Week resets
├── User hasn't practiced in 3 days
├── System: Streak still breaks (freeze only covered Friday)
└── UX: "Streak kết thúc. Freeze chỉ bảo vệ 1 ngày."

EC-4.9: Leap Year / Daylight Saving
├── Feb 29 in leap year
├── System: Handles date correctly
├── DST transition (spring forward)
├── System: Use UTC internally, display in local
└── Result: No streak calculation issues

EC-4.10: User Deletes Account
├── Account deletion requested
├── System: Anonymize user data (keep stats for analytics)
├── Streak: No longer displayed
├── Data: Aggregated into platform stats
└── GDPR: Full data deletion within 30 days
```

### 4.9 Acceptance Criteria

```
AC-4.1: Streak Tracking
□ [ ] Streak increments on first lesson of the day
□ [ ] Streak does NOT increment on subsequent lessons same day
□ [ ] Streak resets to 0 after 1+ day gap (no freeze)
□ [ ] Streak preserved with freeze after 1 day gap
□ [ ] Streak resets to 0 after 2+ day gap (even with freeze)
□ [ ] longest_streak never less than current_streak
□ [ ] last_lesson_date updates correctly

AC-4.2: Streak Display
□ [ ] Fire emoji visible when streak > 0
□ [ ] Number displays current streak value
□ [ ] Streak in header visible on all pages
□ [ ] Dashboard shows streak prominently
□ [ ] Streak detail modal accessible on tap
□ [ ] Streak calendar shows last 90 days
□ [ ] Color coding: green (active), gray (none), blue (freeze)

AC-4.3: Streak Milestones
□ [ ] 7-day milestone triggers celebration
□ [ ] 30-day milestone triggers celebration
□ [ ] 100-day milestone triggers celebration
□ [ ] XP bonus awarded at milestones
□ [ ] Badge unlocked and visible
□ [ ] Notification sent for milestones

AC-4.4: Streak Freeze
□ [ ] Freeze count shows 1 per week
□ [ ] Freeze resets Monday midnight
□ [ ] Auto-apply at midnight if no activity
□ [ ] Manual activation works
□ [ ] Freeze count decrements correctly
□ [ ] Snowflake indicator on protected days
□ [ ] Freeze button disabled when already practiced

AC-4.5: Notifications
□ [ ] "At risk" notification at 9pm if no activity
□ [ ] Streak broken notification next morning
□ [ ] Milestone achievement notification
□ [ ] Comeback notification after 3 days inactive
□ [ ] User can disable all streak notifications

AC-4.6: Edge Cases
□ [ ] Midnight completion counted correctly
□ [ ] Timezone change handled correctly
□ [ ] Multiple lessons same day = 1 streak increment
□ [ ] Freeze on first day = valid (though useless)
□ [ ] Streak break + immediate practice = new streak from 1

AC-4.7: Performance
□ [ ] Streak check < 100ms on app open
□ [ ] Streak update < 200ms on lesson complete
□ [ ] Calendar loads within 1 second
□ [ ] No UI freeze during streak operations
```

---

## FEATURE 5: HISTORY

### 5.1 Business Goal

```
PRIMARY GOAL:
Cho phép user xem lại tất cả bài học đã hoàn thành,
kết quả chi tiết, và tiến độ theo thời gian.

SECONDARY GOALS:
├── Support self-directed learning (review mistakes)
├── Provide evidence of learning (for user, not certificates)
├── Enable progress reflection
├── Build trust (data is saved and accessible)
├── Drive re-engagement (see past lessons, want to retry)
└── Foundation for spaced repetition (what to review)

BUSINESS CONTEXT:
├── History = proof of learning (without certificate)
├── Users want to see their journey
├── Reviewing mistakes = better retention
├── History page = second most visited after dashboard
└── Data enables future features (spaced repetition)

SUCCESS METRICS:
├── History page visits: > 30% of active users/month
├── Lesson re-attempt rate: > 15% of history viewers
├── Average history depth: Users view last 14 days average
├── Retention: Users who view history → Higher overall retention
└── Search: Users search history for specific topics/lessons
```

### 5.2 Functional Requirements

```
FR-5.1: Lesson History List
├── [x] Display all completed lessons (chronological, newest first)
├── [x] Show lesson name, topic, date completed
├── [x] Show accuracy score per lesson
├── [x] Show pronunciation score per lesson (if speaking done)
├── [x] Show time spent on lesson
├── [x] Show XP earned
├── [x] Paginate or infinite scroll (20 items per page)
├── [x] Pull-to-refresh on mobile
└── [x] Filter by topic, date range

FR-5.2: Lesson History Detail
├── [x] View all clips in completed lesson
├── [x] View transcript submitted per clip
├── [x] View expected transcript per clip
├── [x] View accuracy per clip
├── [x] View pronunciation score per clip (if speaking)
├── [x] View recording playback per clip
├── [x] Re-attempt specific clip
├── [x] Re-attempt entire lesson
└── [x] Compare current vs past performance

FR-5.3: Daily Activity Log
├── [x] Calendar view (similar to progress dashboard)
├── [x] Show activity intensity per day
├── [x] Tap date to see day's full activity
├── [x] Day detail: lessons, topics, time, scores
├── [x] Navigate months
└── [x] Filter by activity type

FR-5.4: Search & Filter
├── [x] Search history by lesson name
├── [x] Filter by topic
├── [x] Filter by date range
├── [x] Filter by accuracy range (e.g., > 80%)
├── [x] Sort by: Date (newest/oldest), Score, Topic
└── [x] Clear all filters

FR-5.5: Mistake Review
├── [x] Highlight words user got wrong
├── [x] Show correct answer for wrong words
├── [x] Show AI feedback from that attempt
├── [x] Option to retry specific mistake words
├── [x] Track recurring mistakes
└── [x] Show "Areas to improve" summary

FR-5.6: Re-attempt & Improvement Tracking
├── [x] Allow re-attempt of any completed lesson
├── [x] Track multiple attempts per lesson
├── [x] Show improvement: Attempt 1 vs Attempt 2
├── [x] Highlight which scores improved
├── [x] Show "Personal best" badge
├── [x] Compare across all attempts
└── [x] Average score = best attempt or latest?

FR-5.7: Data Export
├── [x] Export history as JSON (for user backup)
├── [x] Export history as CSV (for spreadsheet)
├── [x] Date range selection for export
├── [x] Include/exclude options
└── [x] Download triggers (not email)
```

### 5.3 User Actions

```
UA-5.1: View History List
├── User navigates to /history
│   └── System fetches first page (20 lessons)
│   └── System shows skeleton loading state
│   └── System renders list after data arrives
├── User scrolls down
│   └── System loads next page (infinite scroll)
│   └── System shows loading spinner
│   └── System appends new items
├── User pulls down (mobile)
│   └── System refreshes data
│   └── System shows "Đã làm mới" toast
└── User reaches end
    └── System shows "Đã hiển thị tất cả"

UA-5.2: Search History
├── User taps search bar
│   └── System shows keyboard
│   └── System focuses search input
├── User types lesson name
│   └── System filters in real-time (debounce 300ms)
│   └── System shows matching results
├── User clears search
│   └── System returns to full list
└── User taps cancel
    └── System closes search, returns to list

UA-5.3: Filter History
├── User taps filter icon
│   └── System shows filter bottom sheet (mobile) / dropdown (desktop)
├── User selects topic filter
│   └── System filters list to that topic
├── User selects date range
│   └── System filters to date range
├── User selects accuracy filter
│   └── System filters to accuracy >= selected
├── User taps "Apply"
│   └── System closes sheet
│   └── System shows filtered results
│   └── System shows active filter count
└── User taps "Clear all"
    └── System resets all filters

UA-5.4: View Lesson Detail
├── User taps lesson row in history
│   └── System fetches lesson detail
│   └── System navigates to detail page
├── User views clip-by-clip breakdown
│   └── System shows: Expected, Your answer, Accuracy
├── User taps clip row
│   └── System expands clip detail
│   ├── Transcript comparison
│   ├── Word-level highlighting
│   ├── Recording playback (if available)
│   └── AI feedback
└── User taps "Học lại bài này"
    └── System navigates to lesson player
    └── System marks as "re-attempt"

UA-5.5: Play Recording
├── User taps play icon on clip with recording
│   └── System loads recording from storage
│   └── System plays audio
├── User pauses
│   └── System pauses audio
├── User seeks
│   └── System seeks to position
└── User taps waveform
    └── System seeks to tapped position

UA-5.6: Compare Attempts
├── User views lesson with multiple attempts
│   └── System shows attempt tabs/selector
│   ├── Attempt 1: 75% (2026-06-01)
│   ├── Attempt 2: 82% (2026-06-03)
│   └── Attempt 3: 88% (2026-06-05)
├── User selects attempt
│   └── System shows that attempt's data
├── User views improvement over time
│   └── System shows trend line chart
└── User taps "Practice again"
    └── System navigates to lesson

UA-5.7: Export History
├── User taps "Xuất dữ liệu"
│   └── System shows export options modal
├── User selects format (JSON/CSV)
├── User selects date range
├── User toggles include options
│   ├── Include recordings (warning: large file)
│   ├── Include AI feedback
│   └── Include clip details
├── User taps "Xuất"
│   └── System generates file
│   └── System triggers download
└── User receives file
    └── System shows "Đã xuất thành công" toast
```

### 5.4 System Actions

```
SA-5.1: On History List Load
├── System validates authentication
├── System fetches user_progress with pagination
│   └── SELECT * FROM user_progress
│   └── WHERE user_id = ?
│   └── ORDER BY completed_at DESC
│   └── LIMIT 20 OFFSET 0
├── System fetches topic names (join)
├── System fetches daily_activity for calendar
├── System calculates pagination metadata
│   ├── Total count
│   ├── Has next page
│   └── Current page
├── System renders list
└── System enables infinite scroll

SA-5.2: On Infinite Scroll
├── User scrolls to bottom of list
│   └── System checks if has_next_page
├── If has more:
│   └── System fetches next page
│   └── System appends to list
│   └── System updates pagination
└── If no more:
    └── System shows end of list indicator

SA-5.3: On Filter Applied
├── System receives filter parameters
│   ├── topic_id, date_from, date_to, accuracy_min, search
├── System builds dynamic query
│   └── WHERE user_id = ?
│   └── AND topic_id = ? (if set)
│   └── AND completed_at BETWEEN ? AND ? (if set)
│   └── AND accuracy >= ? (if set)
│   └── AND lesson_name ILIKE ?% (if search)
├── System executes query
├── System returns filtered results
└── System updates UI with results

SA-5.4: On Lesson Detail Load
├── System fetches lesson metadata
│   └── Name, topic, total clips, duration
├── System fetches clip progress
│   └── All user_clip_progress for this lesson
│   └── Includes recording_url, transcribed_text
├── System fetches transcript comparison data
│   └── Expected vs submitted per clip
├── System calculates lesson stats
│   ├── Average accuracy
│   ├── Total time
│   ├── Total XP
│   └── Attempt count
└── System renders detail view

SA-5.5: On Re-attempt
├── User taps "Học lại"
│   └── System navigates to /listen/[lesson-id]
│   └── System marks lesson as re-attempt
├── System creates new attempt record
│   └── user_id, lesson_id, attempt_number
│   └── Previous attempts still preserved
├── User completes lesson
│   └── System saves new attempt
│   └── System updates "attempts" count
└── System updates history list
    └── Shows latest attempt + previous scores

SA-5.6: On Recording Playback
├── System gets recording_url from clip_progress
├── System checks if URL is valid
│   ├── If valid: Stream from Supabase Storage
│   └── If not: Show "Recording không còn khả dụng"
├── System plays audio
└── System tracks playback event for analytics

SA-5.7: On Export
├── System receives export parameters
├── System queries all matching records
│   └── Include requested fields
│   └── Include recordings as base64 or links only
├── System formats data
│   ├── JSON: Full nested structure
│   └── CSV: Flattened, one row per lesson
├── System generates file
│   ├── JSON: Pretty-printed
│   └── CSV: UTF-8 BOM for Excel compatibility
├── System returns file for download
└── System logs export event
```

### 5.5 Validation Rules

```
VR-5.1: History Data Access
├── User can only access own history
├── Enforce via user_id = authenticated_user_id
├── No SQL injection possible (parameterized queries)
└── No cross-user data leakage

VR-5.2: Pagination
├── Page size: 20 items
├── Maximum offset: 10,000 (cap for performance)
├── Empty page: Show end of list message
└── Invalid page: Return first page

VR-5.3: Filter Parameters
├── topic_id: Must exist in topics table
├── date_from: Must be valid date, <= date_to
├── date_to: Must be valid date, >= date_from
├── accuracy_min: Must be 0-100
└── search: Sanitize for SQL LIKE

VR-5.4: Export Limits
├── Maximum date range: 1 year
├── Maximum records: 10,000
├── Recording inclusion: Optional (warn if > 100MB)
└── Export format validation

VR-5.5: Recording Playback
├── URL must be valid Supabase Storage URL
├── Recording must exist (not deleted)
├── User must own the recording
└── Storage URL must not be expired
```

### 5.6 Scoring Logic

```
SL-5.1: Lesson History Score Display

Display priority:
  1. Best attempt score (if multiple)
  2. Latest attempt score (if single)
  3. Average of all attempts

Icons:
  🎯 Best: Gold star if current is best
  📈 Improved: Green arrow if latest > previous
  📉 Declined: Red arrow if latest < previous
  🔄 Retried: Number badge showing attempt count

Example display:
  "78% 🎯" = 78% is the best score
  "82% 📈 (từ 75%)" = Improved from 75%
  "3 lần thử" = Completed 3 times

SL-5.2: History Summary Stats

For filtered history:
  Total lessons: Count of records
  Average accuracy: Sum(accuracy) / Count
  Total time: Sum(duration)
  Total XP: Sum(xp_earned)
  Topics covered: Count(DISTINCT topic_id)
  Improvement rate: Count(score increased) / Count(multi-attempt lessons)
```

### 5.7 Error Handling

```
EH-5.1: History List Load Fails
├── Detection: API returns error
├── User Message: "Không thể tải lịch sử. Vui lòng thử lại."
├── Action: Show retry button
├── Fallback: Show cached history if available
└── Log: Sentry event

EH-5.2: Empty History (New User)
├── Detection: No records in user_progress
├── User Message: "Bạn chưa hoàn thành bài học nào."
├── Content: "Hoàn thành bài đầu tiên để xem lịch sử tại đây."
├── CTA: "Chọn topic để học"
└── Illustration: Book with clock icon

EH-5.3: Recording No Longer Available
├── Detection: Storage URL returns 404
├── User Message: "Recording không còn khả dụng."
├── UI: Hide play button, show gray icon
└── Fallback: Show transcript only (no playback)

EH-5.4: Filter Returns No Results
├── Detection: Query returns empty
├── User Message: "Không tìm thấy kết quả phù hợp."
├── Suggestion: "Thử thay đổi bộ lọc hoặc từ khóa."
├── Action: "Xóa bộ lọc" button
└── Keep filters visible for adjustment

EH-5.5: Export Fails
├── Detection: Export process throws error
├── User Message: "Xuất dữ liệu thất bại. Vui lòng thử lại."
├── Action: Retry button
├── If size issue: "File quá lớn. Thử giảm phạm vi ngày."
└── Log: Sentry with export parameters

EH-5.6: Recording Playback Fails
├── Detection: Audio element onerror
├── User Message: "Không thể phát recording."
├── Action: Retry button
├── Fallback: Show transcript text only
└── Log: Track failure for storage health monitoring

EH-5.7: Pagination Error
├── Detection: Page fetch returns error
├── User Message: "Không thể tải thêm. Vuốt lên để làm mới."
├── Action: Pull-to-refresh
└── Fallback: Restart from page 1
```

### 5.8 Edge Cases

```
EC-5.1: Very Long History (1000+ Lessons)
├── System: Use pagination (20 per page)
├── System: Lazy load older pages
├── System: Limit search to last 1000 records
└── UX: "Bạn đã hoàn thành hơn 1000 bài học!"

EC-5.2: Same Lesson Multiple Times
├── System: Show all attempts in history
├── System: Aggregate stats (best, latest, average)
├── System: Show attempt count badge
└── UX: "Bài này bạn đã học 3 lần"

EC-5.3: Missing Recording (User Deleted)
├── User deleted recording from device
├── Recording still exists in Supabase Storage
├── User can still view transcript history
├── User cannot listen to old recording
└── UI: Gray play icon with tooltip

EC-5.4: Partial Lesson (User Quit Mid-lesson)
├── User started but didn't complete
├── System: Does NOT save to history
├── System: Does NOT update progress
├── User returns: Must start from beginning
└── UX: "Bài học chưa hoàn thành. Bắt đầu lại?"

EC-5.5: History Search with Special Characters
├── User searches: "What's the..."
├── System: Escape special characters in SQL
├── System: Handle quotes, apostrophes
└── Result: Correctly finds "What's the..."

EC-5.6: Very Old History (2+ Years)
├── User has data from 2024
├── System: All historical data preserved
├── System: Date filter allows full range
├── System: Calendar shows older months
└── Performance: Use indexed queries on date

EC-5.7: Concurrent Session Updates
├── User practices on Phone
├── User views history on Desktop simultaneously
├── System: Real-time would need WebSocket (Phase 2)
├── Current: Desktop shows last known state
├── Refresh: User pulls to refresh
└── UX: "Kéo xuống để làm mới"

EC-5.8: Data Export Large File
├── User exports 2 years of history with recordings
├── File size: ~500MB
├── System: Warn user about size
├── System: Stream download (not memory-intensive)
├── Timeout: Allow up to 60 seconds
└── Fallback: Export without recordings

EC-5.9: Lesson Renamed/Deleted After Completion
├── User completed "Morning Routine"
├── Admin renames to "My Morning Routine"
├── History still shows "Morning Routine"
├── System: Snapshot lesson name at completion time
└── Detail page: Show current name + "(đã đổi tên)"

EC-5.10: Accuracy Calculation Changed
├── Algorithm updated (e.g., improved comparison)
├── Past lessons already scored
├── System: Do NOT recalculate past scores
├── System: New algorithm only for new submissions
└── UX: Consistent comparison within same lesson
```

### 5.9 Acceptance Criteria

```
AC-5.1: History List
□ [ ] Shows all completed lessons
□ [ ] Newest first by default
□ [ ] Lesson name, topic, date visible
□ [ ] Accuracy score visible
□ [ ] Infinite scroll loads more
□ [ ] Pull-to-refresh works on mobile
□ [ ] Empty state for new users
□ [ ] Loading skeleton shown

AC-5.2: Search & Filter
□ [ ] Real-time search (debounced)
□ [ ] Filter by topic works
□ [ ] Filter by date range works
□ [ ] Filter by accuracy works
□ [ ] Multiple filters combine correctly
□ [ ] Clear all resets to full list
□ [ ] "No results" state handled

AC-5.3: Lesson Detail
□ [ ] All clips listed
□ [ ] Expected vs submitted shown per clip
□ [ ] Word-level highlighting accurate
□ [ ] Recording playback works
□ [ ] Re-attempt button navigates correctly
□ [ ] Multiple attempts tracked

AC-5.4: Comparison View
□ [ ] Multiple attempts shown chronologically
□ [ ] Improvement/decline visible
□ [ ] Best score highlighted
□ [ ] Trend chart accurate
□ [ ] Attempt tabs/selector works

AC-5.5: Recording Playback
□ [ ] Plays from Supabase Storage
□ [ ] Seek functionality works
□ [ ] Handles missing recording gracefully
□ [ ] Loading state shown
□ [ ] Error state handled

AC-5.6: Export
□ [ ] JSON export valid
□ [ ] CSV export valid and Excel-compatible
□ [ ] Date range selection works
□ [ ] File size warning for large exports
□ [ ] Download triggers correctly

AC-5.7: Performance
□ [ ] Initial load < 2 seconds
□ [ ] Infinite scroll smooth
□ [ ] Search results < 500ms
□ [ ] No memory leak on long sessions
□ [ ] Pagination efficient (no N+1 queries)

AC-5.8: Accessibility
□ [ ] Screen reader reads history items
□ [ ] Filter controls keyboard accessible
□ [ ] Recording playback keyboard controllable
□ [ ] Focus management on modal open/close
□ [ ] Color contrast meets AA standards
```

---

## APPENDIX: CROSS-FEATURE INTEGRATION

### Shared Components

```
NAVIGATION FLOW:
  Home → Topics → Lesson → Listening → Speaking → Results
                          ↓
                      Dashboard ← History ← Progress
                          ↓
                        Streak

DATA FLOW:
  user_progress ──→ Dashboard
        │              ↓
        ├──→ History ←─┘
        │              ↓
        ├──→ Progress ──┘
        │              ↓
        └──→ Streak ───┘
```

### Shared Error Handling Strategy

```
ERROR HANDLING PRINCIPLES:
1. Graceful degradation: Feature continues even if sub-feature fails
2. User-friendly messages: No technical jargon
3. Retry mechanisms: Auto-retry once, then manual
4. Offline support: Queue for later when possible
5. Logging: All errors to Sentry with context
6. Monitoring: Dashboard alerts for error rate spikes
```

### Shared Validation Patterns

```
AUTH VALIDATION:
  Every API call checks authentication first
  Return 401 if not authenticated
  Return 403 if accessing other user's data

INPUT VALIDATION:
  Server-side: Validate all inputs
  Client-side: UX validation for speed
  Sanitize: Prevent injection attacks

DATA INTEGRITY:
  Use transactions for multi-table updates
  Optimistic locking for concurrent edits
  Soft deletes where appropriate
```

---

*Document End — VinaListen Feature Specification v1.0*
