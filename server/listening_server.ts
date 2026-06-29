import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.LISTENING_PORT || '3002');

// Crawler SQLite database (source of truth for topics/sections/lessons)
const CRAWLER_DB_PATH = path.resolve(__dirname, '../crawler/data/dailydictation.db');

// Laravel SQLite database (for user progress)
const LARAVEL_DB_PATH = process.env.SQLITE_PATH
  || path.resolve(__dirname, '../backend/database/database.sqlite');

const crawlerDb = new Database(CRAWLER_DB_PATH);
crawlerDb.pragma('journal_mode = WAL');

const laravelDb = new Database(LARAVEL_DB_PATH);
laravelDb.pragma('journal_mode = WAL');
laravelDb.pragma('foreign_keys = ON');

// Helper: query with params (crawler db)
function query<T = any>(text: string, params?: unknown[]): T[] {
  const stmt = crawlerDb.prepare(text);
  const rows = params ? stmt.all(...params) : stmt.all();
  return rows as T[];
}

// Helper: querySingle (crawler db)
function queryOne<T = any>(text: string, params?: unknown[]): T | null {
  const rows = query<T>(text, params);
  return rows[0] ?? null;
}

// Helper: laravel query with params
function laravelQuery<T = any>(text: string, params?: unknown[]): T[] {
  const stmt = laravelDb.prepare(text);
  const rows = params ? stmt.all(...params) : stmt.all();
  return rows as T[];
}

// Helper: laravel querySingle
function laravelQueryOne<T = any>(text: string, params?: unknown[]): T | null {
  const rows = laravelQuery<T>(text, params);
  return rows[0] ?? null;
}

