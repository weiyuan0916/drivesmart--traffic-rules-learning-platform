import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart2, Clock, Star, Zap, Trophy, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  getCompletedLessons,
  getStreakDays,
  getTotalListeningMinutes,
  getAverageAccuracy,
  getWeeklyActivity,
} from '@/services/listeningProgressService';

export default function ProgressPage() {
  const stats = useMemo(() => ({
    streak: getStreakDays(),
    minutes: getTotalListeningMinutes(),
    accuracy: getAverageAccuracy(),
    completed: getCompletedLessons().length,
  }), []);

  const weeklyData = getWeeklyActivity();
  const completedLessons = getCompletedLessons();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-lg p-3 text-xs shadow-lg"
        style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
      >
        <div style={{ color: 'var(--lm-text-primary)' }}>{label}</div>
        <div style={{ color: '#35375B', fontWeight: 'bold' }}>
          {payload[0].value} lessons
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--lm-text-primary)' }}>
          My Progress
        </h1>
        <p style={{ color: 'var(--lm-text-secondary)' }}>
          Track your listening practice journey
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Trophy size={20} />, value: stats.streak, label: 'Day Streak', color: '#FF5632', bg: '#FFF0ED' },
          { icon: <Clock size={20} />, value: stats.minutes, label: 'Total Minutes', color: '#35375B', bg: '#EEEDFB' },
          { icon: <Star size={20} />, value: stats.accuracy > 0 ? `${stats.accuracy}%` : '—', label: 'Avg Accuracy', color: '#00BE7C', bg: '#E6FAF3' },
          { icon: <TrendingUp size={20} />, value: stats.completed, label: 'Lessons Done', color: '#F97316', bg: '#FFF7ED' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl"
            style={{
              background: 'var(--lm-surface)',
              border: '1px solid var(--lm-border)',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div
              className="text-2xl font-black mb-1"
              style={{ color: 'var(--lm-text-primary)' }}
            >
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly activity chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl"
        style={{
          background: 'var(--lm-surface)',
          border: '1px solid var(--lm-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={18} style={{ color: '#35375B' }} />
          <h3 className="font-bold" style={{ color: 'var(--lm-text-primary)' }}>
            Weekly Activity
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: 'var(--lm-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--lm-text-muted)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(53,55,91,0.05)' }} />
            <Bar
              dataKey="count"
              fill="#35375B"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Accuracy trend */}
      {completedLessons.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl"
          style={{
            background: 'var(--lm-surface)',
            border: '1px solid var(--lm-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} style={{ color: '#FF5632' }} />
            <h3 className="font-bold" style={{ color: 'var(--lm-text-primary)' }}>
              Accuracy Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={completedLessons
                .slice(-10)
                .reverse()
                .map((l, i) => ({ name: `#${i + 1}`, accuracy: l.accuracy }))}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--lm-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: 'var(--lm-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--lm-surface)',
                  border: '1px solid var(--lm-border)',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v}%`, 'Accuracy']}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#FF5632"
                strokeWidth={2}
                dot={{ fill: '#FF5632', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent lessons */}
      {completedLessons.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: 'var(--lm-surface)',
            border: '1px solid var(--lm-border)',
          }}
        >
          <BarChart2
            size={48}
            style={{ color: 'var(--lm-text-muted)', margin: '0 auto 12px' }}
          />
          <h3 className="font-bold mb-1" style={{ color: 'var(--lm-text-primary)' }}>
            No practice yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--lm-text-secondary)' }}>
            Complete your first dictation to see your progress here
          </p>
        </div>
      )}
    </div>
  );
}
