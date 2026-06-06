import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve DB path: server/ -> project root -> crawler/data/
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DB_PATH = process.env.CRAWLER_DB_PATH || path.join(PROJECT_ROOT, 'crawler', 'data', 'dailydictation.db');
const db = new Database(DB_PATH, { readonly: true });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Helper: parse section ID -> topic info for a lesson
function getTopicInfoForLesson(lessonId: number) {
  const row = db.prepare(`
    SELECT t.id, t.name, t.slug, t.levels, t.lesson_count
    FROM topics t
    JOIN sections s ON s.topic_id = t.id
    JOIN lessons l ON l.section_id = s.id
    WHERE l.id = ?
    LIMIT 1
  `).get(lessonId) as any;

  if (row) return row;

  // Fallback: look up by direct join
  const row2 = db.prepare(`
    SELECT t.id, t.name, t.slug, t.levels, t.lesson_count
    FROM topics t
    JOIN sections s ON s.topic_id = t.id
    JOIN lessons l ON l.section_id = s.id
    WHERE l.id = ?
    LIMIT 1
  `).get(lessonId) as any;
  return row2;
}

// GET /api/listening/topics
app.get('/api/listening/topics', (_req: Request, res: Response) => {
  try {
    const topics = db.prepare(`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.url,
        t.lesson_count,
        t.levels,
        t.description,
        COUNT(DISTINCT s.id) as section_count,
        COUNT(DISTINCT l.id) as lesson_count_actual
      FROM topics t
      LEFT JOIN sections s ON s.topic_id = t.id
      LEFT JOIN lessons l ON l.section_id = s.id
      GROUP BY t.id
      ORDER BY t.lesson_count DESC
    `).all();

    const result = topics.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      url: t.url,
      lessonCount: t.lesson_count_actual || t.lesson_count,
      levels: t.levels,
      description: t.description,
      sectionCount: t.section_count,
    }));

    res.json({ topics: result });
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// GET /api/listening/topics/:slug
app.get('/api/listening/topics/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const topic = db.prepare(`
      SELECT id, name, slug, url, lesson_count, levels, description
      FROM topics WHERE slug = ? LIMIT 1
    `).get(slug) as any;

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const sections = db.prepare(`
      SELECT id, topic_id, name, slug, order_index, lesson_count, vocab_level
      FROM sections WHERE topic_id = ?
      ORDER BY order_index ASC
    `).all(topic.id);

    const sectionsWithLessons = sections.map((s: any) => {
      const lessons = db.prepare(`
        SELECT id, section_id, name, lesson_name, parts_count, vocab_level, audio_src,
               audio_downloaded, transcript
        FROM lessons WHERE section_id = ?
        ORDER BY id ASC
      `).all(s.id);

      return {
        ...s,
        lessonCount: s.lesson_count,
        lessons: lessons.map((l: any) => ({
          id: l.id,
          sectionId: l.section_id,
          name: l.lesson_name || l.name,
          partsCount: l.parts_count,
          vocabLevel: l.vocab_level,
          hasAudio: !!l.audio_src,
          hasTranscript: !!l.transcript,
        })),
      };
    });

    res.json({
      ...topic,
      lessonCount: topic.lesson_count,
      sections: sectionsWithLessons,
    });
  } catch (err) {
    console.error('Error fetching topic:', err);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// GET /api/listening/sections/:id/lessons
app.get('/api/listening/sections/:id/lessons', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessons = db.prepare(`
      SELECT id, section_id, name, lesson_name, parts_count, vocab_level,
             audio_src, audio_downloaded, transcript
      FROM lessons WHERE section_id = ?
      ORDER BY id ASC
    `).all(id);

    res.json({
      lessons: lessons.map((l: any) => ({
        id: l.id,
        sectionId: l.section_id,
        name: l.lesson_name || l.name,
        partsCount: l.parts_count,
        vocabLevel: l.vocab_level,
        hasAudio: !!l.audio_src,
        hasTranscript: !!l.transcript,
      })),
    });
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// GET /api/listening/lessons/:id
app.get('/api/listening/lessons/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = db.prepare(`
      SELECT id, section_id, name, lesson_name, parts_count, vocab_level,
             audio_src, local_audio_path, audio_downloaded, transcript
      FROM lessons WHERE id = ? LIMIT 1
    `).get(id) as any;

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const challenges = db.prepare(`
      SELECT id, lesson_id, position, content, solution, audio_src,
             time_start, time_end, hints, nb_comments, discussion_url, local_clip_path
      FROM challenges WHERE lesson_id = ?
      ORDER BY position ASC
    `).all(id);

    // Get topic info
    const topicInfo = getTopicInfoForLesson(parseInt(id));
    const section = lesson.section_id
      ? db.prepare(`SELECT id, name, vocab_level FROM sections WHERE id = ?`).get(lesson.section_id)
      : null;

    res.json({
      id: lesson.id,
      sectionId: lesson.section_id,
      name: lesson.lesson_name || lesson.name,
      partsCount: lesson.parts_count,
      vocabLevel: lesson.vocab_level,
      audioSrc: lesson.audio_src,
      localAudioPath: lesson.local_audio_path,
      transcript: lesson.transcript,
      section: section as any,
      topic: topicInfo as any,
      challenges: challenges.map((c: any) => ({
        id: c.id,
        position: c.position,
        content: c.content,
        solution: c.solution ? JSON.parse(c.solution) : [],
        audioSrc: c.audio_src,
        localClipPath: c.local_clip_path || '',
        timeStart: c.time_start,
        timeEnd: c.time_end,
        hints: c.hints ? JSON.parse(c.hints) : [],
        nbComments: c.nb_comments,
        discussionUrl: c.discussion_url,
      })),
    });
  } catch (err) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// GET /api/listening/challenges/:id/audio
// Returns JSON: { audioSrc: string, timeStart?: string, timeEnd?: string }
// Priority: local clip > CDN clip > local full audio
app.get('/api/listening/challenges/:id/audio', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = db.prepare(`
      SELECT audio_src, time_start, time_end, local_clip_path, l.local_audio_path, l.id as lesson_id
      FROM challenges c
      JOIN lessons l ON l.id = c.lesson_id
      WHERE c.id = ? LIMIT 1
    `).get(id) as any;

    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }

    // Priority 1: Local clip file (already sliced by ffmpeg)
    if (challenge.local_clip_path && fs.existsSync(challenge.local_clip_path)) {
      res.json({
        audioSrc: `/api/listening/clips/${id}`,
        timeStart: null,
        timeEnd: null,
        source: 'local_clip',
      });
      return;
    }

    // Priority 2: CDN per-sentence clip URL (from DB)
    if (challenge.audio_src) {
      res.json({
        audioSrc: challenge.audio_src,
        timeStart: challenge.time_start,
        timeEnd: challenge.time_end,
        source: 'cdn_clip',
      });
      return;
    }

    // Priority 3: Local full audio + timestamps (frontend slices by timeStart/timeEnd)
    if (challenge.local_audio_path && fs.existsSync(challenge.local_audio_path)) {
      res.json({
        audioSrc: `/api/listening/audio/${challenge.lesson_id}`,
        timeStart: challenge.time_start,
        timeEnd: challenge.time_end,
        source: 'local_full',
      });
      return;
    }

    res.status(404).json({ error: 'Audio not available for this sentence' });
  } catch (err) {
    console.error('Error fetching challenge audio:', err);
    res.status(500).json({ error: 'Failed to serve challenge audio' });
  }
});

// Serve local clip files (binary MP3)
app.get('/api/listening/clips/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = db.prepare(`
      SELECT local_clip_path FROM challenges WHERE id = ? LIMIT 1
    `).get(id) as any;

    if (!challenge || !challenge.local_clip_path || !fs.existsSync(challenge.local_clip_path)) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    res.sendFile(challenge.local_clip_path);
  } catch (err) {
    console.error('Error serving clip:', err);
    res.status(500).json({ error: 'Failed to serve clip' });
  }
});

// GET /api/listening/audio/:id
app.get('/api/listening/audio/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = db.prepare(`
      SELECT local_audio_path, audio_src FROM lessons WHERE id = ? LIMIT 1
    `).get(id) as any;

    if (!lesson) {
      res.status(404).json({ error: 'Audio not available' });
      return;
    }

    if (lesson.local_audio_path && fs.existsSync(lesson.local_audio_path)) {
      res.sendFile(lesson.local_audio_path);
    } else if (lesson.audio_src) {
      res.redirect(lesson.audio_src);
    } else {
      res.status(404).json({ error: 'Audio not available' });
    }
  } catch (err) {
    console.error('Error serving audio:', err);
    res.status(500).json({ error: 'Failed to serve audio' });
  }
});

// Health check
app.get('/api/listening/health', (_req: Request, res: Response) => {
  const stats = {
    topics: db.prepare('SELECT COUNT(*) as c FROM topics').get() as any,
    sections: db.prepare('SELECT COUNT(*) as c FROM sections').get() as any,
    lessons: db.prepare('SELECT COUNT(*) as c FROM lessons').get() as any,
    challenges: db.prepare('SELECT COUNT(*) as c FROM challenges').get() as any,
  };
  res.json({
    status: 'ok',
    stats: {
      topics: stats.topics.c,
      sections: stats.sections.c,
      lessons: stats.lessons.c,
      challenges: stats.challenges.c,
    },
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Listening API server running on http://localhost:${PORT}`);
  console.log(`DB: ${DB_PATH}`);
});

export default app;
