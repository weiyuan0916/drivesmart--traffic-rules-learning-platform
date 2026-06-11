import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [topics, sections, lessons, clips] = await Promise.all([
      query<{ c: string }>('SELECT COUNT(*) as c FROM topics'),
      query<{ c: string }>('SELECT COUNT(*) as c FROM sections'),
      query<{ c: string }>('SELECT COUNT(*) as c FROM lessons'),
      query<{ c: string }>('SELECT COUNT(*) as c FROM lesson_clips'),
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
    const message = err instanceof Error ? err.message : String(err);
    console.error('Health check error:', message);
    res.status(500).json({ error: 'Health check failed', detail: message });
  }
}
