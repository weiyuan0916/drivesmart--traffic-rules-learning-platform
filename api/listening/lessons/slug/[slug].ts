import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../../_lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ error: 'Invalid lesson slug' });
      return;
    }

    // Get lesson by slug (slug is derived from lesson name)
    const lessons = await query<{
      id: number;
      section_id: number | null;
      topic_id: number | null;
      name: string;
      vocab_level: string | null;
      audio_path: string | null;
      duration: string | null;
    }>(
      `SELECT id, section_id, topic_id, name, vocab_level, audio_path, duration
       FROM lessons WHERE deleted_at IS NULL`,
    );

    // Find lesson by matching slug
    const lesson = lessons.find((l) => slugify(l.name) === slug);

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const clips = await query<{
      id: number;
      transcript: string | null;
      audio_path: string | null;
      duration: string | null;
      order_index: number;
    }>(
      `SELECT id, transcript, audio_path, duration, order_index
       FROM lesson_clips WHERE lesson_id = $1 AND deleted_at IS NULL
       ORDER BY order_index ASC`,
      [lesson.id],
    );

    let topicInfo = null;
    if (lesson.topic_id) {
      const topic = await queryOne<{ id: number; name: string; slug: string; color: string | null }>(
        `SELECT id, name, slug, color FROM topics WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [lesson.topic_id],
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

    let sectionInfo = null;
    if (lesson.section_id) {
      const section = await queryOne<{ id: number; name: string; vocab_level: string | null }>(
        `SELECT id, name, vocab_level FROM sections WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [lesson.section_id],
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
      slug: slugify(lesson.name),
      partsCount: clips.length,
      vocabLevel: lesson.vocab_level || '',
      audioSrc: lesson.audio_path || '',
      localAudioPath: '',
      transcript: clips.map((c) => c.transcript).join(' '),
      section: sectionInfo,
      topic: topicInfo,
      challenges: clips.map((c) => ({
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
    console.error('Error fetching lesson by slug:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
}