app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/listening/health', (_req: Request, res: Response) => {
  try {
    const topics = query<{ c: number }>('SELECT COUNT(*) as c FROM topics');
    const sections = query<{ c: number }>('SELECT COUNT(*) as c FROM sections');
    const lessons = query<{ c: number }>('SELECT COUNT(*) as c FROM lessons');
    const clips = query<{ c: number }>('SELECT COUNT(*) as c FROM challenges');
    res.json({
      status: 'ok',
      stats: {
        topics: topics[0]?.c ?? 0,
        sections: sections[0]?.c ?? 0,
        lessons: lessons[0]?.c ?? 0,
        challenges: clips[0]?.c ?? 0,
      },
      source: 'crawler_db',
      path: CRAWLER_DB_PATH,
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// ─── GET /api/listening/topics ────────────────────────────────────────────────
app.get('/api/listening/topics', (_req: Request, res: Response) => {
  try {
    const topics = query<any>(`
      SELECT
        id,
        name,
        slug,
        description,
        levels,
        lesson_count as lessonCount,
        url
      FROM topics
      ORDER BY id ASC
    `);

    // Assign colors based on topic index
    const colors = ['#35375B', '#2B5F8E', '#00BE7C', '#FF5632', '#8B5CF6', '#B15224', '#00BE7C', '#35375B', '#2B5F8E', '#FF5632', '#8B5CF6', '#B15224', '#00BE7C'];
    
    const result = topics.map((t: any, i: number) => ({
      id: Number(t.id),
      name: t.name,
      slug: t.slug,
      url: `/topic/${t.slug}`,
      lessonCount: Number(t.lessonCount || 0),
      levels: t.levels || '',
      description: t.description || '',
      sectionCount: 0,
      color: colors[i % colors.length],
    }));

    res.json({ topics: result });
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// ─── GET /api/listening/topics/:slug ─────────────────────────────────────────
app.get('/api/listening/topics/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const topic = queryOne<any>(
      `SELECT id, name, slug, description, levels, lesson_count, url
       FROM topics WHERE slug = ? LIMIT 1`,
      [slug]
    );

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    // Get sections for this topic
    const sections = query<any>(
      `SELECT id, topic_id, name, slug, order_index, vocab_level, lesson_count
       FROM sections WHERE topic_id = ?
       ORDER BY order_index ASC`,
      [topic.id]
    );

    // Build sections with lessons
    const sectionsWithLessons = sections.map((s: any) => {
      // Only get lessons that have challenges (audio content)
      const lessons = query<any>(
        `SELECT l.id, l.section_id, l.name, l.lesson_url, l.vocab_level, l.parts_count, l.audio_src, l.local_audio_path, l.transcript
         FROM lessons l
         INNER JOIN challenges c ON c.lesson_id = l.id
         WHERE l.section_id = ?
         GROUP BY l.id
         ORDER BY l.id ASC`,
        [s.id]
      );
      return {
        id: Number(s.id),
        topicId: Number(s.topic_id),
        name: s.name.replace(/LessonGroup\d+/, 'Section').trim(),
        slug: s.slug,
        orderIndex: Number(s.order_index),
        lessonCount: lessons.length,
        vocabLevel: s.vocab_level || '',
        lessons: lessons.map((l: any) => ({
          id: Number(l.id),
          sectionId: Number(l.section_id),
          name: l.name,
          partsCount: l.parts_count || null,
          vocabLevel: l.vocab_level || '',
          hasAudio: true,
          hasTranscript: !!l.transcript,
        })),
      };
    });

    // If no sections found, get all lessons directly (only lessons with challenges)
    if (sectionsWithLessons.length === 0) {
      const directLessons = query<any>(
        `SELECT l.id, l.section_id, l.name, l.lesson_url, l.vocab_level, l.parts_count, l.audio_src, l.local_audio_path, l.transcript
         FROM lessons l
         INNER JOIN challenges c ON c.lesson_id = l.id
         WHERE l.section_id IS NULL
         GROUP BY l.id
         ORDER BY l.id ASC`,
        []
      );

      sectionsWithLessons.push({
        id: 0,
        topicId: Number(topic.id),
        name: 'All Lessons',
        slug: 'all-lessons',
        orderIndex: 0,
        lessonCount: directLessons.length,
        vocabLevel: '',
        lessons: directLessons.map((l: any) => ({
          id: Number(l.id),
          sectionId: null,
          name: l.name,
          partsCount: null,
          vocabLevel: l.vocab_level || '',
          hasAudio: true,
          hasTranscript: !!l.transcript,
        })),
      });
    }

    const totalLessons = sectionsWithLessons.reduce((acc, s) => acc + s.lessons.length, 0);

    res.json({
      id: Number(topic.id),
      slug: topic.slug,
      name: topic.name,
      lessonCount: totalLessons,
      levels: topic.levels || '',
      description: topic.description || '',
      sections: sectionsWithLessons,
      color: '#35375B',
    });
  } catch (err) {
    console.error('Error fetching topic:', err);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// ─── GET /api/listening/sections/:id/lessons ──────────────────────────────────
app.get('/api/listening/sections/:id/lessons', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessons = query<any>(
      `SELECT id, topic_id, section_id, name, url, vocab_level, duration, has_audio, transcript
       FROM lessons WHERE section_id = ?
       ORDER BY id ASC`,
      [id]
    );

    res.json({
      lessons: lessons.map((l: any) => ({
        id: Number(l.id),
        sectionId: Number(l.section_id),
        name: l.name,
        partsCount: null,
        vocabLevel: l.vocab_level || '',
        hasAudio: !!l.has_audio,
        hasTranscript: false,
      })),
    });
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ error: 'Failed to fetch section lessons' });
  }
});

// ─── GET /api/listening/lessons/:id ──────────────────────────────────────────
app.get('/api/listening/lessons/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = queryOne<any>(
      `SELECT id, section_id, name, lesson_url, vocab_level, parts_count, audio_src, local_audio_path, transcript
       FROM lessons WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Get challenges (clips) for this lesson
    const clips = query<any>(
      `SELECT id, lesson_id, position, content, solution, audio_src, time_start, time_end, hints, nb_comments, discussion_url, local_clip_path
       FROM challenges WHERE lesson_id = ?
       ORDER BY position ASC`,
      [id]
    );

    // Get section info (to get topic info)
    let sectionInfo = null;
    let topicInfo = null;
    if (lesson.section_id) {
      const section = queryOne<any>(
        `SELECT id, name, vocab_level, topic_id FROM sections WHERE id = ? LIMIT 1`,
        [lesson.section_id]
      );
      if (section) {
        sectionInfo = {
          id: Number(section.id),
          name: section.name,
          vocabLevel: section.vocab_level || '',
        };
        // Get topic info via section
        const topic = queryOne<any>(
          `SELECT id, name, slug, levels FROM topics WHERE id = ? LIMIT 1`,
          [section.topic_id]
        );
        if (topic) {
          topicInfo = {
            id: Number(topic.id),
            name: topic.name,
            slug: topic.slug,
            levels: topic.levels || '',
            lessonCount: 0,
            color: '#35375B',
          };
        }
      }
    }

    res.json({
      id: Number(lesson.id),
      sectionId: lesson.section_id ? Number(lesson.section_id) : null,
      name: lesson.name,
      partsCount: lesson.parts_count || clips.length,
      vocabLevel: lesson.vocab_level || '',
      audioSrc: lesson.audio_src || '',
      localAudioPath: lesson.local_audio_path || '',
      transcript: lesson.transcript || '',
      section: sectionInfo,
      topic: topicInfo,
      challenges: clips.map((c: any) => ({
        id: Number(c.id),
        position: Number(c.position),
        content: c.content || '',
        solution: c.solution ? JSON.parse(c.solution) : [],
        audioSrc: c.audio_src || '',
        localClipPath: c.local_clip_path || '',
        timeStart: c.time_start || '',
        timeEnd: c.time_end || '',
        hints: c.hints ? JSON.parse(c.hints) : [],
        nbComments: Number(c.nb_comments) || 0,
        discussionUrl: c.discussion_url || '',
      })),
    });
  } catch (err) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// ─── GET /api/listening/challenges/:id/audio ─────────────────────────────────
app.get('/api/listening/challenges/:id/audio', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clip = queryOne<any>(
      `SELECT c.audio_src, c.local_clip_path, c.time_start, c.time_end, c.lesson_id
       FROM challenges c
       WHERE c.id = ? LIMIT 1`,
      [id]
    );

    if (!clip) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }

    // Priority 1: CDN audio_src
    if (clip.audio_src && clip.audio_src.startsWith('http')) {
      res.json({
        audioSrc: clip.audio_src,
        timeStart: clip.time_start || null,
        timeEnd: clip.time_end || null,
        source: 'cdn_clip',
      });
      return;
    }
    // Priority 2: local file
    if (clip.local_clip_path && fs.existsSync(clip.local_clip_path)) {
      res.sendFile(clip.local_clip_path);
      return;
    }

    res.status(404).json({ error: 'Audio not available for this sentence' });
  } catch (err) {
    console.error('Error fetching challenge audio:', err);
    res.status(500).json({ error: 'Failed to serve challenge audio' });
  }
});

// ─── Serve local clip files ───────────────────────────────────────────────────
app.get('/api/listening/clips/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clip = queryOne<any>(
      `SELECT audio_src, local_clip_path FROM challenges WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!clip) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    if (clip.local_clip_path && fs.existsSync(clip.local_clip_path)) {
      res.sendFile(clip.local_clip_path);
    } else if (clip.audio_src?.startsWith('http')) {
      res.redirect(clip.audio_src);
    } else {
      res.status(404).json({ error: 'Clip file not found' });
    }
  } catch (err) {
    console.error('Error serving clip:', err);
    res.status(500).json({ error: 'Failed to serve clip' });
  }
});

