import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Trash2 } from 'lucide-react';
import type { ListeningLessonDetail } from '@/types/listening';
import { getAllBookmarks, removeBookmark } from '@/services/listeningProgressService';

interface BookmarksPageProps {
  onStartPractice: (lesson: ListeningLessonDetail) => void;
}

export default function BookmarksPage({ onStartPractice }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState(getAllBookmarks());

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(id);
    setBookmarks(getAllBookmarks());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--lm-text-primary)' }}>
          Bookmarks
        </h1>
        <p style={{ color: 'var(--lm-text-secondary)' }}>
          Your saved lessons and difficult sentences
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: 'var(--lm-surface)',
            border: '1px solid var(--lm-border)',
          }}
        >
          <Bookmark
            size={48}
            style={{ color: 'var(--lm-text-muted)', margin: '0 auto 12px' }}
          />
          <h3 className="font-bold mb-1" style={{ color: 'var(--lm-text-primary)' }}>
            No bookmarks yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--lm-text-secondary)' }}>
            Save lessons and sentences while practicing to review them later
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm, i) => (
            <motion.div
              key={bm.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
              style={{
                background: 'var(--lm-surface)',
                border: '1px solid var(--lm-border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#EEEDFB' }}
              >
                <Bookmark size={18} style={{ color: '#35375B' }} fill="#35375B" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: 'var(--lm-text-primary)' }}>
                  {bm.type === 'lesson' ? bm.lessonName : 'Difficult Sentence'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--lm-text-muted)' }}>
                  {bm.type === 'lesson' && bm.topicSlug ? `${bm.topicSlug.replace('-', ' ')} • ` : ''}
                  {new Date(bm.createdAt).toLocaleDateString()}
                </div>
                {bm.sentence && (
                  <div
                    className="text-xs mt-1 p-2 rounded-lg truncate"
                    style={{ background: 'var(--lm-surface-raised)', color: 'var(--lm-text-secondary)' }}
                  >
                    "{bm.sentence}"
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleRemove(bm.id, e)}
                className="p-2 rounded-lg flex-shrink-0 transition-colors hover:bg-red-50"
                style={{ color: 'var(--lm-text-muted)' }}
                aria-label="Remove bookmark"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
