/**
 * Cloudinary Onboarding Verification Script
 * -----------------------------------------
 * Run: node scripts/cloudinary-onboarding.mjs
 *
 * This is a one-file smoke test that proves the Cloudinary integration works.
 * It uses the same @cloudinary/url-gen SDK that the React app will use.
 */

import { v2 as cloudinary } from 'cloudinary';
import { Cloudinary } from '@cloudinary/url-gen';
import { Actions } from '@cloudinary/url-gen';

// ============================================================
// STEP 1 — Configure Cloudinary (inline credentials)
// ============================================================
cloudinary.config({
  cloud_name: 'depcpvfwg',
  api_key: '693482347243783',
  api_secret: 'bBxwUCEzu1XWX4RERe5zSnhmbyg',
  secure: true,
});

const cld = new Cloudinary({
  cloud: { cloudName: 'depcpvfwg' },
  url: { secure: true },
});

console.log('--------------------------------------------------');
console.log('Cloudinary Onboarding — Verification');
console.log('--------------------------------------------------');
console.log('Cloud name :', cloudinary.config().cloud_name);
console.log('API key    :', cloudinary.config().api_key);
console.log('--------------------------------------------------\n');

// ============================================================
// STEP 2 — Upload a sample image
// ============================================================
console.log('STEP 2: Uploading sample image...\n');

const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

let uploadResult;
try {
  uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
    folder: 'onboarding',
    public_id: `onboarding_sample_${Date.now()}`,
    overwrite: true,
    resource_type: 'image',
  });

  console.log('Upload successful!');
  console.log('  secure_url :', uploadResult.secure_url);
  console.log('  public_id  :', uploadResult.public_id);
  console.log('  format     :', uploadResult.format);
  console.log('  width      :', uploadResult.width);
  console.log('  height     :', uploadResult.height);
  console.log('  bytes      :', uploadResult.bytes, '\n');
} catch (err) {
  console.error('Upload failed:', err.message);
  process.exit(1);
}

// ============================================================
// STEP 3 — Get image details
// ============================================================
console.log('STEP 3: Fetching image details from Cloudinary...\n');

try {
  const details = await cloudinary.api.resource(uploadResult.public_id, {
    resource_type: 'image',
  });

  console.log('Image metadata:');
  console.log('  width  :', details.width, 'px');
  console.log('  height :', details.height, 'px');
  console.log('  format :', details.format);
  console.log('  size   :', details.bytes, 'bytes');
  console.log('  url    :', details.secure_url, '\n');
} catch (err) {
  console.error('Details fetch failed:', err.message);
  process.exit(1);
}

// ============================================================
// STEP 4 — Transform the image (f_auto + q_auto) with responsive breakpoints
// --------------------------------------------------------------------
// f_auto  -> Cloudinary auto-selects the best format (WebP/AVIF/JPEG) for the browser
// q_auto  -> Cloudinary auto-adjusts quality to the lowest acceptable level (perceptually)
// c_limit -> Scale down to fit within the given width/height, preserving aspect ratio
// We build three pre-baked URLs (desktop / tablet / mobile) so the React app can pick
// the right one with <picture srcset> or background-image, and also one "auto" URL
// that uses Cloudinary client-hints + dpr auto for fully responsive delivery.
const breakpoints = [
  { label: 'desktop', w: 1920, h: 1080 },
  { label: 'tablet',  w: 1024, h: 1024 },
  { label: 'mobile',  w: 480,  h: 480  },
];

const buildTransformedUrl = (publicId, { w, h }) => {
  const img = cld.image(publicId);
  // Actions.Resize.limitFit() produces c_limit, and its instance supports .width()/.height() chains.
  img.format('auto')
    .quality('auto')
    .resize(Actions.Resize.limitFit().width(w).height(h));
  return img.toURL();
};

const responsiveUrls = breakpoints.map((bp) => ({
  ...bp,
  url: buildTransformedUrl(uploadResult.public_id, bp),
}));

// One URL that uses Cloudinary's responsive runtime (w_auto / dpr_auto / c_limit / f_auto / q_auto).
// When the requesting browser sends Accept-CH and DPR headers, Cloudinary returns the
// optimal variant automatically. For a static demo this is included as a reference.
const autoImage = cld.image(uploadResult.public_id);
autoImage
  .format('auto')
  .quality('auto')
  .resize(Actions.Resize.limitFit().width('auto').height('auto'));
const autoUrl = autoImage.toURL();

console.log('Transformation applied:');
console.log('  f_auto  -> automatic format (WebP/AVIF/JPEG)');
console.log('  q_auto  -> automatic quality optimization');
console.log('  c_limit -> fit within w x h, preserve aspect ratio\n');

const transformedUrl = responsiveUrls[0].url; // kept for any external consumers

console.log('Done! Click the links below to see the optimized versions.');
console.log('Compare size and format in DevTools > Network tab.');
console.log('--------------------------------------------------\n');

console.log('Original URL :', uploadResult.secure_url, '\n');

console.log('Responsive variants (pre-baked):');
for (const r of responsiveUrls) {
  console.log(`  ${r.label.padEnd(7)} (${r.w}x${r.h})`);
  console.log(`     ${r.url}`);
}
console.log('\nAuto (client-hints, dpr_auto):');
console.log('  ', autoUrl);