// ─── Serve full lesson audio ─────────────────────────────────────────────────
app.get('/api/listening/audio/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = queryOne<any>(
      `SELECT audio_url, local_path FROM lessons WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!lesson) {
      res.status(404).json({ error: 'Audio not available' });
      return;
    }

    if (lesson.local_path && fs.existsSync(lesson.local_path)) {
      res.sendFile(lesson.local_path);
    } else if (lesson.audio_url?.startsWith('http')) {
      res.redirect(lesson.audio_url);
    } else {
      res.status(404).json({ error: 'Audio not available' });
    }
  } catch (err) {
    console.error('Error serving audio:', err);
    res.status(500).json({ error: 'Failed to serve audio' });
  }
});

// ─── BBC Learning English (metadata-only, content policy compliant) ──────────
//
// IMPORTANT: This endpoint set is intentionally metadata-only and serves as a
// developer convenience for VinaListen's BBC feature work. It mirrors the
// Laravel /api/v1/listening/bbc contract so the frontend can develop against
// it without needing the Laravel backend running.
//
// Per .cursor/rules/bbc-feature.mdc:
//   • Do NOT download BBC audio files
//   • Do NOT rehost BBC audio
//   • Do NOT store BBC transcripts
//   • Do NOT republish BBC content
//
// This Express server returns only public BBC metadata (title, slug, source
// URL, thumbnail URL, level, duration, published date). It MUST NOT return
// any transcript text or BBC-owned content. If `metadata_json.segments` is
// present in the DB, the text field is stripped before being sent to the
// client. Vocabulary entries are user-created only.

app.get('/api/listening/bbc', (req: Request, res: Response) => {
  try {
    const level = typeof req.query.level === 'string' ? req.query.level : null;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sortBy = typeof req.query.sort_by === 'string' ? req.query.sort_by : 'latest';
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(String(req.query.per_page ?? '20'), 10) || 20));

    const filters: string[] = [];
    const params: unknown[] = [];
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      params.push(level);
      filters.push(`level = ?`);
    }
    if (search) {
      params.push(`%${search}%`);
      filters.push(`title LIKE ?`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const order = sortBy === 'oldest' ? 'published_at ASC' : 'published_at DESC';

    // Count total
    const countRows = laravelQuery<{ c: number }>(
      `SELECT COUNT(*) as c FROM listening_external_lessons ${where}`,
      params,
    );
    const total = countRows[0]?.c ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    // Page
    const offset = (page - 1) * perPage;
    const rows = laravelQuery<any>(
      `SELECT id, source_id, title, slug, source_url, thumbnail_url, level,
              duration_seconds, published_at, metadata_json, segments_source,
              created_at, updated_at
       FROM listening_external_lessons
       ${where}
       ORDER BY ${order}
       LIMIT ? OFFSET ?`,
      [...params, perPage, offset],
    );

    // Find the source for the catalog
    const source = laravelQueryOne<any>(
      `SELECT id, name, slug, created_at, updated_at FROM listening_sources LIMIT 1`,
    );

    // Redact BBC content from metadata_json.segments per content policy.
    const safeRows = rows.map((r: any) => {
      const meta = r.metadata_json ?? null;
      const safeMeta = meta ? sanitizeBbcMetadata(meta, r.segments_source) : meta;
      return {
        id: Number(r.id),
        source_id: Number(r.source_id),
        title: r.title,
        slug: r.slug,
        source_url: r.source_url,
        thumbnail_url: r.thumbnail_url,
        level: r.level,
        duration_seconds: r.duration_seconds ? Number(r.duration_seconds) : null,
        published_at: r.published_at,
        metadata: safeMeta,
        segments_source: r.segments_source ?? null,
        requires_user_transcript: !['user_provided', 'manual'].includes(r.segments_source ?? ''),
        created_at: r.created_at,
        updated_at: r.updated_at,
        progress: null,
      };
    });

    res.json({
      data: safeRows,
      source: source
        ? {
            id: Number(source.id),
            name: source.name,
            slug: source.slug,
            lesson_count: total,
            created_at: source.created_at,
            updated_at: source.updated_at,
          }
        : { id: 0, name: 'BBC Learning English', slug: 'bbc-learning-english', lesson_count: total },
      pagination: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
      },
    });
  } catch (err) {
    console.error('Error fetching BBC lessons:', err);
    res.status(500).json({ error: 'Failed to fetch BBC lessons' });
  }
});

app.get('/api/listening/bbc/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const row = laravelQueryOne<any>(
      `SELECT id, source_id, title, slug, source_url, thumbnail_url, level,
              duration_seconds, published_at, metadata_json, segments_source,
              created_at, updated_at
       FROM listening_external_lessons
       WHERE slug = ?
       LIMIT 1`,
      [slug],
    );

    if (!row) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const safeMeta = row.metadata_json
      ? sanitizeBbcMetadata(row.metadata_json, row.segments_source)
      : row.metadata_json;

    res.json({
      data: {
        id: Number(row.id),
        source_id: Number(row.source_id),
        title: row.title,
        slug: row.slug,
        source_url: row.source_url,
        thumbnail_url: row.thumbnail_url,
        level: row.level,
        duration_seconds: row.duration_seconds ? Number(row.duration_seconds) : null,
        published_at: row.published_at,
        metadata: safeMeta,
        segments_source: row.segments_source ?? null,
        requires_user_transcript: !['user_provided', 'manual'].includes(row.segments_source ?? ''),
        created_at: row.created_at,
        updated_at: row.updated_at,
        progress: null,
      },
    });
  } catch (err) {
    console.error('Error fetching BBC lesson:', err);
    res.status(500).json({ error: 'Failed to fetch BBC lesson' });
  }
});

// Stub endpoints that the frontend may call; they return empty/safe data so
// the UI does not break in dev. Real auth/progress/notes persistence lives
// in the Laravel backend.

app.post('/api/listening/bbc/:id/progress', async (req: Request, res: Response) => {
  res.status(202).json({ accepted: true });
});

app.post('/api/listening/bbc/:id/complete', async (req: Request, res: Response) => {
  res.status(202).json({ accepted: true });
});

app.get('/api/listening/bbc/:id/notes', async (req: Request, res: Response) => {
  res.json({ data: { id: 0, lesson_id: Number(req.params.id), content: '', updated_at: null } });
});

app.put('/api/listening/bbc/:id/notes', async (req: Request, res: Response) => {
  res.json({ data: { id: 0, lesson_id: Number(req.params.id), content: req.body?.content ?? '', updated_at: new Date().toISOString() } });
});

app.get('/api/listening/bbc/:id/vocabulary', async (req: Request, res: Response) => {
  res.json({ data: [] });
});

app.post('/api/listening/bbc/:id/vocabulary', async (req: Request, res: Response) => {
  res.json({ data: { id: 0, lesson_id: Number(req.params.id), ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
});

app.put('/api/listening/bbc/:id/vocabulary/:wordId', async (req: Request, res: Response) => {
  res.json({ data: { id: Number(req.params.wordId), lesson_id: Number(req.params.id), ...req.body, updated_at: new Date().toISOString() } });
});

app.delete('/api/listening/bbc/:id/vocabulary/:wordId', async (req: Request, res: Response) => {
  res.status(204).send();
});

app.get('/api/listening/bbc/dashboard', async (req: Request, res: Response) => {
  res.json({ data: { lessons_started: 0, lessons_completed: 0, completion_rate: 0 } });
});

// Strip any BBC-owned transcript text from a metadata blob. Only user_provided
// and manual sources are allowed to pass text through.
function sanitizeBbcMetadata(metadata: any, segmentsSource: string | null): any {
  if (!metadata || typeof metadata !== 'object') return metadata;
  const safe = { ...metadata };
  const allowText = segmentsSource === 'user_provided' || segmentsSource === 'manual';
  if (Array.isArray(safe.segments)) {
    safe.segments = safe.segments.map((seg: any) => {
      if (allowText) return seg;
      return { ...seg, text: undefined, redacted: true, redaction_reason: 'bbc_content_policy' };
    });
  }
  if (!allowText && safe.transcript_pdf_url) {
    delete safe.transcript_pdf_url;
  }
  return safe;
}

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Graceful shutdown ──────────────────────────────────────────────────────────
function shutdown() {
  console.log('Closing SQLite databases...');
  crawlerDb.close();
  laravelDb.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening API server running on http://localhost:${PORT}`);
  console.log(`Crawler DB: ${CRAWLER_DB_PATH}`);
  console.log(`Laravel DB: ${LARAVEL_DB_PATH}`);
});

export default app;
