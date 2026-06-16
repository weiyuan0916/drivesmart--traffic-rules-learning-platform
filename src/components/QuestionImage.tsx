import { useMemo } from 'react';
import type React from 'react';

/**
 * Static Cloudinary URLs we use across widths.
 *
 * We deliberately avoid `@cloudinary/react`'s `AdvancedImage` + plugins
 * (responsive, placeholder, lazyload) because they call `toURL()` on every
 * render, and `toURL()` injects a per-call analytics signature (`_a=...`) that
 * changes the rendered string even when nothing else did. React then sees a
 * different `src` and patches the DOM, which makes the browser re-fetch the
 * image and the user sees a flicker. This was the root cause of the image
 * "flickering" bug.
 *
 * We just hand-write a tiny srcset with stable URLs and let the browser
 * pick the right one. `loading="lazy"` and `decoding="async"` give us the
 * performance benefits we actually need.
 */
const CLOUD_NAME = 'depcpvfwg';
const FOLDER = 'cau-600';

function publicIdFromQuestionId(id: number): string {
  return `cau_${String(id).padStart(3, '0')}`;
}

/**
 * Build a Cloudinary URL for a question image.
 *
 * - `c_fill,g_auto,h_900,w_1200` — match the design's 4:3 frame, auto-gravity
 *   so the subject stays in frame for any aspect ratio
 * - `f_auto,q_auto` — Cloudinary picks WebP/AVIF and the right quality per device
 * - `w_<width>` parameter is set per call (so we can build a srcset)
 */
function buildUrl(publicId: string, width: number): string {
  // Note: the order of transform segments is fixed so the URL is stable
  // across renders. We never append the `_a=...` analytics signature.
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,g_auto,h_900,w_1200/f_auto,q_auto/c_scale,w_${width}/v1/${FOLDER}/${publicId}`;
}

export interface QuestionImageProps {
  /** Question id, e.g. 37 -> public_id "cau_037" */
  questionId: number;
  /** Alt text; defaults to "Hình minh họa" */
  alt?: string;
  /** Extra className applied to the underlying <img> */
  className?: string;
}

export const QuestionImage: React.FC<QuestionImageProps> = ({
  questionId,
  alt = 'Hình minh họa',
  className,
}) => {
  // useMemo so the srcset array is referentially stable for the same questionId.
  // Even if the parent re-renders every second (timer tick), React won't
  // generate new DOM attributes and the browser won't re-fetch.
  const publicId = publicIdFromQuestionId(questionId);
  const src = useMemo(() => buildUrl(publicId, 1200), [publicId]);
  const srcSet = useMemo(
    () => [400, 800, 1200, 1600].map((w) => `${buildUrl(publicId, w)} ${w}w`).join(', '),
    [publicId],
  );

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes="(max-width: 1024px) 100vw, 50vw"
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
};
