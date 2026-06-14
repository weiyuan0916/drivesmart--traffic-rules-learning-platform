import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.LISTENING_PORT || '3002');

// PostgreSQL connection pool (Supabase)
// NOTE: pool_size must not exceed the Supabase pooler's limit (default 15).
// Going over causes "EMAXCONNSESSION max clients reached" errors.
const pool = new Pool({
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'postgres',
  user: process.env.DB_USERNAME || 'postgres.xcnhurrsrdjorfuzzjfz',
  password: process.env.DB_PASSWORD || 'iZMmkt4SebxMoXIR',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  // Force IPv4 to avoid macOS IPv6 dual-stack timeouts hitting the Supabase pooler.
  // The hostname resolves to both IPv4 (54.179.210.x) and IPv6; IPv6 tunnels/routings
  // on consumer ISP connections are unreliable and cause premature connectionTimeoutMillis
  // errors before the IPv4 path is attempted.
  family: 4,
});

// Simple concurrency limiter to avoid overwhelming the pool.
// Only this many DB queries run in parallel at any time.
const MAX_CONCURRENT = 5;
let active = 0;
const waiting: Array<() => void> = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active < MAX_CONCURRENT) {
    active++;
    try {
      return await fn();
    } finally {
      active--;
      const next = waiting.shift();
      if (next) next();
    }
  }
  return new Promise<T>((resolve) => {
    waiting.push(async () => {
      active++;
      try {
        resolve(await fn());
      } finally {
        active--;
        const n = waiting.shift();
        if (n) n();
      }
    });
  });
}

// Helper: query with params — uses pool.query (no manual connect/release needed)
async function query(text: string, params?: unknown[]): Promise<any[]> {
  return withSlot(() => pool.query(text, params).then((r) => r.rows as any[]));
}

