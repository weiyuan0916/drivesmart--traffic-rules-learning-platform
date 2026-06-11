import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'Invalid challenge id' });
      return;
    }

    const clip = await queryOne<{ audio_path: string | null }>(
      `SELECT lc.audio_path
       FROM lesson_clips lc
       JOIN lessons l ON l.id = lc.lesson_id
       WHERE lc.id = $1 AND lc.deleted_at IS NULL LIMIT 1`,
      [id],
    );

    if (!clip) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }

    if (clip.audio_path) {
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
}
