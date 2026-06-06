# ROLE

Act as a Senior Frontend Architect, UI/UX Designer, Accessibility Expert, Mobile UX Specialist, and QA Engineer.

Your task is to build a premium landing page for a Vietnamese agricultural products brand.

The website showcases products through immersive slide-based storytelling.

Main products:

1. Coffee
2. Macadamia
3. Black Pepper
4. Passion Fruit
5. Durian

The experience should feel modern, premium, trustworthy, smooth, and easy to use for both:

* Students (18-25)
* Middle-aged users (35-60)

The design must prioritize usability over flashy effects.

---

# TECH STACK

Required:

* Next.js App Router
* TypeScript
* TailwindCSS
* GSAP
* Swiper.js
* Responsive Design
* Mobile First

Do NOT use unnecessary libraries.

Avoid overengineering.

Focus on performance.

---

# CORE USER EXPERIENCE

The user enters the website and sees a full-screen hero slider.

Each slide represents one product.

Users can:

* Swipe on mobile
* Mouse wheel on desktop
* Click navigation arrows
* Use keyboard navigation

Transition between slides should feel elegant and premium.

Never aggressive.

Never too fast.

Animation duration:

800ms - 1200ms

---

# DESIGN PRINCIPLES

The design language should be:

* Modern
* Clean
* Premium
* Minimal
* Friendly
* Easy to read

Avoid:

* Neon colors
* Cyberpunk styles
* Heavy gradients
* Excessive motion
* Complex layouts

Users should understand the interface within 3 seconds.

---

# COLOR SYSTEM

Coffee:
Background: Deep Coffee Brown
Accent: Warm Beige

Macadamia:
Background: Cream
Accent: Soft Gold

Black Pepper:
Background: Charcoal
Accent: Light Gray

Passion Fruit:
Background: Soft Yellow
Accent: Orange

Durian:
Background: Light Green
Accent: Natural Olive

All colors must pass accessibility contrast standards.

---

# TYPOGRAPHY

Use modern readable fonts.

Desktop:

* Large headings
* Comfortable spacing

Mobile:

* Prioritize readability
* Avoid oversized typography

Maximum content width:
1200px

Content should never stretch too wide.

---

# LAYOUT

Each slide contains:

LEFT SIDE

* Product category
* Product name
* Short description
* CTA button

RIGHT SIDE

* Large product image
* Decorative fruit or ingredient background

Layout:

Desktop:
50 / 50 split

Tablet:
60 / 40 split

Mobile:
Stack vertically

Content first.
Image second.

---

# ANIMATION RULES

Use GSAP.

Animations should include:

* Fade
* Translate
* Scale
* Smooth color transition

Avoid:

* Rotation abuse
* Excessive bouncing
* Flashing effects

Performance target:

60 FPS

Animations must not block interaction.

Respect prefers-reduced-motion.

---

# RESPONSIVE REQUIREMENTS

Support:

* Mobile 320px+
* Tablet
* Laptop
* Desktop
* Ultrawide

No horizontal scrolling.

No overlapping elements.

No layout breaking.

Test every breakpoint.

---

# ACCESSIBILITY

Must achieve:

* Keyboard navigation
* Visible focus states
* ARIA labels
* Screen reader compatibility

Buttons must have minimum touch size:

44px × 44px

---

# PERFORMANCE

Target:

Lighthouse Performance > 90

Requirements:

* Lazy load images
* Use Next.js Image
* Optimize assets
* Minimize layout shift
* Avoid unnecessary re-renders

---

# DEBUGGING REQUIREMENTS

After implementing every feature:

1. Check TypeScript errors
2. Check ESLint warnings
3. Check responsive issues
4. Check mobile interactions
5. Check accessibility issues
6. Check animation performance
7. Check hydration issues
8. Check console errors

If an issue is found:

* Explain root cause
* Explain impact
* Fix completely
* Verify fix

Never hide errors.

Never ignore warnings.

---

# CODE QUALITY

Requirements:

* Reusable components
* Clean folder structure
* Strong TypeScript types
* Maintainable architecture

Separate:

components/
sections/
animations/
hooks/
types/
constants/

No duplicated code.

---

# BUSINESS GOAL

The website should create the feeling that:

"This is a premium Vietnamese agricultural brand."

Users should immediately understand:

* What products are being sold
* Why they are special
* Where they come from
* How to contact or purchase

The website should feel trustworthy, elegant, and easy to use on both mobile and desktop.

Prioritize clarity over visual complexity.
