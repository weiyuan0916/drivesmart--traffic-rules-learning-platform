import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'Invalid lesson id' });
      return;
    }

    const lesson = await queryOne<{ audio_path: string | null }>(
      `SELECT audio_path FROM lessons WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id],
    );

    if (!lesson) {
      res.status(404).json({ error: 'Audio not available' });
      return;
    }

    if (lesson.audio_path) {
      if (lesson.audio_path.startsWith('http')) {
        res.redirect(lesson.audio_path);
        return;
      }
      res.status(404).json({ error: 'Audio file not found on disk' });
    } else {
      res.status(404).json({ error: 'Audio not available' });
    }
  } catch (err) {
    console.error('Error serving audio:', err);
    res.status(500).json({ error: 'Failed to serve audio' });
  }
}
