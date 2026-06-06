import { chromium } from 'playwright';

function readArg(name, defaultValue) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return defaultValue;
  const val = process.argv[idx + 1];
  if (val === undefined) return defaultValue;
  return val;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom(rng, arr) {
  if (!arr.length) throw new Error('pickRandom: empty array');
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

async function startExamIfNeeded(page) {
  const question1 = page.locator('[aria-label="Question 1"]');
  const hasQuestion1 = (await question1.count()) > 0;
  if (hasQuestion1) return;

  const verifyBtn = page.getByRole('button', {
    name: /KIỂM TRA THÔNG TIN THÍ SINH|Verify candidate info/i,
  });
  if ((await verifyBtn.count()) > 0) await verifyBtn.first().click();

  const startBtn = page.getByRole('button', { name: /BẮT ĐẦU THI NGAY!|Start exam now/i });
  if ((await startBtn.count()) > 0) await startBtn.first().click();
}

async function gotoNextQuestion(page) {
  const nextBtn = page.getByRole('button', {
    name: /Câu tiếp theo|Next Question/i,
  }).first();

  if ((await nextBtn.count()) === 0) {
    throw new Error('Next Question button not found.');
  }
  await nextBtn.click();
  await page.waitForTimeout(300);
}

async function getAvailableOptionLetters(page) {
  const letters = ['A', 'B', 'C', 'D'];
  const available = [];

  for (const letter of letters) {
    const btn = page.locator('button', {
      has: page.locator(`div:text-is("${letter}")`),
    }).first();

    if ((await btn.count()) === 0) continue;
    const disabledAttr = await btn.getAttribute('disabled');
    if (disabledAttr) continue;
    if (await btn.isVisible()) available.push(letter);
  }

  return available;
}

async function answerQuestionRandomOnce(page, rng) {
  const confirmBtn = page.getByRole('button', {
    name: /XÁC NHẬN CÂU TRẢ LỜI|Confirm Answer/i,
  }).first();

  const available = await getAvailableOptionLetters(page);
  const pick = pickRandom(rng, available);

  const optionBtn = page.locator('button', {
    has: page.locator(`div:text-is("${pick}")`),
  }).first();
  await optionBtn.click();

  await page.waitForFunction(
    () => {
      const btn = [...document.querySelectorAll('button')].find((b) => {
        const txt = (b.innerText || '').toLowerCase();
        return txt.includes('xác nhận câu trả lời') || txt.includes('confirm answer');
      });
      return btn && !btn.hasAttribute('disabled');
    },
    { timeout: 5000 },
  );

  await confirmBtn.click();

  const explanationHeader = page.getByText(/Giải thích|Explanation/i).first();
  await explanationHeader.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}

async function main() {
  const url = readArg('url', 'http://localhost:3000');
  const from = Number(readArg('from', '1'));
  const to = Number(readArg('to', '29'));
  const headless = readArg('headless', 'false') !== 'false';
  const seed = Number(readArg('seed', String(Date.now())));
  const pauseMinutes = Number(readArg('pauseMinutes', '5'));

  if (Number.isNaN(from) || Number.isNaN(to)) {
    throw new Error('Invalid --from/--to');
  }
  if (from < 1 || to < from) {
    throw new Error('Need 1 <= from <= to');
  }
  if (Number.isNaN(pauseMinutes) || pauseMinutes < 0) {
    throw new Error('Invalid --pauseMinutes');
  }

  const rng = mulberry32(seed);

  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await startExamIfNeeded(page);

  const confirmBtn = page.getByRole('button', {
    name: /XÁC NHẬN CÂU TRẢ LỜI|Confirm Answer/i,
  }).first();
  await confirmBtn.waitFor({ state: 'visible', timeout: 30000 });

  for (let q = 1; q <= to; q += 1) {
    if (q < from) {
      await gotoNextQuestion(page);
      continue;
    }

    await answerQuestionRandomOnce(page, rng);
    if (q < to) await gotoNextQuestion(page);
  }

  if (pauseMinutes > 0) {
    await new Promise((resolve) => setTimeout(resolve, pauseMinutes * 60 * 1000));
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

