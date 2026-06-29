# Code Removal Process — BBC Lesson Detail Page

This document records the step-by-step process used to safely remove the `BbcLessonDetailPage` from the DriveSmart codebase.

---

## Overview

**Goal:** Remove the BBC Lesson Detail page (`/listening/bbc/:slug`) and all its references, while preserving the navigation flow between the BBC Lesson List and Practice pages.

**Why:** The lesson list already navigated directly to the practice page, making the intermediate detail page redundant.

---

## Navigation Flow (Before)

```
BBC Lesson List → BBC Lesson Detail → BBC Practice → BBC Lesson Detail
                   ↑__________________|                    |
                                     (Back)                (Back)
```

## Navigation Flow (After)

```
BBC Lesson List → BBC Practice → BBC Lesson List
                   (Back)
Workspace → BBC Lesson List
Dictation → BBC Lesson List
```

---

## Step-by-Step Process

### Step 1 — Audit: Identify All References

Search the entire codebase for references to the component and view name:

```bash
grep -r "BbcLessonDetailPage" src/
grep -r "bbc-detail" src/
```

**Files found:**
- `src/types/listening.ts` — `ListeningView` type
- `src/components/listening/ListeningModule.tsx` — import, `isBbcView`, `urlToNavState`, `viewToPath`, `handleBack`, `renderPage`
- `src/features/listening/pages/bbc/BbcPracticePage.tsx` — `goBack` function
- `src/features/listening/pages/bbc/BbcWorkspacePage.tsx` — `goBack` function
- `src/features/listening/pages/bbc/BbcMicroDictationPage.tsx` — `goBack` function (already correct)
- `src/features/listening/AppRouter.tsx` — import and route
- `src/features/listening/pages/bbc/BbcSEO.tsx` — SEO component

### Step 2 — Update the Type Definition

**File:** `src/types/listening.ts`

Remove `'bbc-detail'` from the `ListeningView` union type.

```typescript
// Before
export type ListeningView =
  | 'overview'
  | ...
  | 'bbc-list'
  | 'bbc-detail'
  | 'bbc-practice'
  ...

// After
export type ListeningView =
  | 'overview'
  | ...
  | 'bbc-list'
  | 'bbc-practice'
  ...
```

### Step 3 — Update ListeningModule.tsx

This is the most critical file. Remove all references:

1. **Remove lazy import:**
   ```typescript
   // Before
   const BbcLessonListPage = React.lazy(() => import('../../features/listening/pages/bbc/BbcLessonListPage'));
   const BbcLessonDetailPage = React.lazy(() => import('../../features/listening/pages/bbc/BbcLessonDetailPage'));
   const BbcPracticePage = React.lazy(() => import('../../features/listening/pages/bbc/BbcPracticePage'));

   // After
   const BbcLessonListPage = React.lazy(() => import('../../features/listening/pages/bbc/BbcLessonListPage'));
   const BbcPracticePage = React.lazy(() => import('../../features/listening/pages/bbc/BbcPracticePage'));
   ```

2. **Remove from `isBbcView` helper:**
   ```typescript
   // Before
   const isBbcView = (view: ListeningView) =>
     view === 'bbc-list' || view === 'bbc-detail' || view === 'bbc-practice' || view === 'bbc-workspace' || view === 'bbc-dictation';

   // After
   const isBbcView = (view: ListeningView) =>
     view === 'bbc-list' || view === 'bbc-practice' || view === 'bbc-workspace' || view === 'bbc-dictation';
   ```

3. **Update `urlToNavState` — remove the detail page URL match:**
   ```typescript
   // Before
   const bbcDetailMatch = pathname.match(/^\/listening\/bbc\/([^/]+)$/);
   if (bbcDetailMatch) {
     return { currentView: 'bbc-detail', topicSlug: bbcDetailMatch[1] };
   }

   // After — remove the entire block (keep only /listening/bbc)
   if (/^\/listening\/bbc$/.test(pathname)) {
     return { currentView: 'bbc-list' };
   }
   ```

4. **Remove from `viewToPath`:**
   ```typescript
   // Before
   case 'bbc-list': return '/listening/bbc';
   case 'bbc-detail': return `/listening/bbc/${extra?.topicSlug}`;
   case 'bbc-practice': return `/listening/bbc/${extra?.topicSlug}/learn`;

   // After
   case 'bbc-list': return '/listening/bbc';
   case 'bbc-practice': return `/listening/bbc/${extra?.topicSlug}/learn`;
   ```

