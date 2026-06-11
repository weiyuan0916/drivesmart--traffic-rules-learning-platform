import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_lib/db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const topics = await query<{
      id: number;
      name: string;
      slug: string;
      description: string | null;
      color: string | null;
      lesson_count: string;
      section_count: string;
    }>(`
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
    const levelsRows = await query<{ id: number; vocab_level: string }>(`
      SELECT DISTINCT t.id, l.vocab_level
      FROM topics t
      JOIN lessons l ON l.topic_id = t.id AND l.deleted_at IS NULL
      WHERE t.is_active = true AND l.vocab_level IS NOT NULL
      ORDER BY t.id, l.vocab_level
    `);
    for (const row of levelsRows) {
      if (!levelsMap[row.id]) levelsMap[row.id] = [];
      if (!levelsMap[row.id]!.includes(row.vocab_level)) {
        levelsMap[row.id]!.push(row.vocab_level);
      }
    }

    const result = topics.map((t) => ({
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
}
