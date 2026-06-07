# VinaListen — UX Specification Document
## Landing Page · Listening Module · Speaking Module

**Date:** 2026-06-07  
**Version:** 1.0  
**Based on:** PRD VinaListen v1.0 (Reviewed) + Implementation Plan  
**Framework:** Mobile First · Duolingo-inspired · Vietnamese market

---

## MỤC LỤC

```
1. Design System & Principles
2. Landing Page
3. Listening Module
4. Speaking Module
5. Global Components
6. Error & Empty States
```

---

## PHẦN 1: DESIGN SYSTEM & PRINCIPLES

### 1.1 Design Language

```
BRAND PERSONALITY:
├── Modern nhưng thân thiện
├── Premium nhưng không xa cách
├── Dễ học như Duolingo
├── Chuyên nghiệp như Apple
└── Tập trung như Linear

COLOR PALETTE:

Primary:
├── --primary: #35375B (Deep Indigo)
├── --accent: #FF5632 (Vibrant Orange)
├── --dark: #2B2727 (Near Black)
└── --light: #EFEFEF (Off White)

Secondary:
├── --success: #00BE7C (Emerald Green)
├── --error: #FF3257 (Coral Red)
├── --brown: #B15224 (Warm Brown)
├── --cream: #F0E7DF (Soft Cream)
└── --warning: #FFAB00 (Amber)

Accent Colors:
├── --streak-fire: #FF6B35
├── --xp-gold: #FFD700
├── --streak-purple: #8B5CF6
└── --lesson-blue: #3B82F6

Neutral:
├── --text-primary: #1F2937
├── --text-secondary: #6B7280
├── --text-muted: #9CA3AF
├── --border: #E5E7EB
├── --bg-primary: #FFFFFF
├── --bg-secondary: #F9FAFB
├── --bg-card: #FFFFFF
└── --bg-dark: #111827

TYPOGRAPHY:

Font Family:
├── Primary: Nimbus Sans
├── Fallback: Inter, system-ui, sans-serif
└── Monospace: JetBrains Mono (for transcripts)

Scale (Mobile → Desktop):
├── Display: 32px / 40px / 48px
├── H1: 28px / 36px / 44px
├── H2: 24px / 28px / 36px
├── H3: 20px / 22px / 26px
├── Body: 16px (both)
├── Small: 14px (both)
├── Caption: 12px (both)
└── Micro: 10px (both)

SPACING (8px base):
├── 0: 0px
├── 1: 4px
├── 2: 8px
├── 3: 12px
├── 4: 16px
├── 5: 20px
├── 6: 24px
├── 8: 32px
├── 10: 40px
├── 12: 48px
├── 16: 64px
├── 20: 80px
└── 24: 96px

RADIUS:
├── sm: 6px
├── md: 12px
├── lg: 16px
├── xl: 24px
└── full: 9999px

SHADOW:
├── sm: 0 1px 2px rgba(0,0,0,0.05)
├── md: 0 4px 6px rgba(0,0,0,0.07)
├── lg: 0 10px 15px rgba(0,0,0,0.1)
└── xl: 0 20px 25px rgba(0,0,0,0.15)
```

### 1.2 Design Principles

```
PRINCIPLE 1: Mobile First
├── Thiết kế từ mobile trước, scale lên desktop
├── Breakpoints: 320px → 768px → 1024px → 1280px
├── Touch targets: tối thiểu 44×44px
├── Content width: tối đa 1200px
└── Không horizontal scroll ở bất kỳ breakpoint nào

PRINCIPLE 2: One Action Per Screen
├── Mỗi màn hình có MỘT mục tiêu rõ ràng
├── Không confuse user với quá nhiều lựa chọn
├── CTA chính nổi bật, CTA phụ secondary
└── Progressive disclosure: hiện thông tin khi cần

PRINCIPLE 3: Instant Feedback
├── Mọi interaction phải có visual feedback
├── Loading states rõ ràng
├── Success/error messages cụ thể
├── Animations nhẹ nhàng (800-1200ms)
└── Không bao giờ để user đoán app đang làm gì

PRINCIPLE 4: Forgiveness
├── Undo available cho mọi action
├── Confirmation dialogs cho destructive actions
├── Auto-save liên tục
├── Graceful degradation khi offline
└── Error messages hữu ích, không đổ lỗi user

PRINCIPLE 5: Delight Without Distraction
├── Animations phục vụ UX, không phải decoration
├── Confetti nhẹ khi celebrate thành tích
├── Sound effects tắt mặc định
├── Không clutter UI với quá nhiều badges/icons
└── White space là feature, không phải waste
```

### 1.3 Responsive Strategy

```
BREAKPOINT MATRIX:

                Mobile    Tablet    Desktop
                320-767   768-1023  1024+
─────────────────────────────────────────
Layout         Single    Split     Three-col
Nav             Bottom    Side      Top
Cards           1 col     2 col     3-4 col
Player          Full      Centered  Centered
CTA             Full-btn  Auto      Auto
Font size       Scale     Scale+2   Scale+4
Spacing         1x        1.25x     1.5x
```

---

## PHẦN 2: LANDING PAGE

### 2.1 Overview

```
PURPOSE: Convert visitor → registered user
PRIMARY CTA: "Bắt đầu miễn phí"
SECONDARY CTA: "Đăng nhập"

PAGE FLOW:
┌──────────────────────────────────────────────────────────────┐
│  HERO                                                        │
│  ├── Headline: Giá trị proposition                          │
│  ├── Subheadline: Mô tả ngắn gọn                            │
│  ├── CTA: Bắt đầu miễm phí (Primary)                        │
│  ├── Mini demo video (10s)                                   │
│  └── Social proof: Stats ngắn                               │
├──────────────────────────────────────────────────────────────┤
│  HOW IT WORKS (3 steps)                                      │
│  ├── Step 1: Nghe                                           │
│  ├── Step 2: Gõ + Nói                                       │
│  └── Step 3: Tiến bộ                                       │
├──────────────────────────────────────────────────────────────┤
│  FEATURES (4 cards)                                          │
│  ├── 🎧 Audio chất lượng cao                                │
│  ├── ⌨️ Luyện nghe chép chính tả                            │
│  ├── 🎤 Nói và nhận feedback                                 │
│  └── 📈 Theo dõi tiến độ                                    │
├──────────────────────────────────────────────────────────────┤
│  TOPICS PREVIEW                                             │
│  ├── Hiển thị 4-6 topics nổi bật                           │
│  └── [Xem tất cả topics]                                   │
├──────────────────────────────────────────────────────────────┤
│  TESTIMONIALS (2-3 quotes)                                  │
├──────────────────────────────────────────────────────────────┤
│  FAQ (5-6 questions thường gặp)                             │
├──────────────────────────────────────────────────────────────┤
│  FINAL CTA                                                  │
│  ├── Headline: Sẵn sàng bắt đầu?                           │
│  └── CTA: Đăng ký miễn phí ngay                             │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
│  ├── About, Privacy, Terms                                  │
│  └── Social links                                           │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.2 Hero Section

#### Layout

```
MOBILE (320-767px):
┌─────────────────────────┐
│  [Logo]        [Login] │  ← Fixed header
├─────────────────────────┤
│                         │
│    🎧 [Mini Demo GIF]   │  ← 60% height
│                         │
├─────────────────────────┤
│                         │
│  Nghe · Gõ · Nói        │  ← Eyebrow text (accent)
│  Tiến bộ mỗi ngày      │  ← H1 (large, bold)
│                         │
│  Nghe audio tiếng Anh,  │  ← Subheadline (2-3 lines)
│  luyện gõ transcript,  │
│  tập nói với AI.        │
│                         │
│  ┌───────────────────┐  │
│  │ Bắt đầu miễn phí │  │  ← Primary CTA (full-width)
│  └───────────────────┘  │
│                         │
│    Hoặc [Đăng nhập]     │  ← Secondary link
│                         │
├─────────────────────────┤
│  📊 1,000+ bài học     │  ← Social proof
│  👥 5,000+ người học  │
│  ⭐ 4.8/5 rating       │
└─────────────────────────┘

TABLET (768-1023px):
┌───────────────────────────────────────────┐
│  [Logo]           [Login]    [Sign up]   │  ← Header
├──────────────────────┬──────────────────┤
│                      │                   │
│  🎧 [Mini Demo]      │  Nghe · Gõ · Nói │
│                      │  Tiến bộ mỗi ngày │
│  (Left, 50%)         │  (Right, 50%)     │
│                      │                   │
│                      │  Nghe audio...    │
│                      │                   │
│                      │  [Bắt đầu miễn phí]│
│                      │                   │
│                      │  [Đăng nhập]     │
└──────────────────────┴──────────────────┘