5. **Update `handleBack` — redirect to `bbc-list` instead of `bbc-detail`:**
   ```typescript
   // Before
   else if (nav.currentView === 'bbc-detail') navigate('bbc-list');
   else if (nav.currentView === 'bbc-practice') navigate('bbc-detail');
   else if (nav.currentView === 'bbc-workspace' || nav.currentView === 'bbc-dictation') navigate('bbc-detail');

   // After
   else if (nav.currentView === 'bbc-practice') navigate('bbc-list');
   else if (nav.currentView === 'bbc-workspace' || nav.currentView === 'bbc-dictation') navigate('bbc-list');
   ```

6. **Remove the `bbc-detail` case from `renderPage`:**
   ```tsx
   // Remove this entire case block:
   case 'bbc-detail':
     return (
       <QueryClientProvider client={bbcQueryClient}>
         <React.Suspense fallback={<Skeleton />}>
           <BbcLessonDetailPage
             topicSlug={nav.topicSlug}
             onNavigate={(view, extra) => {
               navigate(view as ListeningView, { topicSlug: extra?.slug as string ?? undefined, dictationLesson: extra?.lesson as unknown as BbcLesson });
             }}
           />
         </React.Suspense>
       </QueryClientProvider>
     );
   ```

### Step 4 — Update Child Page Navigation

Update `goBack` functions in all BBC child pages to navigate to `bbc-list`:

**BbcPracticePage.tsx:**
```typescript
// Before
const goBack = () => {
  navCtx('bbc-detail' as ListeningView, { topicSlug: lessonSlug })
}

// After
const goBack = () => {
  navCtx('bbc-list' as ListeningView)
}
```

**BbcWorkspacePage.tsx:**
```typescript
// Before
const goBack = () => {
  if (onNavigate) onNavigate('bbc-detail', { slug: lessonSlug })
  else navigate(`/listening/bbc/${lessonSlug}`)
}

// After
const goBack = () => {
  if (onNavigate) onNavigate('bbc-list')
  else navigate('/listening/bbc')
}
```

**BbcMicroDictationPage.tsx:** Already uses `onNavigate('bbc-list')` — no changes needed.

### Step 5 — Update AppRouter.tsx (Unused but cleanup)

```typescript
// Remove the import
const BbcLessonDetailPage = lazy(() => import('./pages/bbc/BbcLessonDetailPage'))

// Remove the route
<Route
  path="/bbc/:slug"
  element={
    <Suspense fallback={<PageLoader />}>
      <BbcDarkThemeShell>
        <BbcLessonDetailPage />
      </BbcDarkThemeShell>
    </Suspense>
  }
/>
```

### Step 6 — Remove SEO Component

**File:** `src/features/listening/pages/bbc/BbcSEO.tsx`

Remove the `BbcSEODetail` interface and component (lines 67–130).

### Step 7 — Delete the Component File

Delete the main component file:
```
src/features/listening/pages/bbc/BbcLessonDetailPage.tsx
```

### Step 8 — Verify

1. **TypeScript compilation:**
   ```bash
   npx tsc --noEmit
   ```
   - Check for new errors related to the removal
   - Ignore pre-existing errors

2. **Verify no remaining references:**
   ```bash
   grep -r "BbcLessonDetailPage" src/
   grep -r "bbc-detail" src/
   ```
   - Both should return no results

3. **Manual QA:**
   - Navigate to BBC Lesson List
   - Click on a lesson card — should go directly to Practice
   - Click Back — should return to BBC Lesson List
   - Navigate to Workspace/Dictation
   - Click Back — should return to BBC Lesson List

---

## Checklist

- [x] Audit all references
- [x] Update type definition
- [x] Remove lazy import in ListeningModule
- [x] Remove from `isBbcView` helper
- [x] Remove/update `urlToNavState` URL mapping
- [x] Remove from `viewToPath`
- [x] Update `handleBack` navigation
- [x] Remove `bbc-detail` case from `renderPage`
- [x] Update `goBack` in BbcPracticePage
- [x] Update `goBack` in BbcWorkspacePage
- [x] Update AppRouter.tsx (import + route)
- [x] Remove BbcSEODetail from BbcSEO.tsx
- [x] Delete BbcLessonDetailPage.tsx
- [x] Verify TypeScript compilation
- [x] Verify no remaining references
- [x] Manual QA

---

## Key Principles

1. **Audit first.** Find all references before making changes.
2. **Update types first.** Types are the source of truth.
3. **Update navigation last.** Ensure all pages redirect correctly.
4. **Verify at each step.** Don't wait until the end to check for errors.
5. **Delete as the last step.** Keep the file until all references are removed.
6. **Test manually.** TypeScript can pass but logic can still be broken.
