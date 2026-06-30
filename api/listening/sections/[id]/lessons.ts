import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_lib/db';

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
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'Invalid section id' });
      return;
    }

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
      [id],
    );

    res.json({
      lessons: lessons.map((l) => ({
        id: Number(l.id),
        sectionId: Number(l.section_id),
        name: l.name,
        slug: slugify(l.name),
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
}
