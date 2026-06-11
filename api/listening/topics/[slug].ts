import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ error: 'Missing slug parameter' });
      return;
    }

    const topic = await queryOne<{
      id: number;
      name: string;
      slug: string;
      description: string | null;
      color: string | null;
    }>(
      `SELECT id, name, slug, description, color
       FROM topics WHERE slug = $1 AND is_active = true AND deleted_at IS NULL LIMIT 1`,
      [slug],
    );

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const sections = await query<{
      id: number;
      topic_id: number;
      name: string;
      slug: string;
      order_index: number;
      vocab_level: string | null;
    }>(
      `SELECT id, topic_id, name, slug, order_index, vocab_level
       FROM sections WHERE topic_id = $1 AND deleted_at IS NULL
       ORDER BY order_index ASC`,
      [topic.id],
    );

    const sectionsWithLessons = await Promise.all(
      sections.map(async (s) => {
        const lessons = await query<{
          id: number;
          section_id: number;
          name: string;
          vocab_level: string | null;
          duration: string | null;
          audio_path: string | null;
        }>(
          `SELECT id, section_id, name, vocab_level, duration, audio_path
           FROM lessons WHERE section_id = $1 AND deleted_at IS NULL
           ORDER BY order_index ASC`,
          [s.id],
        );

        return {
          id: Number(s.id),
          topicId: Number(s.topic_id),
          name: s.name,
          slug: s.slug,
          orderIndex: Number(s.order_index),
          lessonCount: lessons.length,
          vocabLevel: s.vocab_level || '',
          lessons: lessons.map((l) => ({
            id: Number(l.id),
            sectionId: Number(l.section_id),
            name: l.name,
            partsCount: null,
            vocabLevel: l.vocab_level || '',
            hasAudio: !!l.audio_path,
            hasTranscript: false,
          })),
        };
      }),
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
}
