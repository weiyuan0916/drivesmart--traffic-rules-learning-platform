/**
 * No-op provider — Lenis integration requires the scroll container
 * to be at the body/html level, which conflicts with the existing
 * `overflow-hidden` App wrapper used by the exam modules.
 *
 * Native CSS `scroll-behavior: smooth` (set in index.css) handles
 * smooth scrolling for the homepage instead. This is actually better
 * for performance, accessibility, and avoids Lenis conflicts with
 * the fixed-position exam UI.
 *
 * If Lenis is desired in the future, move it to a top-level wrapper
 * above App.tsx (e.g. in index.html or via a custom entry point).
 */
export function LenisProvider() {
  return null;
}
