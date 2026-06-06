import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Minh Tran', accuracy: 98, streak: 45, xp: 12400, avatar: 'M' },
  { rank: 2, name: 'Linh Nguyen', accuracy: 96, streak: 38, xp: 11200, avatar: 'L' },
  { rank: 3, name: 'Dat Pham', accuracy: 94, streak: 30, xp: 9800, avatar: 'D' },
  { rank: 4, name: 'Anh Le', accuracy: 92, streak: 25, xp: 8600, avatar: 'A' },
  { rank: 5, name: 'Mai Hoang', accuracy: 90, streak: 20, xp: 7500, avatar: 'H' },
  { rank: 6, name: 'Hieu Vu', accuracy: 88, streak: 18, xp: 6400, avatar: 'V' },
  { rank: 7, name: 'Quynh Dao', accuracy: 86, streak: 15, xp: 5500, avatar: 'Q' },
  { rank: 8, name: 'Son Ngo', accuracy: 84, streak: 12, xp: 4600, avatar: 'S' },
];

const CATEGORIES = [
  { id: 'accuracy', label: 'Top Accuracy', icon: <Trophy size={16} /> },
  { id: 'streak', label: 'Top Streak', icon: <Star size={16} /> },
  { id: 'xp', label: 'Top XP', icon: <Medal size={16} /> },
];

export default function LeaderboardPage() {
  const sortedByAccuracy = [...MOCK_LEADERBOARD].sort((a, b) => b.accuracy - a.accuracy);
  const sortedByStreak = [...MOCK_LEADERBOARD].sort((a, b) => b.streak - a.streak);
  const sortedByXP = [...MOCK_LEADERBOARD].sort((a, b) => b.xp - a.xp);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={18} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={18} className="text-gray-400" />;
    if (rank === 3) return <Medal size={18} className="text-amber-600" />;
    return <span className="text-sm font-bold" style={{ color: 'var(--lm-text-muted)' }}>#{rank}</span>;
  };

  const renderBoard = (data: typeof MOCK_LEADERBOARD, metric: 'accuracy' | 'streak' | 'xp', label: string) => (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--lm-border)' }}>
        <h3 className="font-bold text-sm" style={{ color: 'var(--lm-text-primary)' }}>
          {label}
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--lm-border)' }}>
        {data.map((user, i) => (
          <motion.div
            key={user.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="w-8 flex justify-center">{getRankIcon(user.rank)}</div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#35375B' }}
            >
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--lm-text-primary)' }}>
                {user.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                {user.streak} day streak
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm" style={{ color: '#35375B' }}>
                {metric === 'accuracy' ? `${user.accuracy}%` : metric === 'streak' ? `${user.streak}d` : `${user.xp.toLocaleString()} XP`}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--lm-text-primary)' }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--lm-text-secondary)' }}>
          See how you rank against other learners
        </p>
      </div>

      {/* Notice */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
        style={{ background: '#EEEDFB', color: '#35375B' }}
      >
        <Trophy size={18} />
        <span>
          <strong>Coming soon:</strong> Connect your account to appear on the leaderboard
        </span>
      </div>

      {/* Boards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderBoard(sortedByAccuracy, 'accuracy', 'Top Accuracy')}
        {renderBoard(sortedByStreak, 'streak', 'Top Streak')}
        {renderBoard(sortedByXP, 'xp', 'Top XP')}
      </div>

      {/* Your rank placeholder */}
      <div
        className="p-5 rounded-2xl text-center"
        style={{
          background: 'var(--lm-surface)',
          border: '1px solid var(--lm-border)',
        }}
      >
        <p className="text-sm mb-2" style={{ color: 'var(--lm-text-secondary)' }}>
          Your current rank
        </p>
        <div className="text-3xl font-black" style={{ color: 'var(--lm-text-primary)' }}>
          —
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--lm-text-muted)' }}>
          Complete more lessons to appear on the leaderboard
        </p>
      </div>
    </div>
  );
}
