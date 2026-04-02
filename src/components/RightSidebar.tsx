import React, { useMemo } from 'react';
import { MOCK_USER_STATS } from '../constants';
import { Bell, GraduationCap, Car, Mail, Calendar, ChevronRight } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { SmoothScroll } from './SmoothScroll';
import type { ChapterStat } from '../types';

interface RightSidebarProps {
  chapterStats?: ChapterStat[] | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ chapterStats }) => {
  const { t } = useLanguage();

  const masteryData = useMemo(() => {
    if (!chapterStats || chapterStats.length === 0) {
      return MOCK_USER_STATS.masteryByArea.map((m) => ({
        label: m.area,
        percentage: m.percentage,
        color: m.color,
        correctPercentage: m.percentage,
        incorrectPercentage: 100 - m.percentage,
      }));
    }

    return chapterStats.map((stat) => {
      const correctPercentage =
        stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      let color = '#F97316';
      if (correctPercentage >= 80) color = '#22C55E';
      else if (correctPercentage < 50) color = '#EF4444';

      return {
        label: stat.chapter,
        percentage: correctPercentage,
        color,
        correctPercentage,
        incorrectPercentage: 100 - correctPercentage,
      };
    });
  }, [chapterStats]);

  return (
    <SmoothScroll className="w-full lg:w-96 bg-[var(--bg-secondary)] p-5 lg:p-7 pb-32 lg:pb-10 flex flex-col gap-6 lg:gap-8 border-l border-[var(--border)]">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <img 
            src="https://picsum.photos/seed/user1/100/100" 
            alt="User" 
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-blue-500 p-0.5"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="text-[var(--text-primary)] font-bold text-sm lg:text-base">Jelena Lukić</h3>
            <p className="text-[9px] lg:text-[10px] text-[var(--text-secondary)] font-mono">ID - 160021172210 0104</p>
          </div>
        </div>
        <button className="p-2 bg-[var(--bg-tertiary)] rounded-full text-blue-500 hover:bg-[var(--bg-hover)] transition-colors">
          <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 text-center bg-[var(--bg-tertiary)] rounded-2xl px-3 py-3 lg:px-4 lg:py-4">
        <div>
          <p className="text-[8px] lg:text-[10px] text-[var(--text-secondary)] font-bold uppercase mb-1">{t('category')}</p>
          <p className="text-[var(--text-primary)] font-bold text-lg lg:text-xl">B</p>
        </div>
        <div>
          <p className="text-[8px] lg:text-[10px] text-[var(--text-secondary)] font-bold uppercase mb-1">{t('theoryExam')}</p>
          <p className="text-[var(--text-primary)] font-bold text-[10px] lg:text-sm">27.02.2020.</p>
        </div>
        <div>
          <p className="text-[8px] lg:text-[10px] text-[var(--text-secondary)] font-bold uppercase mb-1">{t('practicalExam')}</p>
          <p className="text-[var(--text-primary)] font-bold text-lg lg:text-xl">/</p>
        </div>
      </div>

      {/* Icon Navigation */}
      <div className="grid grid-cols-4 gap-3 lg:gap-4 bg-[var(--bg-tertiary)] rounded-2xl px-3 py-3 lg:px-4 lg:py-4">
        {[GraduationCap, Car, Mail, Calendar].map((Icon, i) => (
          <button key={i} className="aspect-square bg-[var(--bg-tertiary)] rounded-2xl flex items-center justify-center text-[var(--text-secondary)] hover:text-blue-500 hover:bg-[var(--bg-hover)] transition-all">
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Last Exercises */}
      <div className="bg-[var(--bg-tertiary)] p-5 lg:p-6 rounded-3xl mt-1">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[var(--text-primary)] font-bold text-sm">{t('lastExercises')}</h4>
          <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        <div className="space-y-6">
          {MOCK_USER_STATS.lastExercises.map((ex, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <div>
                  <p className="text-[var(--text-primary)] font-bold">{ex.name}</p>
                  <p className="text-[var(--text-secondary)]">{ex.category}</p>
                </div>
                <p className="text-[var(--text-primary)] font-bold">{ex.score}%</p>
              </div>
              <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${ex.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mastery Chart */}
      <div className="bg-[var(--bg-tertiary)] p-5 lg:p-6 rounded-3xl flex-1 min-h-[300px] flex flex-col mt-1">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[var(--text-primary)] font-bold text-sm">{t('masteryByArea')}</h4>
          <span className="text-[var(--text-secondary)] text-[10px] font-bold">%</span>
        </div>
        
        <div className="h-[220px] w-full min-w-0 shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={masteryData}>
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {masteryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <XAxis hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
          {masteryData.map((area, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
                <span className="text-[9px] text-[var(--text-secondary)] font-medium truncate">
                  {area.label}
                </span>
              </div>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {area.correctPercentage}% đúng · {area.incorrectPercentage}% sai
              </span>
            </div>
          ))}
        </div>
      </div>
    </SmoothScroll>
  );
};

export default RightSidebar;
