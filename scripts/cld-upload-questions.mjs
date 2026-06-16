/**
 * scripts/cld-upload-questions.mjs
 * ---------------------------------------------------------------------------
 * One-time migration: upload the 314 question images referenced by
 * bo-600-cau-hoi.json (paths like "images/cau_037.jpg") to Cloudinary under
 * folder "cau-600/", preserving the basename as the public_id.
 *
 * Why this script (not a manual drag-drop):
 *   - 314 files is too many to upload by hand
 *   - We need stable public_ids so the React app can build deterministic URLs
 *   - We need to know exactly which files were skipped/duplicated on Cloudinary
 *
 * Idempotency:
 *   - For every file we call the Admin API to check existence first.
 *   - If already present, we skip and do NOT re-upload (preserves any
 *     existing eager transformations / face-detection derived assets).
 *   - On upload we use the basename without extension as the public_id
 *     (cau-600/cau_037) and let Cloudinary auto-pick format (f_auto).
 *
 * Concurrency:
 *   - 8 parallel uploads (Cloudinary's free tier is fine with this and the
 *     local disk is the bottleneck, not the network).
 *   - Per-file retry up to 3x with exponential backoff on network errors.
 *
 * Run:
 *   node scripts/cld-upload-questions.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

// ---- Config (same as cloudinary-onboarding.mjs) ---------------------------
cloudinary.config({
  cloud_name: 'depcpvfwg',
  api_key: '693482347243783',
  api_secret: 'bBxwUCEzu1XWX4RERe5zSnhmbyg',
  secure: true,
});

const CLOUDINARY_FOLDER = 'cau-600';
const CONCURRENCY = 8;
const RETRIES = 3;

// ---- Step 1: collect referenced images from JSON --------------------------
const jsonPath = 'bo-600-cau-hoi.json';
const imagesDir = 'images';
const raw = await fs.readFile(jsonPath, 'utf8');
const data = JSON.parse(raw);

const referenced = [
  ...new Set(data.filter((q) => typeof q.image === 'string').map((q) => q.image)),
];
console.log(`[1/3] Found ${referenced.length} unique image references in ${jsonPath}`);

// ---- Step 2: verify files exist locally -----------------------------------
const localFiles = await fs.readdir(imagesDir);
const localSet = new Set(localFiles.map((f) => f.toLowerCase()));

const todo = [];
const missing = [];
for (const ref of referenced) {
  const basename = path.basename(ref);
  if (localSet.has(basename.toLowerCase())) {
    todo.push(basename);
  } else {
    missing.push(ref);
  }
}
console.log(
  `[2/3] ${todo.length} files present locally, ${missing.length} missing`,
);
if (missing.length) {
  console.log('  Missing (first 10):', missing.slice(0, 10));
}

// ---- Step 3: check which ones are already on Cloudinary -------------------
const dryRun = process.argv.includes('--dry-run');
const existing = new Set();
if (!dryRun) {
  const PAGE = 100;
  let nextCursor;
  do {
    const page = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${CLOUDINARY_FOLDER}/`,
      max_results: PAGE,
      next_cursor: nextCursor,
    });
    for (const r of page.resources) {
      existing.add(path.basename(r.public_id).toLowerCase());
    }
    nextCursor = page.next_cursor;
  } while (nextCursor);
}

console.log(
  `[3/3] ${existing.size} files already on Cloudinary under ${CLOUDINARY_FOLDER}/`,
);

// ---- Helper: upload with retry --------------------------------------------
async function uploadOne(basename) {
  const localPath = path.join(imagesDir, basename);
  const publicId = path.basename(basename, path.extname(basename)); // "cau_037"
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await cloudinary.uploader.upload(localPath, {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        overwrite: false,
        invalidate: false,
        use_filename: false,
        unique_filename: false,
      });
      return { ok: true, publicId: res.public_id, bytes: res.bytes };
    } catch (err) {
      lastErr = err;
      // If the asset already exists under a different etag we treat it as success
      const msg = err?.error?.message || err?.message || '';
      if (msg.includes('already exists')) {
        return { ok: true, publicId: `${CLOUDINARY_FOLDER}/${publicId}`, already: true };
      }
      const backoff = 500 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  return { ok: false, publicId: `${CLOUDINARY_FOLDER}/${publicId}`, err: lastErr };
}

// ---- Worker pool ----------------------------------------------------------
const queue = todo.filter((b) => !existing.has(b.toLowerCase()));

if (dryRun) {
  console.log(`\n[DRY-RUN] Would upload ${queue.length} files. First 10:`);
  for (const b of queue.slice(0, 10)) {
    console.log(`  - ${b} -> ${CLOUDINARY_FOLDER}/${path.basename(b, path.extname(b))}`);
  }
  if (queue.length > 10) console.log(`  ... and ${queue.length - 10} more`);
  process.exit(0);
}
console.log(`\nUploading ${queue.length} new files (concurrency ${CONCURRENCY})...\n`);

let done = 0;
let succeeded = 0;
let failed = 0;
const failures = [];

async function worker() {
  while (queue.length) {
    const basename = queue.shift();
    const result = await uploadOne(basename);
    done++;
    if (result.ok) {
      succeeded++;
      if (succeeded % 25 === 0 || succeeded === queue.length) {
        console.log(`  ${succeeded}/${queue.length} uploaded (${basename})`);
      }
    } else {
      failed++;
      failures.push({ basename, err: result.err?.message || String(result.err) });
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

console.log('\n--------------------------------------------------');
console.log('Upload summary');
console.log('--------------------------------------------------');
console.log(`Total referenced : ${referenced.length}`);
console.log(`Present locally   : ${todo.length}`);
console.log(`Already on CLoud  : ${existing.size}`);
console.log(`Uploaded (new)    : ${succeeded}`);
console.log(`Failed            : ${failed}`);
if (failures.length) {
  console.log('\nFailures:');
  for (const f of failures.slice(0, 20)) {
    console.log(`  - ${f.basename}: ${f.err}`);
  }
}