DESKTOP (1024px+):
┌─────────────────────────────────────────────────────────────┐
│  [Logo]        Topics  About  [Login]  [Bắt đầu miễn phí]  │  ← Nav
├─────────────────────────────────────────────────────────────┤
│                                                             │
│          ┌──────────────────────────────────┐               │
│          │       🎧 [Mini Demo Video]        │               │
│          │         Loop, 10s, auto-play     │               │
│          └──────────────────────────────────┘               │
│                                                             │
│                   Nghe · Gõ · Nói                           │
│                 Tiến bộ mỗi ngày                            │
│                                                             │
│         Nghe audio tiếng Anh, luyện gõ transcript,           │
│         tập nói với AI feedback. 100% miễn phí.            │
│                                                             │
│              [ Bắt đầu miễn phí ngay ]                     │
│                                                             │
│                 Hoặc [Đăng nhập nếu đã có tài khoản]       │
│                                                             │
│         📊 1,000+ bài    👥 5,000+    ⭐ 4.8/5             │
│              học           người        rating               │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
HERO HEADLINE:
├── Mobile: 32px, semibold, center
├── Desktop: 44px, bold, center
├── Color: --dark (#2B2727)
├── Max width: 600px
└── Line height: 1.2

HERO SUBHEADLINE:
├── Mobile: 16px, regular, center
├── Desktop: 18px, regular, center
├── Color: --text-secondary
├── Max width: 500px
└── Line height: 1.6

PRIMARY CTA BUTTON:
├── Size: Full-width (mobile), auto (desktop)
├── Height: 52px (mobile), 48px (desktop)
├── Background: --accent (#FF5632)
├── Text: White, 16px, semibold
├── Radius: --radius-lg (16px)
├── Shadow: --shadow-md
├── Hover: darken 10%, lift shadow
├── Active: scale(0.98)
├── Loading: spinner + "Đang xử lý..."
└── Min touch target: 44×52px

SOCIAL PROOF STATS:
├── Layout: Horizontal, center
├── Icon + Text per stat
├── Color: --text-secondary
├── Font: 14px, medium
└── Spacing: 24px gap

MINI DEMO:
├── Format: MP4/GIF, loop, muted, autoplay
├── Aspect: 16:9
├── Border radius: --radius-lg
├── Shadow: --shadow-lg
├── Controls: None (autoplay)
├── Mobile: Full-width, 200px height
├── Desktop: Max 600px width, 340px height
└── Fallback: Static image if video fails
```

---

### 2.3 How It Works Section

#### Layout

```
MOBILE:
┌─────────────────────────┐
│    Cách hoạt động      │  ← Section title
├─────────────────────────┤
│                         │
│    [1]                  │
│    🎧                   │
│    Nghe audio           │
│    Chọn bài và nghe    │
│    với tốc độ phù hợp  │
│                         │
├─────────────────────────┤
│    [2]                  │
│    ⌨️                   │
│    Gõ transcript        │
│    Nghe và nhập        │
│    chính xác những     │
│    gì bạn nghe được    │
│                         │
├─────────────────────────┤
│    [3]                  │
│    🎤                   │
│    Tập nói             │
│    Ghi âm và nhận      │
│    AI feedback về       │
│    phát âm của bạn     │
│                         │
└─────────────────────────┘

DESKTOP:
┌───────────────────────────────────────────────────────┐
│                   Cách hoạt động                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│   [1]              [2]              [3]               │
│   🎧               ⌨️               🎤                │
│   Nghe audio       Gõ transcript     Tập nói         │
│                                                       │
│   Chọn bài         Nghe và nhập     Ghi âm và nhận   │
│   và nghe          chính xác        AI feedback      │
│   với tốc độ       những gì         về phát âm      │
│   phù hợp          bạn nghe được    của bạn          │
│                                                       │
│            [ Bắt đầu miễn phí ngay ]                │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### Components

```
STEP NUMBER:
├── Style: Circle with number
├── Size: 32×32px
├── Background: --accent (step active) / --bg-secondary (other)
├── Text: White, 16px, bold
├── Position: Above icon, left-aligned (mobile) / center (desktop)
└── Active: Pulse animation on scroll-into-view

STEP ICON:
├── Size: 48×48px
├── Color: --primary
├── Style: Outline/drawing style
└── Animation: Bounce gently on hover

STEP TITLE:
├── Font: 20px, semibold
├── Color: --dark
├── Text align: Center
└── Margin bottom: 8px

STEP DESCRIPTION:
├── Font: 14px, regular
├── Color: --text-secondary
├── Text align: Center
├── Max width: 250px
└── Line height: 1.5

STEP CARD:
├── Background: --bg-card
├── Padding: 24px
├── Border: 1px solid --border
├── Radius: --radius-lg
├── Gap between steps: 16px (mobile) / 32px (desktop)
└── Hover: Subtle lift (translateY -2px)
```

---

### 2.4 Features Section

#### Layout

```
MOBILE (2-column grid):
┌─────────────────────────────────────┐
│           Tính năng                │  ← Section title
├─────────────────┬───────────────────┤
│ 🎧              │ ⌨️                 │
│ Audio           │ Transcript         │
│ chất lượng cao  │ typing             │
│ MP3 128kbps     │ Real-time          │
│                 │ comparison          │
├─────────────────┼───────────────────┤
│ 🎤              │ 📈                 │
│ Voice           │ Progress           │
│ recording       │ tracking           │
│ AI feedback     │ Streak + stats     │
└─────────────────┴───────────────────┘

TABLET (2-column grid, larger cards):
┌───────────────────────────────────────────────────────┐
│                   Tính năng nổi bật                   │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │ 🎧 Audio chất       │  │ ⌨️ Luyện nghe        │    │
│  │ lượng cao           │  │ chép chính tả       │    │
│  │                     │  │                     │    │
│  │ MP3 128kbps        │  │ So sánh transcript  │    │
│  │ Tốc độ 0.5x-1.5x  │  │ theo từ, đánh dấu   │    │
│  │ Loop không giới hạn │  │ đúng/sai            │    │
│  └─────────────────────┘  └─────────────────────┘    │
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │ 🎤 Voice recording  │  │ 📈 Theo dõi         │    │
│  │                     │  │ tiến độ             │    │
│  │ Ghi âm giọng nói   │  │                     │    │
│  │ AI nhận diện và    │  │ Streak, XP, bài     │    │
│  │ chấm điểm phát âm  │  │ đã học, accuracy    │    │
│  └─────────────────────┘  └─────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘

DESKTOP (4-column grid):
┌───────────────────────────────────────────────────────┐
│                   Tính năng nổi bật                   │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │
│  │ 🎧     │  │ ⌨️     │  │ 🎤     │  │ 📈     │     │
│  │ Audio  │  │ Trans- │  │ Voice  │  │ Progress│     │
│  │        │  │ script │  │        │  │        │     │
│  │ ...    │  │ ...    │  │ ...    │  │ ...    │     │
│  └────────┘  └────────┘  └────────┘  └────────┘     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### Components

```
FEATURE CARD:
├── Background: --bg-card
├── Padding: 24px
├── Border: 1px solid --border
├── Radius: --radius-lg
├── Min height: 200px (desktop)
├── Gap: 16px
└── Hover: Shadow increase, slight scale

FEATURE ICON:
├── Size: 40×40px
├── Background: --cream
├── Radius: --radius-md
├── Icon color: --primary
└── Position: Top-left

FEATURE TITLE:
├── Font: 18px, semibold
├── Color: --dark
├── Margin: 12px 0 8px
└── Text align: Left

FEATURE DESCRIPTION:
├── Font: 14px, regular
├── Color: --text-secondary
├── Line height: 1.5
└── Text align: Left
```

---

### 2.5 Topics Preview Section

#### Layout

```
MOBILE:
┌─────────────────────────┐
│    Topics               │
│    [Xem tất cả →]      │  ← Link to /topics
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🎧 IELTS Listening   │ │  ← Topic card
│ │ 25 bài học          │ │
│ │ ████░░░░░ 30%       │ │  ← Progress bar (if logged in)
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 💼 Business English │ │
│ │ 20 bài học          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 💬 Daily Convo      │ │
│ │ 30 bài học          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ✈️ Travel English   │ │
│ │ 15 bài học          │ │
│ └─────────────────────┘ │
└─────────────────────────┘

DESKTOP:
┌─────────────────────────────────────────────────────────────┐
│  Topics                                    [Xem tất cả →] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 🎧           │ │ 💼            │ │ 💬            │ ┌─────┐│
│  │ IELTS        │ │ Business      │ │ Daily         │ │ ✈️  ││
│  │ Listening    │ │ English       │ │ Conversations│ │Travel││
│  │              │ │               │ │              │ │      ││
│  │ 25 bài       │ │ 20 bài        │ │ 30 bài        │ │15 bài││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
TOPIC CARD:
├── Background: --bg-card
├── Border: 1px solid --border
├── Radius: --radius-lg
├── Padding: 20px
├── Min height: 120px
├── Content: Icon, Name, Lesson count, Progress bar
└── Hover: Lift shadow, border color accent

TOPIC ICON:
├── Size: 48×48px
├── Style: Emoji hoặc SVG
├── Border radius: --radius-md
└── Background: Color tương ứng với topic

TOPIC NAME:
├── Font: 18px, semibold
├── Color: --dark
└── Margin: 8px 0 4px

LESSON COUNT:
├── Font: 13px, regular
├── Color: --text-muted
└── Format: "X bài học"

PROGRESS BAR (logged-in):
├── Height: 6px
├── Background: --bg-secondary
├── Fill: --accent
├── Radius: --radius-full
├── Show: Percentage + bar
└── Label: "30% hoàn thành" (muted text)
```

---

### 2.6 Testimonials Section

#### Layout

```
MOBILE (1 testimonial visible, swipe carousel):
┌─────────────────────────┐
│    Họ nói gì về chúng tôi │
├─────────────────────────┤
│                           │
│  "Tôi đã cải thiện kỹ    │
│  năng nghe của mình chỉ   │
│  sau 2 tuần. Đặc biệt     │
│  thích tính năng ghi âm   │
│  và AI feedback."         │
│                           │
│  [Avatar] Minh Trần       │
│  Sinh viên, Hà Nội        │
│                           │
│      ● ○ ○               │  ← Carousel dots
│                           │
└─────────────────────────┘

DESKTOP (3 testimonials):
┌─────────────────────────────────────────────────────────────┐
│                 Họ nói gì về chúng tôi                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│  │ "Tôi đã cải  │ │ "Tính năng    │ │ "App rất dễ  │      │
│  │ thiện kỹ     │ │ ghi âm và AI  │ │ sử dụng. Tôi │      │
│  │ năng nghe..."│ │ feedback..."  │ │ học mỗi      │      │
│  │               │ │               │ │ ngày..."     │      │
│  │ [Avatar]      │ │ [Avatar]      │ │ [Avatar]     │      │
│  │ Minh Trần     │ │ Linh Nguyễn   │ │ Anh Phạm     │      │
│  │ Sinh viên     │ │ Nhân viên VP  │ │ Người đi làm │      │
│  └───────────────┘ └───────────────┘ └───────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
TESTIMONIAL CARD:
├── Background: --bg-card
├── Border: 1px solid --border
├── Radius: --radius-lg
├── Padding: 24px
├── Max width: 350px
└── Shadow: --shadow-sm

QUOTE ICON:
├── Size: 24×24px
├── Color: --accent (light)
├── Opacity: 0.3
└── Position: Top-left corner

QUOTE TEXT:
├── Font: 16px, regular
├── Color: --text-primary
├── Line height: 1.6
├── Font style: Italic
└── Max lines: 5 (truncate if longer)

AVATAR:
├── Size: 40×40px
├── Radius: --radius-full
├── Background: --bg-secondary
└── Text: User initials

USER NAME:
├── Font: 14px, semibold
├── Color: --text-primary
└── Margin: 12px 0 2px

USER ROLE:
├── Font: 13px, regular
├── Color: --text-muted
└── Format: "Vai trò, Địa điểm"

CAROUSEL DOTS:
├── Size: 8×8px
├── Active: --accent
├── Inactive: --border
├── Gap: 8px
└── Position: Center below card
```

---

### 2.7 FAQ Section

#### Layout

```
MOBILE:
┌─────────────────────────┐
│    Câu hỏi thường gặp   │
├─────────────────────────┤
│                         │
│  ▾ App miễn phí không?  │  ← Expandable
│    → Content expanded   │
│                         │
│  ▾ Cần trình độ gì?    │
│                         │
│  ▾ Có app trên điện    │
│    thoại không?         │
│                         │
│  ▾ Dữ liệu có bảo mật? │
│                         │
│  ▾ Bao lâu thì thấy    │
│    kết quả?            │
│                         │
└─────────────────────────┘

DESKTOP (2-column):
┌─────────────────────────────────────────────────────────────┐
│                   Câu hỏi thường gặp                        │
├────────────────────────────┬────────────────────────────────┤
│                            │                                │
│  ▾ App miễn phí không?     │  ▾ Cần trình độ gì để bắt    │
│    → Content expanded      │    đầu?                        │
│                            │                                │
│  ▾ Có app trên điện      │  ▾ Dữ liệu có bảo mật không?  │
│    thoại không?           │                                │
│                            │  ▾ Bao lâu thì thấy kết quả?  │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

#### Components

```
FAQ ITEM:
├── Border-bottom: 1px solid --border
├── Padding: 16px 0
└── No border on last item

FAQ QUESTION:
├── Font: 16px, medium
├── Color: --text-primary
├── Display: flex
├── Align: center, space-between
└── Icon: Chevron down/up (rotates on expand)

FAQ ANSWER:
├── Font: 14px, regular
├── Color: --text-secondary
├── Line height: 1.6
├── Padding: 12px 0 4px
├── Max height: 0 (collapsed) → auto (expanded)
└── Animation: max-height 300ms ease-out

EXPAND/COLLAPSE ICON:
├── Size: 20×20px
├── Color: --text-muted
├── Transform: rotate(0deg) collapsed, rotate(180deg) expanded
└── Transition: 200ms ease
```

---

### 2.8 Final CTA Section

#### Layout

```
MOBILE:
┌─────────────────────────┐
│                         │
│  Sẵn sàng bắt đầu?     │
│                         │
│  Tham gia 5,000+        │
│  người đang học         │
│  tiếng Anh mỗi ngày.    │
│                         │
│  ┌───────────────────┐  │
│  │ Đăng ký miễn phí │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘

DESKTOP:
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│               Sẵn sàng bắt đầu?                              │
│                                                               │
│         Tham gia 5,000+ người đang học                      │
│           tiếng Anh mỗi ngày.                                │
│                                                               │
│              [ Đăng ký miễn phí ngay ]                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
FINAL CTA BACKGROUND:
├── Background: --primary (#35375B)
├── Padding: 64px 24px
└── Max width: 800px, centered

FINAL CTA HEADLINE:
├── Font: 32px/40px, bold
├── Color: White
└── Text align: Center

FINAL CTA SUBHEADLINE:
├── Font: 18px, regular
├── Color: White (opacity 0.8)
└── Text align: Center

FINAL CTA BUTTON:
├── Background: White
├── Text color: --primary
├── Width: auto (desktop), full (mobile)
└── Hover: Scale 1.02, shadow increase
```

---

### 2.9 Footer

#### Layout

```
MOBILE:
┌─────────────────────────┐
│  [Logo]                 │
├─────────────────────────┤
│  About                  │
│  Privacy                │
│  Terms                  │
│  Contact                │
├─────────────────────────┤
│  Social: FB IG YT TT    │
├─────────────────────────┤
│  © 2026 VinaListen.    │
│  All rights reserved.   │
└─────────────────────────┘

DESKTOP:
┌─────────────────────────────────────────────────────────────┐
│  [Logo]     About  Privacy  Terms  Contact    Social Icons  │
│                                                               │
│  © 2026 VinaListen. All rights reserved.                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.10 Landing Page User Flow

```
VISITOR FLOW:

[Visit Landing Page]
        │
        ▼
[See Hero] ── "Tôi không quan tâm" ── [Exit]
        │
        │ "Tôi muốn thử"
        ▼
[Scroll down to Features]
        │
        ▼
[Click "Bắt đầu miễn phí"]
        │
        ▼
[Redirect to Register]
        │
        ├── [Continue with Google] ── [OAuth] ── [Onboarding]
        ├── [Continue with Email] ── [Enter email] ── [Send magic link] ── [Verify] ── [Onboarding]
        └── [Already have account] ── [Login] ── [Dashboard]
```

---

### 2.11 Landing Page Empty/Error States

```
EMPTY STATE: No testimonials yet
┌─────────────────────────┐
│                         │
│    "Phản hồi đang       │
│    được cập nhật..."    │
│                         │
│    [Placeholder avatar] │
│    "Trở thành người    │
│    đầu tiên chia sẻ"   │
│                         │
└─────────────────────────┘

ERROR STATE: Demo video fails to load
┌─────────────────────────┐
│                         │
│    [Static fallback     │
│     image of app UI]     │
│                         │
│    "Nhấn để xem demo"  │
│                         │
└─────────────────────────┘

LOADING STATE: Page loading
├── Full-page skeleton
├── Hero: Gray placeholder blocks
├── Sections: Fade in sequentially
└── Duration: < 2s target
```

---

## PHẦN 3: LISTENING MODULE

### 3.1 Overview

```
PURPOSE: User nghe audio, gõ transcript, nhận feedback
LOCATION: /listen/[lesson-id]
USER FLOW:

[Chọn Lesson] → [Audio Player] → [Transcript Input] → [Check] → [Score] → [Next]

MODULE COMPONENTS:
├── Audio Player (fixed bottom trên mobile)
├── Transcript Input Area (main content)
├── Check Button (sticky)
├── Result Panel (expands after check)
├── Navigation (prev/next clip)
└── Lesson Complete Modal (sau clip cuối)
```

---

### 3.2 Topic Selection Page

#### Layout

```
MOBILE (Full-screen list):
┌─────────────────────────┐
│ ← Quay lại     Topics  │  ← Header with back
├─────────────────────────┤
│ 🔍 Tìm kiếm topic...   │  ← Search bar (sticky)
├─────────────────────────┤
│                         │
│  IELTS Listening         │  ← Topic row
│  25 bài · ●●●○○ 30%    │
│                         │
├─────────────────────────┤
│  Business English       │
│  20 bài · ●○○○○ 0%     │
│                         │
├─────────────────────────┤
│  Daily Conversations     │
│  30 bài · ●●●●○ 50%    │
│                         │
├─────────────────────────┤
│  TOEIC Listening        │
│  15 bài · ○○○○○ 0%     │
│                         │
├─────────────────────────┤
│  Travel English         │
│  18 bài · ●○○○○ 5%     │
│                         │
└─────────────────────────┘

TABLET/DESKTOP (Grid + Sidebar):
┌─────────────────────────────────────────────────────────────┐
│ ← Back          Topics                        [Search]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Filter chips: Tất cả | IELTS | Business | Daily]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│  │ 🎧            │ │ 💼            │ │ 💬            │      │
│  │ IELTS         │ │ Business      │ │ Daily         │      │
│  │ Listening     │ │ English       │ │ Conver-       │      │
│  │               │ │               │ │ sations       │      │
│  │ 25 bài        │ │ 20 bài        │ │ 30 bài        │      │
│  │ ████░░░░░ 30%│ │ ●○○○○ 0%     │ │ ██████░░ 50%  │      │
│  └───────────────┘ └───────────────┘ └───────────────┘      │
│                                                              │
│  ┌───────────────┐ ┌───────────────┐                        │
│  │ 📝            │ │ ✈️            │                        │
│  │ TOEIC         │ │ Travel        │                        │
│  │ Listening     │ │ English       │                        │
│  │               │ │               │                        │
│  │ 15 bài        │ │ 18 bài        │                        │
│  │ ●○○○○ 0%     │ │ ●○○○○ 5%      │                        │
│  └───────────────┘ └───────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
SEARCH BAR:
├── Height: 44px
├── Background: --bg-secondary
├── Border: 1px solid --border
├── Radius: --radius-md
├── Icon: Search (left)
├── Placeholder: "Tìm kiếm topic..."
├── Clear button: X icon (when has text)
├── Behavior: Filter topics in real-time
└── Mobile: Sticky top

TOPIC ROW (Mobile list):
├── Height: 72px
├── Padding: 12px 16px
├── Layout: Icon (40px) | Name + meta | Progress
├── Border-bottom: 1px solid --border
├── Tap area: Full row
└── Hover: Background --bg-secondary

TOPIC CARD (Grid):
├── Background: --bg-card
├── Border: 1px solid --border
├── Radius: --radius-lg
├── Padding: 20px
├── Layout: Icon top, text below
├── Aspect ratio: Not fixed (content-based)
└── Hover: Shadow lift, border accent

TOPIC ICON:
├── Size: 48×48px
├── Radius: --radius-md
└── Background: Topic-specific color (light)

TOPIC NAME:
├── Font: 16px, semibold (mobile) / 18px (desktop)
├── Color: --text-primary
└── Lines: 2 max

LESSON COUNT:
├── Font: 13px, regular
├── Color: --text-muted
└── Format: "X bài học"

PROGRESS INDICATOR:
├── Mobile: Dots + percentage
│   ├── ●●●○○ 30% (5 dots, filled = progress)
│   └── Dots: 8px, filled = --accent
├── Desktop: Progress bar
│   ├── Bar: 6px height
│   └── Fill: --accent
└── Hidden if user not logged in

FILTER CHIPS:
├── Horizontal scroll (mobile)
├── Gap: 8px
├── Chip: Pill shape, 32px height
├── Active: Background --primary, text white
├── Inactive: Background --bg-secondary, text --text-secondary
└── Options: Tất cả | IELTS | Business | Daily | TOEIC | Travel
```

#### States

```
DEFAULT: Topics displayed, user can browse
SEARCH ACTIVE: Filtered results, search term highlighted
LOADING: Skeleton cards (3-6 placeholders)
EMPTY SEARCH: "Không tìm thấy topic phù hợp" + suggestion
ERROR: "Không thể tải topics. [Thử lại]" + retry button
NO PROGRESS: If not logged in, no progress bars shown
```

---

### 3.3 Lesson Selection Page

#### Layout

```
MOBILE:
┌─────────────────────────┐
│ ← IELTS Listening        │
├─────────────────────────┤
│                         │
│  Progress: ████░░ 30%  │
│  8/25 bài đã hoàn thành │
│                         │
│  ── Part 1 ──           │  ← Section divider
│                         │
│  📝 First Snowfall      │  ← Lesson row (completed)
│  ✓ 95% · 2:30          │
│                         │
│  📝 Jessica's First Day │
│  ✓ 87% · 3:15          │
│                         │
│  📝 My Flower Garden    │
│  ● 0% · 2:45           │  ← Current (in progress)
│                         │
│  📝 Morning Routine     │
│  ○ Chưa làm · 3:00     │  ← Locked / available
│                         │
│  📝 A Rainy Afternoon   │
│  ○ Chưa làm · 2:30     │
│                         │
│  ── Part 2 ──           │
│                         │
│  📝 ...                 │
│                         │
└─────────────────────────┘

DESKTOP (Sidebar + Content):
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Topics     IELTS Listening          [Continue →]   │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  PROGRESS        │   ── Part 1 ──                           │
│  ████████░░ 30% │                                          │
│  8/25 bài        │   ┌────────────────────────────────┐    │
│                  │   │ First Snowfall                 │    │
│  TOPICS          │   │ ✓ 95% · 2:30                   │    │
│  ○ Part 1 (8)    │   └────────────────────────────────┘    │
│  ○ Part 2 (6)    │   ┌────────────────────────────────┐    │
│  ○ Part 3 (6)    │   │ Jessica's First Day            │    │
│  ○ Part 4 (5)    │   │ ✓ 87% · 3:15                   │    │
│                  │   └────────────────────────────────┘    │
│                  │   ┌────────────────────────────────┐    │
│                  │   │ My Flower Garden (Current)     │    │
│                  │   │ ● 0% · 2:45                   │    │
│                  │   └────────────────────────────────┘    │
│                  │   ┌────────────────────────────────┐    │
│                  │   │ Morning Routine                 │    │
│                  │   │ ○ Chưa làm · 3:00              │    │
│                  │   └────────────────────────────────┘    │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

#### Components

```
LESSON ROW:
├── Height: 64px (mobile) / 56px (desktop)
├── Padding: 12px 16px
├── Layout: Icon | Name + Duration | Status
├── Border-left: 3px (if current/next lesson)
└── Tap: Full row

LESSON ICON:
├── Size: 32×32px
├── Status icon:
│   ├── Completed: Green check circle
│   ├── Current: Orange dot
│   ├── Available: Empty circle outline
│   └── Locked: Lock icon (gray)
└── Position: Left

LESSON NAME:
├── Font: 15px, medium
├── Color: --text-primary
└── Completed: Strike-through + muted

LESSON META:
├── Font: 13px, regular
├── Color: --text-muted
├── Format: "Accuracy · Duration"
└── Completed: "95% · 2:30" (green accuracy)

SECTION DIVIDER:
├── Text: "── Part X ──"
├── Font: 12px, semibold, uppercase
├── Color: --text-muted
├── Margin: 16px 0
└── Alignment: Center

PROGRESS BAR (TOPIC):
├── Height: 8px
├── Background: --bg-secondary
├── Fill: --accent
├── Radius: --radius-full
└── Label: "X/Y bài đã hoàn thành" above

PROGRESS SIDEBAR (DESKTOP):
├── Width: 200px
├── Background: --bg-secondary
├── Padding: 24px
├── Sticky position
└── Sections: Progress, Topic list, Continue button
```

#### States

```
DEFAULT: Lessons listed with status
LOADING: Skeleton rows (3-5 placeholders)
ALL_COMPLETED: Celebration banner + "Next topic" CTA
LOCKED_LESSON: Grayed out, lock icon, tooltip on tap
NO_PROGRESS: All lessons available, no checkmarks
ERROR: "Không thể tải bài học. [Thử lại]"
EMPTY_SECTION: "Chưa có bài trong phần này"
```

---

### 3.4 Lesson Player Page (Listening)

#### Layout

```
MOBILE (Primary — Full screen):
┌─────────────────────────────────────┐
│ ←     Lesson 3/25       [≡]       │  ← Header (minimal)
├─────────────────────────────────────┤
│                                     │
│         Topic: IELTS Part 1         │  ← Breadcrumb (small)
│         Lesson: Morning Routine     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │        [Speaker Icon]       │   │  ← Audio visualization
│  │          🔊 0:00            │   │     area (when playing)
│  │                             │   │
│  │    ══════════════░░░░░     │   │  ← Progress bar
│  │                             │   │
│  │   [◀◀]  [  ▶  ]  [▶▶]    │   │  ← Controls
│  │                             │   │
│  │   [0.5x] [0.75x] [1x]     │   │  ← Speed selector
│  │          [1.25x] [1.5x]    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Clip 1 / 3                        │  ← Clip indicator
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ Nhập transcript bạn nghe   │   │  ← Transcript input
│  │ được ở đây...             │   │
│  │                             │   │
│  │                             │   │
│  │                             │   │
│  │                          X  │   │  ← Clear button
│  └─────────────────────────────┘   │
│                                     │
│  Words: 12                          │  ← Word count
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Kiểm tra transcript    │   │  ← Primary CTA
│  └─────────────────────────────┘   │
│                                     │
│  💡 Nhấn Space để phát/tạm dừng   │  ← Hint text
│     Ctrl+Enter để kiểm tra         │
│                                     │
└─────────────────────────────────────┘

TABLET (Split layout):
┌─────────────────────────────────────────────────────────────┐
│ ← Back    Morning Routine       Part 1    [◀] 2/3 [▶]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────┐  ┌─────────────────────────┐    │
│  │                        │  │                         │    │
│  │    [AUDIO PLAYER]      │  │  Clip 1/3               │    │
│  │                        │  │                         │    │
│  │   🔊 0:00 / 2:30      │  │  ┌───────────────────┐  │    │
│  │   ═══════════░░░░░    │  │  │ Nhập transcript   │  │    │
│  │   [◀] [ ▶ ] [▶]      │  │  │ bạn nghe được... │  │    │
│  │                        │  │  │                   │  │    │
│  │   [0.5x][0.75x][1x]   │  │  │              [X]  │  │    │
│  │        [1.25x][1.5x]  │  │  └───────────────────┘  │    │
│  │                        │  │                         │    │
│  │   🔁 Loop    🔂 All    │  │  Words: 12              │    │
│  └────────────────────────┘  │                         │    │
│                               │  [ Kiểm tra ]           │    │
│                               │                         │    │
│                               │  ⌨️ Space=Play  ⌨️ Ctrl+│    │
│                               │  Enter=Check            │    │
│                               └─────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

DESKTOP (Centered, max-width 800px):
┌─────────────────────────────────────────────────────────────┐
│                   Morning Routine — Part 1                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              ┌────────────────────────────────┐              │
│              │                                │              │
│              │        [AUDIO PLAYER]          │              │
│              │                                │              │
│              │        🔊  0:00 / 2:30         │              │
│              │        ═══════════════░░░░░   │              │
│              │                                │              │
│              │      [◀◀]   [ ▶ ]   [▶▶]     │              │
│              │                                │              │
│              │  [0.5x] [0.75x] [1x] [1.25x]  │              │
│              │           [1.5x]               │              │
│              │                                │              │
│              │    🔁 Loop Clip    🔂 Loop All │              │
│              │                                │              │
│              └────────────────────────────────┘              │
│                                                              │
│                        Clip 1 of 3                           │
│                                                              │
│              ┌────────────────────────────────┐              │
│              │                                │              │
│              │   Nhập transcript bạn nghe   │              │
│              │   được ở đây...              │              │
│              │                                │              │
│              │                                │              │
│              │                                │              │
│              │                             X  │              │
│              │                                │              │
│              │   Words: 0                     │              │
│              │                                │              │
│              └────────────────────────────────┘              │
│                                                              │
│              ┌────────────────────────────────┐              │
│              │       Kiểm tra transcript      │              │
│              └────────────────────────────────┘              │
│                                                              │
│                 💡 Space = Phát/Tạm dừng                    │
│                    Ctrl + Enter = Kiểm tra                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Audio Player Components

```
PLAYER CONTAINER:
├── Background: --bg-secondary
├── Border radius: --radius-xl
├── Padding: 32px (desktop) / 24px (mobile)
├── Max-width: 600px (desktop)
└── Centered on desktop

PLAY/PAUSE BUTTON:
├── Size: 64×64px (mobile) / 72×72px (desktop)
├── Shape: Circle
├── Background: --accent (#FF5632)
├── Icon: Play (▶) / Pause (⏸) — white, 28px
├── Shadow: --shadow-md
├── Touch target: 64×64px
├── Hover: Scale 1.05, darker background
├── Active: Scale 0.95
├── Focus: Ring outline (accessibility)
└── Loading: Spinner replaces icon

SKIP BUTTONS (◀◀ ▶▶):
├── Size: 40×40px
├── Shape: Circle
├── Background: --bg-primary
├── Icon: Skip back 5s / Skip forward 5s — 20px
├── Label below: "-5s" / "+5s" (muted text)
├── Touch target: 44×44px
└── Disabled state: Opacity 0.5

PROGRESS BAR:
├── Height: 8px (resting) / 12px (hover/active)
├── Background: --bg-secondary
├── Fill: --accent
├── Buffer: --border (darker)
├── Thumb: 16×16px circle, white, shadow
├── Seekable: Click anywhere to seek
├── Current time: Left of bar, 14px, mono font
├── Total time: Right of bar, 14px, mono font
└── Transition: Fill width 100ms linear

SPEED SELECTOR:
├── Layout: Horizontal pill buttons
├── Options: 0.5x, 0.75x, 1x, 1.25x, 1.5x
├── Selected: Background --primary, text white
├── Unselected: Background --bg-primary, text --text-secondary
├── Height: 32px
├── Font: 14px, medium
├── Radius: --radius-full
└── Default: 1x

LOOP CONTROLS:
├── Layout: Two buttons side by side
├── Loop Clip: Current clip only
├── Loop All: All clips in lesson
├── Active: Icon filled + accent color
├── Inactive: Icon outline + muted
└── Label below: "Lặp clip" / "Lặp tất cả"

VOLUME CONTROL:
├── Icon: Speaker with level indicator
├── Click: Toggle mute
├── Drag/Slider: Adjust volume
├── Range: 0-100%
└── Mobile: Hidden (use device volume)
```

#### Transcript Input Components

```
TRANSCRIPT TEXTAREA:
├── Min height: 150px (mobile) / 200px (desktop)
├── Max height: 300px
├── Background: --bg-primary
├── Border: 2px solid --border
├── Border focus: 2px solid --accent
├── Border radius: --radius-lg
├── Padding: 16px
├── Font: 16px, regular (Nimbus Sans)
├── Line height: 1.6
├── Placeholder: "Nhập transcript bạn nghe được ở đây..."
├── Placeholder color: --text-muted
├── Auto-grow: Height increases with content
├── Paste: Disabled (prevent cheating)
├── Spell check: Disabled (transcripts are in English)
└── Auto-correct: Disabled

CLEAR BUTTON:
├── Position: Top-right of textarea
├── Icon: X (close)
├── Size: 24×24px
├── Color: --text-muted
├── Hover: Color --text-primary
└── Action: Clear textarea, focus textarea

WORD COUNT:
├── Position: Below textarea, right-aligned
├── Font: 13px, regular
├── Color: --text-muted
├── Format: "Words: X"
└── Update: Real-time as user types

SUBMIT BUTTON:
├── Width: Full (mobile) / auto (desktop)
├── Height: 52px
├── Background: --accent
├── Text: "Kiểm tra transcript", 16px, semibold, white
├── Border radius: --radius-lg
├── Disabled: Opacity 0.5, cursor not-allowed
├── Enabled when: Textarea has content
├── Loading: "Đang kiểm tra..." + spinner
└── Keyboard shortcut: Ctrl/Cmd + Enter

KEYBOARD SHORTCUTS HINT:
├── Position: Below submit button
├── Font: 13px, regular
├── Color: --text-muted
├── Format: Icon + text
├── Content: "Space = Phát/Tạm dừng · Ctrl+Enter = Kiểm tra"
└── Mobile: Hidden (no keyboard shortcuts)
```

---

### 3.5 Result Panel (After Check)

#### Layout

```
MOBILE (Expands below input):
┌─────────────────────────────────────┐
│                                     │
│         Kết quả kiểm tra           │  ← Section title
│                                     │
│    ┌─────────────────────────────┐ │
│    │  Accuracy: 85%              │ │  ← Score header
│    │  ████████████████░░░░       │ │  ← Progress bar
│    └─────────────────────────────┘ │
│                                     │
│  ┌─ Expected ────────────────┐    │
│  │ I was walking to school   │    │  ← Ground truth
│  │ when it started raining.   │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌─ Your answer ──────────────┐    │
│  │ I was walking to school    │    │  ← User input
│  │ when it start raining.     │    │  ← Colored diff
│  └────────────────────────────┘    │
│                                     │
│  Word-by-word comparison:          │
│  ┌─────────────────────────────┐  │
│  │ I           ✅              │  │
│  │ was         ✅              │  │
│  │ walking     ✅              │  │
│  │ to          ✅              │  │
│  │ school      ✅              │  │
│  │ when        ✅              │  │
│  │ it          ✅              │  │
│  │ started     ✅              │  │  ← Green (correct)
│  │ raining.    ✅              │  │
│  │             ───             │  │  ← Missing
│  │             ❌ EXTRA        │  │  ← Extra word
│  └─────────────────────────────┘  │
│                                     │
│  💡 AI Feedback:                   │
│  Bạn đã làm tốt! Chú ý thì quá    │
│  khứ của động từ "start" →        │
│  "started".                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Tiếp tục clip 2 →    │   │  ← Primary CTA
│  └─────────────────────────────┘   │
│                                     │
│  [ Nghe lại ]  [ Thử lại ]        │  ← Secondary buttons
│                                     │
└─────────────────────────────────────┘

DESKTOP:
┌─────────────────────────────────────────────────────────────┐
│                        Kết quả kiểm tra                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌──────────────────────────────────────────┐        │
│         │         Accuracy: 85%                     │        │
│         │         ████████████████████░░░░          │        │
│         └──────────────────────────────────────────┘        │
│                                                              │
│  ┌─ Expected transcript ─────────────────────┐              │
│  │ I was walking to school when it started   │              │
│  │ raining.                                 │              │
│  └───────────────────────────────────────────┘              │
│                                                              │
│  ┌─ Your answer ────────────────────────────┐               │
│  │ I was walking to school when it start    │               │
│  │ raining.                                 │               │
│  └───────────────────────────────────────────┘               │
│                                                              │
│  ┌─ Word comparison ────────────────────────────────────┐   │
│  │ I ✅  was ✅  walking ✅  to ✅  school ✅  when ✅     │   │
│  │ it ✅  start ❌  raining ✅  . ✅                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 AI Feedback: Bạn đã làm tốt! Chú ý thì quá khứ...        │
│                                                              │
│  ┌─────────────────────────┐  [ Nghe lại ]  [ Thử lại ]     │
│  │    Tiếp tục clip 2 →    │                                │
│  └─────────────────────────┘                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
RESULT PANEL:
├── Animation: Slide down + fade in (400ms)
├── Background: --bg-card
├── Border: 1px solid --border
├── Border radius: --radius-xl
├── Padding: 24px
└── Shadow: --shadow-md

ACCURACY SCORE:
├── Layout: Center, large
├── Number: 48px, bold (animated count up)
├── Color: Green (>80%), Yellow (60-80%), Red (<60%)
├── Label: "Accuracy"
├── Progress bar: Below number, 8px height
└── Animation: Count from 0 to actual % over 1s

TRANSCRIPT COMPARISON:
├── Layout: Two side-by-side boxes (desktop) / stacked (mobile)
├── Background: --bg-secondary
├── Border radius: --radius-md
├── Padding: 16px
├── Label: "Expected" / "Your answer" above each

WORD-BY-WORD DIFF:
├── Layout: Horizontal flow, wrap
├── Word chip: Inline text + status icon
├── Correct: Text --success (#00BE7C), icon ✅
├── Wrong: Text --error (#FF3257), strikethrough, icon ❌
├── Missing: Text --text-muted, underlined, icon ➖
├── Extra: Text --warning (#FFAB00), icon ➕
└── Font: 15px, monospace for alignment

AI FEEDBACK BOX:
├── Background: --cream (#F0E7DF)
├── Border-left: 4px solid --brown (#B15224)
├── Border radius: --radius-md
├── Padding: 16px
├── Icon: 💡 (bulb)
├── Title: "AI Feedback" (14px, semibold)
├── Content: "Bạn đã làm tốt!..." (14px, regular)
└── Max width: 100%

CONTINUE BUTTON:
├── Width: Full (mobile) / auto (desktop)
├── Height: 48px
├── Background: --accent
├── Text: "Tiếp tục clip X →" (with arrow)
├── Arrow: Animated slide right on hover
└── Last clip: "Hoàn thành bài học"

SECONDARY BUTTONS:
├── Layout: Two buttons, equal width
├── Background: --bg-primary
├── Border: 1px solid --border
├── Text: --text-primary
├── Hover: Background --bg-secondary
└── Actions: "Nghe lại" (replay audio), "Thử lại" (clear + retry)
```

---

### 3.6 Lesson Complete Screen

#### Layout

```
MOBILE (Modal overlay):
┌─────────────────────────────────────┐
│                                     │
│              🎉                     │  ← Confetti animation
│                                     │
│         CHÚC MỪNG BẠN!             │
│      Bạn đã hoàn thành bài học     │
│                                     │
│    ┌─────────────────────────┐    │
│    │  Accuracy: 87%          │    │
│    │  Clips: 3/3             │    │
│    │  Time: 8 phút           │    │
│    └─────────────────────────┘    │
│                                     │
│    ┌─────────────────────────┐    │
│    │  XP: +85 ⭐            │    │
│    │  🔥 Streak: 5 ngày     │    │
│    └─────────────────────────┘    │
│                                     │
│    ┌─────────────────────────┐    │
│    │   Bài tiếp theo →      │    │  ← Primary CTA
│    └─────────────────────────┘    │
│                                     │
│    [ Về Dashboard ]               │  ← Secondary
│                                     │
└─────────────────────────────────────┘

DESKTOP (Centered modal):
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                     🎉 CHÚC MỪNG BẠN! 🎉                     │
│                                                               │
│                 Bạn đã hoàn thành Morning Routine             │
│                                                               │
│         ┌─────────────────────────────────────────────┐       │
│         │                                             │       │
│         │   Accuracy      Clips        Thời gian    │       │
│         │     87%          3/3          8 phút       │       │
│         │                                             │       │
│         └─────────────────────────────────────────────┘       │
│                                                               │
│                   XP +85 ⭐    🔥 Streak 5 ngày              │
│                                                               │
│         ┌───────────────────────────────────────────┐         │
│         │          Bài tiếp theo →                  │         │
│         └───────────────────────────────────────────┘         │
│                                                               │
│                      [ Về Dashboard ]                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
COMPLETION MODAL:
├── Type: Modal overlay with backdrop blur
├── Animation: Scale up + fade in (400ms spring)
├── Background: --bg-primary
├── Border radius: --radius-xl
├── Max width: 480px (desktop)
├── Padding: 32px (desktop) / 24px (mobile)
└── Backdrop: rgba(0,0,0,0.5) with blur

CONFETTI:
├── Library: canvas-confetti (lightweight)
├── Duration: 2 seconds
├── Colors: --accent, --success, --xp-gold, --streak-purple
├── Density: 100 particles
└── Trigger: Once on modal open

HEADLINE:
├── Text: "CHÚC MỪNG BẠN!"
├── Font: 28px, bold, center
├── Color: --dark
└── Margin bottom: 8px

LESSON NAME:
├── Text: "Bạn đã hoàn thành [Lesson Name]"
├── Font: 16px, regular, center
├── Color: --text-secondary
└── Margin bottom: 24px

STATS GRID:
├── Layout: 3 columns
├── Background: --bg-secondary
├── Border radius: --radius-lg
├── Padding: 20px
├── Items: Accuracy | Clips | Time
├── Value: 24px, bold, --primary
├── Label: 13px, --text-muted
└── Mobile: Same layout, smaller text

REWARDS ROW:
├── Layout: Centered, gap 24px
├── XP badge: Star icon + "+85" + gold text
├── Streak badge: Fire icon + "5 ngày" + orange text
├── Font: 20px, semibold
└── Animation: Pop in with scale (200ms spring)

CONTINUE BUTTON:
├── Width: Full (mobile) / auto (desktop)
├── Height: 52px
├── Background: --accent
├── Text: "Bài tiếp theo →" / "Về topics"
└── Arrow: Slide right on hover

BACK BUTTON:
├── Style: Ghost button
├── Text: --text-secondary
└── Hover: Text --text-primary

NEXT LESSON CARD (Desktop):
├── Show thumbnail + name of next lesson
├── Position: Below continue button
└── Tap: Navigate to next lesson
```

---

### 3.7 Listening Module — Empty/Error States

```
EMPTY STATE: No clips available
┌─────────────────────────┐
│                         │
│     🎧                  │
│                         │
│   Chưa có clip nào      │
│   trong bài học này    │
│                         │
│   [Quay lại topics]    │
│                         │
└─────────────────────────┘

ERROR STATE: Audio fails to load
┌─────────────────────────┐
│                         │
│     🔊                  │
│                         │
│   Audio không tải       │
│   được. Kiểm tra        │
│   kết nối mạng.        │
│                         │
│   [Thử lại]            │
│                         │
└─────────────────────────┘

ERROR STATE: Submission fails
┌─────────────────────────┐
│                         │
│   ❌                    │
│                         │
│   Không thể kiểm tra.  │
│   Vui lòng thử lại.    │
│                         │
│   [Thử lại]            │
│                         │
└─────────────────────────┘

ERROR STATE: Network offline
┌─────────────────────────┐
│                         │
│   📡                    │
│                         │
│   Bạn đang offline.    │
│   Kết nối mạng để      │
│   tiếp tục học.        │
│                         │
│   Bài đang được lưu... │
│                         │
└─────────────────────────┘

LOADING STATE: Submitting
┌─────────────────────────┐
│                         │
│   [Spinner]             │
│                         │
│   Đang kiểm tra...      │
│                         │
│   So sánh transcript   │
│   với đáp án            │
│                         │
└─────────────────────────┘
```

---

## PHẦN 4: SPEAKING MODULE

### 4.1 Overview

```
PURPOSE: User ghi âm giọng nói, nhận AI feedback về phát âm
LOCATION: /listen/[lesson-id] → After transcript check
TRIGGER: "Nói lại" button sau khi kiểm tra transcript

USER FLOW:

[Sau khi check transcript]
        │
        ▼
[Hướng dẫn] "Nghe và nói lại câu này"
        │
        ▼
[Record Screen] Ghi âm giọng nói
        │
        ▼
[Processing] AI nhận diện giọng nói
        │
        ▼
[Results] Điểm phát âm + So sánh
        │
        ▼
[Next Clip] hoặc [Next Lesson]

MODULE COMPONENTS:
├── Recording Interface
├── Waveform Visualizer
├── Playback Controls
├── Pronunciation Score
├── Word-level Feedback
└── Next Action Buttons
```

---

### 4.2 Recording Screen

#### Layout

```
MOBILE:
┌─────────────────────────────────────┐
│ ← Quay lại transcript               │  ← Back to lesson
├─────────────────────────────────────┤
│                                     │
│         🎤 Speaking Practice        │  ← Section header
│         Clip 1 / 3                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    Expected sentence:       │   │  ← Show what to say
│  │                             │   │
│  │  I was walking to school    │   │
│  │  when it started raining.  │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         [ RECORDING AREA ]          │
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │    🎤                   │     │  ← Large mic icon
│    │                         │     │
│    │   Waveform appears      │     │  ← Live waveform
│    │   here when recording   │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
│         00:00 / 00:30              │  ← Timer (current / max)
│                                     │
│    ┌─────────────────────────┐     │
│    │       BẮT ĐẦU GHI ÂM   │     │  ← Record button
│    └─────────────────────────┘     │
│                                     │
│    Max: 30 giây                     │
│                                     │
└─────────────────────────────────────┘

MOBILE (Recording state):
┌─────────────────────────────────────┐
│                                     │
│         🎤 Đang ghi âm...          │
│                                     │
│    ┌─────────────────────────┐     │
│    │ ▂▄▆█▆▄▆█▆▄▆█▆▄▆█▆▄▆▂  │     │  ← Live waveform
│    └─────────────────────────┘     │
│                                     │
│              0:15                   │  ← Timer counting up
│                                     │
│    ┌─────────────────────────┐     │
│    │      ⏹ DỪNG GHI ÂM     │     │  ← Stop button (red)
│    └─────────────────────────┘     │
│                                     │
│    Nhấn nút để dừng                │
│                                     │
└─────────────────────────────────────┘

MOBILE (Recorded state):
┌─────────────────────────────────────┐
│                                     │
│         🎤 Hoàn thành ghi âm        │
│                                     │
│    ┌─────────────────────────┐     │
│    │ ▂▄▆█▆▄▆█▆▄▆█▆▄▆█▆▄▆▂  │     │  ← Recorded waveform
│    └─────────────────────────┘     │
│                                     │
│              0:12                   │  ← Recording duration
│                                     │
│    ┌──────────┐ ┌──────────┐       │
│    │ ▶ Nghe   │ │ ↺ Ghi   │       │  ← Play + Re-record
│    │ lại      │ │ lại      │       │
│    └──────────┘ └──────────┘       │
│                                     │
│    ┌─────────────────────────┐     │
│    │     XEM KẾT QUẢ →       │     │  ← Primary CTA
│    └─────────────────────────┘     │
│                                     │
│    [Bỏ qua speaking]               │  ← Skip (secondary)
│                                     │
└─────────────────────────────────────┘

DESKTOP:
┌─────────────────────────────────────────────────────────────┐
│           Speaking Practice — Morning Routine                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────┐  ┌──────────────────────────┐   │
│   │                      │  │                          │   │
│   │  Expected:           │  │                          │   │
│   │                      │  │                          │   │
│   │  "I was walking to   │  │      ┌────────────────┐  │   │
│   │   school when it      │  │      │                │  │   │
│   │   started raining."   │  │      │    🎤          │  │   │
│   │                      │  │      │                │  │   │
│   │  📝 Transcript:       │  │      │   [Waveform]   │  │   │
│   │  I was walking to     │  │      │                │  │   │
│   │  school when it       │  │      │                │  │   │
│   │  start raining.       │  │      └────────────────┘  │   │
│   │                      │  │                          │   │
│   │                      │  │          0:12 / 0:30     │   │
│   │                      │  │                          │   │
│   │                      │  │   ┌────────┐ ┌────────┐  │   │
│   │                      │  │   │ ▶ Play │ │ ↺ Re   │  │   │
│   │                      │  │   └────────┘ └────────┘  │   │
│   │                      │  │                          │   │
│   └──────────────────────┘  └──────────────────────────┘   │
│                                                              │
│          ┌────────────────────────────────────────┐          │
│          │          BẮT ĐẦU GHI ÂM                │          │
│          └────────────────────────────────────────┘          │
│                                                              │
│          [Bỏ qua speaking]                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
RECORDING INTERFACE:
├── Layout: Centered content
├── Background: --bg-primary
├── Max-width: 600px (desktop)
└── Padding: 24px

EXPECTED SENTENCE CARD:
├── Background: --bg-secondary
├── Border radius: --radius-lg
├── Padding: 20px
├── Text: 18px, regular, --text-primary
├── Line height: 1.6
├── Font style: Italic
└── Label: "Expected:" above, 13px, --text-muted

WAVEFORM VISUALIZER:
├── Type: Canvas or SVG
├── Height: 120px (mobile) / 100px (desktop)
├── Background: --bg-secondary
├── Border radius: --radius-lg
├── Color: --accent (bars), --primary (recorded)
├── Animation: Real-time bars during recording
├── Bars: 40-60 vertical bars
├── Bar width: 4px
├── Bar gap: 2px
└── Transition: Smooth animation

MICROPHONE ICON:
├── Size: 80×80px (mobile) / 64×64px (desktop)
├── Color: --text-muted (idle), --accent (ready)
├── Position: Center of waveform area
└── Animation: Pulse when ready to record

RECORD BUTTON:
├── Size: 72×72px (mobile) / 64×64px (desktop)
├── Shape: Circle
├── Background: --accent
├── Icon: Microphone (white, 28px)
├── Shadow: --shadow-lg
├── Touch target: 72×72px
└── Hover: Scale 1.05, darker background

STOP BUTTON:
├── Size: Same as record button
├── Shape: Square with rounded corners (mobile) / Circle (desktop)
├── Background: --error (#FF3257)
├── Icon: Square (stop icon)
└── Animation: Pulse while recording

TIMER:
├── Font: 24px, bold, mono font
├── Color: --text-primary
├── Format: "0:00 / 0:30" (current / max)
├── Position: Below waveform
└── Recording: Count up, red color

PLAYBACK BUTTONS:
├── Layout: Two buttons side by side
├── Size: 48×48px each
├── Background: --bg-secondary
├── Border: 1px solid --border
├── Border radius: --radius-md
├── Icons: Play, Re-record
└── Hover: Background --bg-primary

SUBMIT BUTTON:
├── Text: "Xem kết quả →"
├── Background: --accent
├── Width: Full (mobile) / auto (desktop)
└── Arrow: Slide right on hover

SKIP BUTTON:
├── Text: "Bỏ qua speaking"
├── Style: Ghost button
├── Color: --text-muted
└── Position: Below submit
```

---

### 4.3 Pronunciation Results Screen

#### Layout

```
MOBILE:
┌─────────────────────────────────────┐
│                                     │
│         Kết quả phát âm            │
│         Clip 1 / 3                  │
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │      🎤 78%             │     │  ← Large score
│    │      Khá tốt!           │     │  ← Label
│    │                         │     │
│    │   █████████████░░░░    │     │  ← Score bar
│    │                         │     │
│    │   Pronunciation: 75%   │     │
│    │   Fluency: 80%        │     │
│    │   Accuracy: 78%       │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
│  ┌─ Expected ────────────────┐    │
│  │ I was walking to school  │    │
│  └──────────────────────────┘    │
│                                     │
│  ┌─ You said ─────────────────┐   │
│  │ I was walking to school   │   │
│  └───────────────────────────┘   │
│                                     │
│  ┌─ Word-by-word ─────────────┐   │
│  │ I ✅ was ✅ walking ✅    │   │
│  │ to ✅ school ✅ when ✅   │   │
│  │ it ⚠️ start ❌ raining ⚠️ │   │  ← ⚠️ = mispronounce
│  └───────────────────────────┘   │
│                                     │
│  💡 AI Feedback:                    │
│  Bạn phát âm "start" chưa chuẩn.  │
│  Nên đọc /stɑːt/ thay vì /start/. │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     ▶ Nghe lại recording    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Tiếp tục clip 2 →      │   │  ← Primary CTA
│  └─────────────────────────────┘   │
│                                     │
│  [Ghi âm lại]  [Bỏ qua]           │  ← Secondary
│                                     │
└─────────────────────────────────────┘

DESKTOP (Centered, max-width 700px):
┌─────────────────────────────────────────────────────────────┐
│                      Kết quả phát âm                        │
│                         Clip 1 of 3                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌────────────────────┐                    │
│                    │                    │                    │
│                    │      🎤  78%      │                    │
│                    │      Khá tốt!      │                    │
│                    │                    │                    │
│                    │  █████████████░░░ │                    │
│                    │                    │                    │
│                    │ Pronun.  Fluency   Accur.              │
│                    │   75%       80%    78%                  │
│                    │                    │                    │
│                    └────────────────────┘                    │
│                                                              │
│  ┌─ Expected ───────────────┐  ┌─ You said ──────────────┐   │
│  │ I was walking to school │  │ I was walking to school│   │
│  │ when it started raining.│  │ when it start raining. │   │
│  └─────────────────────────┘  └────────────────────────┘   │
│                                                              │
│  ┌─ Pronunciation breakdown ─────────────────────────────┐   │
│  │ I ✅  was ✅  walking ✅  to ✅  school ✅  when ✅   │   │
│  │ it ⚠️  start ❌  raining ⚠️  . ✅                     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Bạn phát âm "start" chưa chuẩn. /stɑːt/ thay vì /start/ │
│                                                              │
│  ┌─────────────────┐   [Ghi âm lại]   [Bỏ qua]             │
│  │ ▶ Nghe recording │                                         │
│  └─────────────────┘                                         │
│                                                              │
│              ┌────────────────────────────────┐              │
│              │       Tiếp tục clip 2 →       │              │
│              └────────────────────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Components

```
RESULTS CARD:
├── Background: --bg-card
├── Border: 1px solid --border
├── Border radius: --radius-xl
├── Padding: 24px
├── Shadow: --shadow-md
└── Animation: Fade in + slide up (400ms)

OVERALL SCORE:
├── Layout: Center
├── Number: 64px, bold
├── Color: Green (>80%), Yellow (60-80%), Red (<60%)
├── Icon: 🎤 above number
├── Label: Below number ("Khá tốt!" / "Cần cải thiện" etc.)
└── Animation: Count up from 0

SCORE BREAKDOWN:
├── Layout: 3 columns (Pronunciation | Fluency | Accuracy)
├── Value: 20px, semibold
├── Label: 12px, --text-muted
├── Border-right: Separator between columns
└── Max width: 300px, centered

SCORE BAR:
├── Height: 12px
├── Background: --bg-secondary
├── Fill: Color based on score
├── Radius: --radius-full
└── Width: Animates from 0 to score %

WORD PRONUNCIATION CHIPS:
├── Layout: Horizontal flow, wrap
├── Each chip: Word + status icon
├── Correct (✅): Text --success, bg --success/10
├── Mispronounced (⚠️): Text --warning, bg --warning/10
├── Wrong (❌): Text --error, bg --error/10
├── Spacing: 8px gap
└── Font: 16px, medium

FEEDBACK BOX:
├── Background: --cream
├── Border-left: 4px solid --brown
├── Padding: 16px
├── Icon: 💡
├── Title: "AI Feedback" (14px, semibold)
├── Content: Specific feedback (14px, regular)
└── Width: 100%

PLAYBACK BUTTON:
├── Layout: Icon + text
├── Icon: Play
├── Background: --bg-secondary
├── Border: 1px solid --border
├── Height: 44px
└── Hover: Background --bg-primary

CONTINUE BUTTON:
├── Text: "Tiếp tục clip X →" / "Hoàn thành bài học"
├── Background: --accent
├── Width: Full (mobile) / auto (desktop)
└── Arrow: Slide right

RE-RECORD BUTTON:
├── Text: "Ghi âm lại"
├── Icon: ↺
├── Style: Secondary
└── Action: Reset to recording state
```

---

### 4.4 Speaking Module — Empty/Error States

```
ERROR STATE: Microphone permission denied
┌─────────────────────────┐
│                         │
│     🎤🔒                │
│                         │
│   Cần quyền truy cập   │
│   microphone để sử     │
│   dụng tính năng này.  │
│                         │
│   [Mở cài đặt]        │
│   [Bỏ qua speaking]    │
│                         │
└─────────────────────────┘

ERROR STATE: Recording fails
┌─────────────────────────┐
│                         │
│     ❌                  │
│                         │
│   Ghi âm thất bại.    │
│   Vui lòng thử lại.    │
│                         │
│   [Thử lại]            │
│   [Bỏ qua speaking]    │
│                         │
└─────────────────────────┘

ERROR STATE: Speech recognition fails
┌─────────────────────────┐
│                         │
│     🎤❓                │
│                         │
│   Không nhận diện     │
│   được giọng nói.     │
│   Thử nói rõ hơn.     │
│                         │
│   [Thử lại]            │
│   [Bỏ qua speaking]    │
│                         │
└─────────────────────────┘

ERROR STATE: Browser doesn't support recording
┌─────────────────────────┐
│                         │
│     📱❌                 │
│                         │
│   Trình duyệt không     │
│   hỗ trợ ghi âm.       │
│   Hãy dùng Chrome,     │
│   Safari, hoặc Edge.    │
│                         │
│   [Bỏ qua speaking]    │
│                         │
└─────────────────────────┘

LOADING STATE: Processing speech
┌─────────────────────────┐
│                         │
│   [Spinner]             │
│                         │
│   Đang nhận diện        │
│   giọng nói...          │
│                         │
│   So sánh với đáp án   │
│   Chấm điểm phát âm    │
│                         │
└─────────────────────────┘

LOADING STATE: Comparing audio
┌─────────────────────────┐
│                         │
│   [Spinner]             │
│                         │
│   Đang so sánh...       │
│                         │
│   Phân tích phát âm    │
│   của bạn               │
│                         │
└─────────────────────────┘
```

---

### 4.5 Speaking Module — Success State

```
SUCCESS STATE: Excellent pronunciation (>90%)
┌─────────────────────────┐
│                         │
│      🎤 95%             │
│                         │
│    ✨ TUYỆT VỜI! ✨     │
│                         │
│   Phát âm rất chuẩn!   │
│   Bạn nói gần như      │
│   người bản ngữ.       │
│                         │
│   [Tiếp tục clip 2 →] │
│                         │
└─────────────────────────┘

SUCCESS STATE: Good pronunciation (70-90%)
┌─────────────────────────┐
│                         │
│      🎤 78%             │
│                         │
│      Khá tốt!           │
│                         │
│   Bạn đã làm tốt.      │
│   Cần cải thiện thêm    │
│   một vài từ.          │
│                         │
│   [Tiếp tục clip 2 →] │
│                         │
└─────────────────────────┘

SUCCESS STATE: Needs improvement (50-70%)
┌─────────────────────────┐
│                         │
│      🎤 62%             │
│                         │
│     Cần cải thiện       │
│                         │
│   Hãy nghe lại audio   │
│   và thử phát âm        │
│   từng từ một.         │
│                         │
│   [Nghe audio gốc]     │
│   [Ghi âm lại]          │
│                         │
└─────────────────────────┘
```

---

## PHẦN 5: GLOBAL COMPONENTS

### 5.1 Navigation

```
MOBILE BOTTOM NAV:
┌─────────────────────────────────────┐
│  🏠       📚       📊       👤   │  ← Bottom bar
│  Home     Topics   Progress  Me   │
├─────────────────────────────────────┤
│                                     │
│         [MAIN CONTENT]              │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [🔊][🔁][◀◀] [ ▶ ] [▶▶][💾]  │  ← Audio player (sticky)
└─────────────────────────────────────┘

NAV ITEM:
├── Size: 56×56px (touch target)
├── Icon: 24×24px
├── Label: 11px
├── Active: Icon + label --accent
├── Inactive: Icon + label --text-muted
├── Badge: Notification dot (if any)
└── Spacing: Equal distribution

TABLET NAV:
├── Same as mobile
├── 4 items visible
└── Larger icons: 28×28px

DESKTOP TOP NAV:
┌─────────────────────────────────────────────────────────────┐
│ [Logo]   Topics   Progress   [Search]   [🔔] [Avatar ▼]   │
└─────────────────────────────────────────────────────────────┘

NAV LINK:
├── Font: 14px, medium
├── Color: --text-secondary (inactive), --text-primary (hover)
├── Active: --text-primary + underline
├── Hover: Color change + underline
└── Gap: 32px between items

USER MENU DROPDOWN:
├── Trigger: Avatar click
├── Items: Profile, Settings, Help, Logout
├── Width: 200px
├── Shadow: --shadow-lg
├── Border radius: --radius-lg
└── Animation: Fade + slide down
```

### 5.2 Header

```
MOBILE HEADER (Inside lesson):
┌─────────────────────────────────────┐
│ ←        Lesson 3/25         [≡]  │
└─────────────────────────────────────┘

HEADER ELEMENT:
├── Height: 56px
├── Background: --bg-primary
├── Border-bottom: 1px solid --border
├── Back button: 44×44px touch target
├── Title: 16px, semibold, center
└── Right action: Icon button

DESKTOP HEADER (App shell):
├── Height: 64px
├── Logo: Left
├── Nav: Center
├── Actions: Right
└── Sticky: Yes (on scroll)
```

### 5.3 Buttons

```
PRIMARY BUTTON:
├── Background: --accent
├── Text: White, 16px, semibold
├── Height: 48px (desktop) / 52px (mobile)
├── Padding: 0 24px
├── Border radius: --radius-lg
├── Hover: Darken 10%
├── Active: Scale 0.98
├── Disabled: Opacity 0.5, cursor not-allowed
├── Loading: Spinner + "Đang xử lý..."
└── Min width: 120px

SECONDARY BUTTON:
├── Background: --bg-primary
├── Border: 1px solid --border
├── Text: --text-primary, 16px, medium
├── Height: 48px
├── Hover: Background --bg-secondary
└── Same states as primary

GHOST BUTTON:
├── Background: Transparent
├── Text: --text-secondary, 14px, medium
├── Hover: Text --text-primary
└── No border

ICON BUTTON:
├── Size: 40×40px (desktop) / 44×44px (mobile)
├── Shape: Circle or rounded square
├── Background: --bg-secondary
├── Icon: 20×20px
├── Hover: Background --bg-primary
└── Active: Scale 0.95

BUTTON GROUP:
├── Layout: Horizontal, connected
├── Border radius: Left = first, right = last
├── Border: Shared vertical borders
└── Gap: None (seamless)
```

### 5.4 Form Inputs

```
TEXT INPUT:
├── Height: 48px
├── Background: --bg-primary
├── Border: 1px solid --border
├── Border focus: 2px solid --accent
├── Border radius: --radius-md
├── Padding: 0 16px
├── Font: 16px (prevents zoom on mobile)
├── Label: Above input, 14px, medium
├── Placeholder: --text-muted
└── Error: Border --error, message below

TEXTAREA:
├── Min height: 120px
├── Padding: 16px
├── Font: 16px
├── Resize: Vertical only
└── Same states as text input

TOGGLE SWITCH:
├── Width: 48px
├── Height: 28px
├── Background (off): --border
├── Background (on): --success
├── Thumb: 24×24px, white, circle
├── Animation: 200ms ease
└── Touch target: 48×28px

CHECKBOX:
├── Size: 20×20px
├── Border: 2px solid --border
├── Checked: Background --accent, white checkmark
├── Border radius: --radius-sm
├── Touch target: 44×44px (invisible expand)
└── Label: Right of checkbox, 16px

RADIO:
├── Size: 20×20px
├── Border: 2px solid --border
├── Selected: Border --accent, inner dot --accent
├── Border radius: --radius-full
└── Same states as checkbox
```

### 5.5 Modals & Overlays

```
MODAL:
├── Type: Centered dialog
├── Background: --bg-primary
├── Border radius: --radius-xl
├── Padding: 24px (mobile) / 32px (desktop)
├── Max width: 480px (desktop)
├── Shadow: --shadow-xl
├── Backdrop: rgba(0,0,0,0.5)
├── Animation: Fade + scale up (300ms)
└── Close: X button top-right + click outside + Escape

CONFIRM DIALOG:
├── Title: 18px, semibold
├── Message: 15px, regular, --text-secondary
├── Actions: Cancel (secondary) + Confirm (primary)
└── Destructive: Confirm button = --error

BOTTOM SHEET (Mobile):
├── Type: Slides up from bottom
├── Border radius: --radius-xl (top corners only)
├── Handle: 40×4px bar, centered, --border
├── Max height: 90vh
├── Backdrop: Semi-transparent
├── Animation: Slide up/down (300ms)
└── Swipe down: Dismiss

TOAST NOTIFICATION:
├── Position: Bottom center, 16px from bottom
├── Background: --dark (dark theme) / --bg-card (light)
├── Text: White / --text-primary
├── Border radius: --radius-lg
├── Padding: 12px 20px
├── Shadow: --shadow-lg
├── Duration: 3-5 seconds
├── Animation: Slide up + fade in
├── Types: Success (green), Error (red), Info (blue), Warning (yellow)
└── Action: Optional button

SNACKBAR (Inline):
├── Background: --bg-secondary
├── Border-radius: --radius-md
├── Padding: 12px 16px
├── Font: 14px
├── Icon: Left side
└── Action: Right side, "Retry" or "Dismiss"
```

### 5.6 Loading States

```
SKELETON LOADER:
├── Background: Linear gradient shimmer
├── Animation: Shimmer left to right, 1.5s infinite
├── Shapes: Rectangle, circle, text lines
├── Color: --bg-secondary → --bg-primary → --bg-secondary
└── Border radius: Matches target component

SPINNER:
├── Type: Circular
├── Size: 24×24px (inline) / 48×48px (full page)
├── Color: --accent
├── Animation: Rotate 360°, 1s linear infinite
└── Stroke width: 3px

PROGRESS BAR:
├── Height: 4px (inline) / 8px (page)
├── Background: --bg-secondary
├── Fill: --accent
├── Animation: Width transition 300ms
└── Indeterminate: Shimmer animation

PULSE:
├── Background: --accent (at 0.2 opacity)
├── Animation: Scale 1 → 1.1 → 1, opacity 0.2 → 0 → 0.2
├── Duration: 1.5s, infinite
└── Usage: Loading indicators, button states

PAGE LOADING:
├── Full page skeleton
├── Header skeleton
├── Content area skeleton (3-4 blocks)
└── Smooth fade in when loaded

CONTENT SKELETON:
┌─────────────────────────┐
│ ████████████████████   │  ← Title
│ ██████████████         │  ← Subtitle
│                         │
│ ████████████████████   │  ← Paragraph 1
│ ████████████████████   │
│ ████████████           │
│                         │
│ ████████████████       │  ← Paragraph 2
│ ████████████████████   │
│ ████████████           │
└─────────────────────────┘
```

### 5.7 Accessibility Guidelines

```
FOCUS MANAGEMENT:
├── Visible focus ring: 2px solid --accent, 2px offset
├── Focus trap in modals
├── Focus first interactive element on open
├── Return focus on close
└── Skip links for navigation

COLOR CONTRAST:
├── Text on background: Minimum 4.5:1 (AA)
├── Large text (18px+): Minimum 3:1
├── UI components: Minimum 3:1
└── Interactive elements: Minimum 3:1

TOUCH TARGETS:
├── Minimum size: 44×44px
├── Adequate spacing: 8px between targets
└── No overlap

SCREEN READER:
├── Semantic HTML (button, nav, main, section)
├── aria-labels on icons
├── aria-live for dynamic content
├── aria-describedby for instructions
├── Role attributes where needed
└── Announce loading/error states

REDUCED MOTION:
├── Respect prefers-reduced-motion
├── Disable animations if set
├── Keep essential state changes
└── Test both states

KEYBOARD NAVIGATION:
├── All interactive elements focusable
├── Logical tab order
├── Enter/Space to activate
├── Escape to close modals
├── Arrow keys for radio groups
└── Visible focus indicators
```

---

## PHẦN 6: ERROR & EMPTY STATES — MASTER LIST

### 6.1 Error States

```
NETWORK ERROR (Generic):
┌─────────────────────────┐
│     📡                  │
│                         │
│   Không có kết nối.   │
│   Kiểm tra mạng và     │
│   thử lại.             │
│                         │
│   [Thử lại]            │
│                         │
└─────────────────────────┘

SERVER ERROR (500):
┌─────────────────────────┐
│     ⚠️                  │
│                         │
│   Đã xảy ra lỗi.       │
│   Chúng tôi đang       │
│   khắc phục.           │
│                         │
│   [Thử lại sau]        │
│                         │
└─────────────────────────┘

UNAUTHORIZED (401):
┌─────────────────────────┐
│     🔒                  │
│                         │
│   Vui lòng đăng nhập   │
│   để tiếp tục.         │
│                         │
│   [Đăng nhập]          │
│                         │
└─────────────────────────┘

FORBIDDEN (403):
┌─────────────────────────┐
│     🚫                  │
│                         │
│   Bạn không có quyền   │
│   truy cập trang này.  │
│                         │
│   [Quay lại home]      │
│                         │
└─────────────────────────┘

NOT FOUND (404):
┌─────────────────────────┐
│     🔍                  │
│                         │
│   Không tìm thấy       │
│   trang này.           │
│                         │
│   [Về trang chủ]       │
│                         │
└─────────────────────────┘

RATE LIMIT (429):
┌─────────────────────────┐
│     ⏳                  │
│                         │
│   Quá nhiều yêu cầu.   │
│   Vui lòng chờ một     │
│   chút và thử lại.     │
│                         │
│   Thử lại sau 30 giây  │
│                         │
└─────────────────────────┘

TIMEOUT:
┌─────────────────────────┐
│     ⏱️                  │
│                         │
│   Yêu cầu hết thời    │
│   gian. Kiểm tra mạng  │
│   và thử lại.          │
│                         │
│   [Thử lại]            │
│                         │
└─────────────────────────┘

DEVICE NOT SUPPORTED:
┌─────────────────────────┐
│     📱❌                 │
│                         │
│   Thiết bị không        │
│   được hỗ trợ.         │
│                         │
│   Vui lòng dùng        │
│   Chrome, Safari,       │
│   hoặc Edge.           │
│                         │
└─────────────────────────┘
```

### 6.2 Empty States

```
EMPTY: No lessons in topic
┌─────────────────────────┐
│     📚                  │
│                         │
│   Chưa có bài học     │
│   trong topic này.     │
│                         │
│   [Khám phá topic khác]│
│                         │
└─────────────────────────┘

EMPTY: No search results
┌─────────────────────────┐
│     🔍                  │
│                         │
│   Không tìm thấy       │
│   kết quả phù hợp.     │
│                         │
│   Thử từ khóa khác     │
│   hoặc xóa bộ lọc.    │
│                         │
│   [Xóa bộ lọc]        │
│                         │
└─────────────────────────┘

EMPTY: No history
┌─────────────────────────┐
│     📝                  │
│                         │
│   Chưa có lịch sử     │
│   học tập.             │
│                         │
│   Bắt đầu học ngay!    │
│                         │
│   [Chọn topic]         │
│                         │
└─────────────────────────┘

EMPTY: No progress data
┌─────────────────────────┐
│     📊                  │
│                         │
│   Chưa có dữ liệu     │
│   tiến độ.             │
│                         │
│   Hoàn thành bài đầu   │
│   tiên để xem thống   │
│   kê của bạn.          │
│                         │
│   [Bắt đầu học]       │
│                         │
└─────────────────────────┘

EMPTY: No streak data
┌─────────────────────────┐
│     🔥                  │
│                         │
│   Bắt đầu streak       │
│   của bạn hôm nay!     │
│                         │
│   Học 1 bài để        │
│   bắt đầu ngày 1.     │
│                         │
│   [Chọn topic]         │
│                         │
└─────────────────────────┘

EMPTY: No recordings
┌─────────────────────────┐
│     🎤                  │
│                         │
│   Chưa có bản ghi      │
│   âm nào.               │
│                         │
│   Thực hành phát âm    │
│   để xem tiến độ.      │
│                         │
└─────────────────────────┘

EMPTY: No bookmarks
┌─────────────────────────┐
│     ⭐                  │
│                         │
│   Chưa có bookmark     │
│   nào.                  │
│                         │
│   Lưu bài học yêu      │
│   thích để xem lại.    │
│                         │
│   [Khám phá topics]    │
│                         │
└─────────────────────────┘
```

### 6.3 Success States

```
SUCCESS: Lesson completed
┌─────────────────────────┐
│     🎉                  │
│                         │
│   Hoàn thành!          │
│   Bạn đã làm tốt!      │
│                         │
│   Accuracy: 85%         │
│   XP: +85               │
│                         │
│   [Bài tiếp theo]      │
│                         │
└─────────────────────────┘

SUCCESS: Streak milestone
┌─────────────────────────┐
│     🔥                  │
│                         │
│   7 NGÀY STREAK!       │
│                         │
│   Bạn đang tạo thói   │
│   quen học tập.        │
│                         │
│   Tiếp tục giữ streak! │
│                         │
└─────────────────────────┘

SUCCESS: First lesson
┌─────────────────────────┐
│     🌟                  │
│                         │
│   Chào mừng bạn mới!  │
│                         │
│   Bạn đã hoàn thành    │
│   bài đầu tiên.        │
│                         │
│   [Tiếp tục học]      │
│                         │
└─────────────────────────┘

SUCCESS: Recording saved
┌─────────────────────────┐
│     ✅                  │
│                         │
│   Đã lưu recording!    │
│                         │
│   Bạn có thể nghe      │
│   lại bất kỳ lúc nào.  │
│                         │
│   [Xem kết quả]        │
│                         │
└─────────────────────────┘

SUCCESS: Progress saved
┌─────────────────────────┐
│                         │
│   ✓ Đã lưu              │
│                         │
│   Tiến độ của bạn       │
│   được lưu tự động.    │
│                         │
└─────────────────────────┘

SUCCESS: Sign up
┌─────────────────────────┐
│     ✨                  │
│                         │
│   Đăng ký thành công!  │
│                         │
│   Chào mừng đến        │
│   VinaListen!           │
│                         │
│   [Bắt đầu học]       │
│                         │
└─────────────────────────┘
```

---

## APPENDIX: COMPONENT STATES SUMMARY

### Buttons
```
PRIMARY:
├── Default: --accent bg, white text
├── Hover: Darker --accent, lift shadow
├── Active: Scale 0.98
├── Loading: Spinner, "Đang xử lý..."
├── Disabled: Opacity 0.5, cursor not-allowed

SECONDARY:
├── Default: --bg-primary bg, --border
├── Hover: --bg-secondary bg
├── Active: Scale 0.98
├── Disabled: Opacity 0.5

GHOST:
├── Default: Transparent bg
├── Hover: --bg-secondary bg
├── Active: Scale 0.98
```

### Inputs
```
TEXT INPUT:
├── Default: --border
├── Focus: --accent border, shadow
├── Error: --error border, error message
├── Disabled: --bg-secondary bg, muted text
├── Read-only: Same as disabled

TEXTAREA:
├── Same states as text input
├── Auto-grow: Height increases with content
```

### Cards
```
TOPIC CARD:
├── Default: --bg-card, --border
├── Hover: Shadow lift, --accent border
├── Active: Scale 0.98
├── Disabled: Opacity 0.5
├── Loading: Skeleton state

LESSON CARD:
├── Default: --bg-card, --border
├── Completed: Green left border, checkmark
├── Current: Orange left border, dot indicator
├── Locked: Gray, lock icon
```

### Audio Player
```
IDLE:
├── Play button visible
├── Progress bar empty
├── Time: 0:00 / duration

PLAYING:
├── Pause button visible
├── Progress bar animating
├── Time: Current / total
├── Waveform: Active visualization

PAUSED:
├── Play button visible
├── Progress bar static
├── Time: Paused at current position

LOADING:
├── Spinner in play button area
├── Progress bar empty
├── Time: -- : --

ERROR:
├── Error icon
├── "Audio không tải được"
├── Retry button
```

### Recording
```
READY:
├── Large mic button
├── "Bắt đầu ghi âm"
├── Expected sentence visible

RECORDING:
├── Red stop button (animated pulse)
├── Live waveform
├── Timer counting up
├── Max time indicator

RECORDED:
├── Play + Re-record buttons
├── Static waveform
├── Duration shown
├── "Xem kết quả" button

PROCESSING:
├── Spinner
├── "Đang xử lý..."
├── Disabled buttons

ERROR:
├── Error icon + message
├── Retry button
├── Skip option
```

---

*Document End — VinaListen UX Specification v1.0*