// Helper: querySingle
async function queryOne(text: string, params?: unknown[]) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/listening/health', async (_req: Request, res: Response) => {
  try {
    const [topics, sections, lessons, clips] = await Promise.all([
      query('SELECT COUNT(*) as c FROM topics'),
      query('SELECT COUNT(*) as c FROM sections'),
      query('SELECT COUNT(*) as c FROM lessons'),
      query('SELECT COUNT(*) as c FROM lesson_clips'),
    ]);
    res.json({
      status: 'ok',
      stats: {
        topics: Number(topics[0].c),
        sections: Number(sections[0].c),
        lessons: Number(lessons[0].c),
        challenges: Number(clips[0].c),
      },
      source: 'postgresql',
      host: process.env.DB_HOST,
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// ─── GET /api/listening/topics ────────────────────────────────────────────────
app.get('/api/listening/topics', async (_req: Request, res: Response) => {
  try {
    const topics = await query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.description,
        t.color,
        t.is_active,
        t.order_index,
        COUNT(DISTINCT s.id) as section_count,
        COUNT(DISTINCT l.id) as lesson_count
      FROM topics t
      LEFT JOIN sections s ON s.topic_id = t.id
      LEFT JOIN lessons l ON l.topic_id = t.id AND l.deleted_at IS NULL
      WHERE t.is_active = true AND t.deleted_at IS NULL
      GROUP BY t.id
      ORDER BY t.order_index ASC
    `);

    const levelsMap: Record<number, string[]> = {};
    const levelsRows = await query(`
      SELECT DISTINCT t.id, l.vocab_level
      FROM topics t
      JOIN lessons l ON l.topic_id = t.id AND l.deleted_at IS NULL
      WHERE t.is_active = true AND l.vocab_level IS NOT NULL
      ORDER BY t.id, l.vocab_level
    `);
    for (const row of levelsRows) {
      if (!levelsMap[row.id]) levelsMap[row.id] = [];
      if (!levelsMap[row.id].includes(row.vocab_level)) {
        levelsMap[row.id].push(row.vocab_level);
      }
    }

    const result = topics.map((t: any) => ({
      id: Number(t.id),
      name: t.name,
      slug: t.slug,
      url: `/topic/${t.slug}`,
      lessonCount: Number(t.lesson_count),
      levels: levelsMap[t.id]?.join(', ') || '',
      description: t.description || '',
      sectionCount: Number(t.section_count),
      color: t.color || '#35375B',
    }));

    res.json({ topics: result });
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// ─── GET /api/listening/topics/:slug ─────────────────────────────────────────
app.get('/api/listening/topics/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const topic = await queryOne(
      `SELECT id, name, slug, description, color, is_active, order_index
       FROM topics WHERE slug = $1 AND is_active = true AND deleted_at IS NULL LIMIT 1`,
      [slug]
    );

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const sections = await query(
      `SELECT id, topic_id, name, slug, order_index, vocab_level
       FROM sections WHERE topic_id = $1 AND deleted_at IS NULL
       ORDER BY order_index ASC`,
      [topic.id]
    );

    const sectionsWithLessons = await Promise.all(
      sections.map(async (s: any) => {
        const lessons = await query(
          `SELECT id, section_id, name, vocab_level, duration, audio_path
           FROM lessons WHERE section_id = $1 AND deleted_at IS NULL
           ORDER BY order_index ASC`,
          [s.id]
        );

        return {
          id: Number(s.id),
          topicId: Number(s.topic_id),
          name: s.name,
          slug: s.slug,
          orderIndex: Number(s.order_index),
          lessonCount: lessons.length,
          vocabLevel: s.vocab_level || '',
          lessons: lessons.map((l: any) => ({
            id: Number(l.id),
            sectionId: Number(l.section_id),
            name: l.name,
            partsCount: null,
            vocabLevel: l.vocab_level || '',
            hasAudio: !!l.audio_path,
            hasTranscript: false,
          })),
        };
      })
    );

    res.json({
      id: Number(topic.id),
      slug: topic.slug,
      name: topic.name,
      lessonCount: sectionsWithLessons.reduce((acc, s) => acc + s.lessons.length, 0),
      levels: '',
      description: topic.description || '',
      sections: sectionsWithLessons,
      color: topic.color || '#35375B',
    });
  } catch (err) {
    console.error('Error fetching topic:', err);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// ─── GET /api/listening/sections/:id/lessons ──────────────────────────────────
app.get('/api/listening/sections/:id/lessons', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessons = await query(
      `SELECT id, section_id, name, vocab_level, duration, audio_path
       FROM lessons WHERE section_id = $1 AND deleted_at IS NULL
       ORDER BY order_index ASC`,
      [id]
    );

    res.json({
      lessons: lessons.map((l: any) => ({
        id: Number(l.id),
        sectionId: Number(l.section_id),
        name: l.name,
        partsCount: null,
        vocabLevel: l.vocab_level || '',
        hasAudio: !!l.audio_path,
        hasTranscript: false,
      })),
    });
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ error: 'Failed to fetch section lessons' });
  }
});

// ─── GET /api/listening/lessons/:id ──────────────────────────────────────────
app.get('/api/listening/lessons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await queryOne(
      `SELECT l.id, l.section_id, l.topic_id, l.name, l.vocab_level, l.audio_path, l.duration
       FROM lessons l WHERE l.id = $1 AND l.deleted_at IS NULL LIMIT 1`,
      [id]
    );

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const clips = await query(
      `SELECT id, transcript, audio_path, duration, order_index
       FROM lesson_clips WHERE lesson_id = $1 AND deleted_at IS NULL
       ORDER BY order_index ASC`,
      [id]
    );

    // Get topic info
    let topicInfo = null;
    if (lesson.topic_id) {
      const topic = await queryOne(
        `SELECT id, name, slug, color FROM topics WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [lesson.topic_id]
      );
      if (topic) {
        topicInfo = {
          id: Number(topic.id),
          name: topic.name,
          slug: topic.slug,
          levels: '',
          lessonCount: 0,
          color: topic.color || '#35375B',
        };
      }
    }

    // Get section info
    let sectionInfo = null;
    if (lesson.section_id) {
      const section = await queryOne(
        `SELECT id, name, vocab_level FROM sections WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [lesson.section_id]
      );
      if (section) {
        sectionInfo = {
          id: Number(section.id),
          name: section.name,
          vocabLevel: section.vocab_level || '',
        };
      }
    }

    res.json({
      id: Number(lesson.id),
      sectionId: lesson.section_id ? Number(lesson.section_id) : null,
      name: lesson.name,
      partsCount: clips.length,
      vocabLevel: lesson.vocab_level || '',
      audioSrc: lesson.audio_path || '',
      localAudioPath: '',
      transcript: clips.map((c: any) => c.transcript).join(' '),
      section: sectionInfo,
      topic: topicInfo,
      challenges: clips.map((c: any) => ({
        id: Number(c.id),
        position: Number(c.order_index),
        content: c.transcript,
        solution: [],
        audioSrc: c.audio_path || '',
        localClipPath: '',
        timeStart: '',
        timeEnd: '',
        hints: [],
        nbComments: 0,
        discussionUrl: '',
      })),
    });
  } catch (err) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// ─── GET /api/listening/challenges/:id/audio ─────────────────────────────────
app.get('/api/listening/challenges/:id/audio', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clip = await queryOne(
      `SELECT lc.audio_path, lc.duration, lc.order_index, l.id as lesson_id
       FROM lesson_clips lc
       JOIN lessons l ON l.id = lc.lesson_id
       WHERE lc.id = $1 AND lc.deleted_at IS NULL LIMIT 1`,
      [id]
    );

    if (!clip) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }

    // Priority 1: CDN audio_path
    if (clip.audio_path) {
      // If it's a URL, return it directly
      if (clip.audio_path.startsWith('http')) {
        res.json({
          audioSrc: clip.audio_path,
          timeStart: null,
          timeEnd: null,
          source: 'cdn_clip',
        });
        return;
      }
    }

    res.status(404).json({ error: 'Audio not available for this sentence' });
  } catch (err) {
    console.error('Error fetching challenge audio:', err);
    res.status(500).json({ error: 'Failed to serve challenge audio' });
  }
});

// ─── Serve local clip files ───────────────────────────────────────────────────
app.get('/api/listening/clips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clip = await queryOne(
      `SELECT audio_path FROM lesson_clips WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id]
    );

    if (!clip || !clip.audio_path) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    if (fs.existsSync(clip.audio_path)) {
      res.sendFile(clip.audio_path);
    } else if (clip.audio_path.startsWith('http')) {
      res.redirect(clip.audio_path);
    } else {
      res.status(404).json({ error: 'Clip file not found' });
    }
  } catch (err) {
    console.error('Error serving clip:', err);
    res.status(500).json({ error: 'Failed to serve clip' });
  }
});

// ─── Serve full lesson audio ─────────────────────────────────────────────────
app.get('/api/listening/audio/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await queryOne(
      `SELECT audio_path FROM lessons WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id]
    );

    if (!lesson) {
      res.status(404).json({ error: 'Audio not available' });
      return;
    }

    if (lesson.audio_path) {
      if (fs.existsSync(lesson.audio_path)) {
        res.sendFile(lesson.audio_path);
      } else if (lesson.audio_path.startsWith('http')) {
        res.redirect(lesson.audio_path);
      } else {
        res.status(404).json({ error: 'Audio not available' });
      }
    } else {
      res.status(404).json({ error: 'Audio not available' });
    }
  } catch (err) {
    console.error('Error serving audio:', err);
    res.status(500).json({ error: 'Failed to serve audio' });
  }
});

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Graceful shutdown ──────────────────────────────────────────────────────────
async function shutdown() {
  console.log('Closing PostgreSQL pool...');
  await pool.end();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => {
  console.log(`Listening API server running on http://localhost:${PORT}`);
  console.log(`Database: PostgreSQL (Supabase)`);
  console.log(`Host: ${process.env.DB_HOST}`);
});

export default app;
