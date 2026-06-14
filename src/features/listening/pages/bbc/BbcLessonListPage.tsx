import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Clock, ExternalLink, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { bbcApi } from '../../api/bbcApi'
import { BbcSEOList } from './BbcSEO'
import type { BbcLesson, BbcLevelFilter, BbcSortBy } from '../../types/bbc'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import { NoSearchResults, NoLessons } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'

const LEVEL_LABELS: Record<BbcLevelFilter, string> = {
  beginner: 'Sơ cấp',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
}

const SORT_OPTIONS: { value: BbcSortBy; label: string }[] = [
  { value: 'latest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
]

const SERIES_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: '6-minute-english', label: '6 Minute English' },
] as const

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}p ${s}s` : `${m}p`
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200',
  advanced: 'bg-rose-50 text-rose-700 border border-rose-200',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Chưa học',
  in_progress: 'Đang học',
  completed: 'Hoàn thành',
}

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

interface BbcLessonListPageProps {
  onNavigate?: (view: string, extra?: Record<string, string>) => void
}

function LessonCard({ lesson, onNavigate }: { lesson: BbcLesson; onNavigate?: BbcLessonListPageProps['onNavigate'] }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onNavigate) {
      onNavigate('bbc-detail', { slug: lesson.slug })
    } else {
      navigate(`/listening/bbc/${lesson.slug}`)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white p-4 space-y-3',
        'transition-shadow hover:shadow-md cursor-pointer',
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {lesson.thumbnailUrl ? (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
          <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] flex items-center justify-center">
          <span className="text-white font-bold text-lg opacity-50">BBC</span>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold text-text-primary line-clamp-2 leading-snug">{lesson.title}</h3>

        <div className="flex items-center gap-2 flex-wrap">
          {lesson.level && (
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', LEVEL_COLORS[lesson.level] ?? 'bg-gray-100 text-gray-600')}>
              {LEVEL_LABELS[lesson.level] ?? lesson.level}
            </span>
          )}
          {lesson.durationSeconds && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />{formatDuration(lesson.durationSeconds)}
            </span>
          )}
          {lesson.publishedAt && <span className="text-xs text-muted-foreground">{formatDate(lesson.publishedAt)}</span>}
        </div>

        {lesson.progress && (
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[lesson.progress.status] ?? '')}>
            {STATUS_LABELS[lesson.progress.status] ?? lesson.progress.status}
          </span>
        )}
      </div>
    </div>
  )
}

function FilterBar({
  selectedLevel,
  selectedSort,
  selectedSeries,
  onLevelChange,
  onSortChange,
  onSeriesChange,
}: {
  selectedLevel: BbcLevelFilter | null
  selectedSort: BbcSortBy
  selectedSeries: string
  onLevelChange: (level: BbcLevelFilter | null) => void
  onSortChange: (sort: BbcSortBy) => void
  onSeriesChange: (series: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Series filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SERIES_FILTERS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSeriesChange(s.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              selectedSeries === s.id
                ? 'bg-[#35375B] text-white border-[#35375B]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cấp độ:</span>
          {([null, 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level ?? 'all'}
              onClick={() => onLevelChange(level)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors border',
                selectedLevel === level
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary',
              )}
            >
              {level ? LEVEL_LABELS[level] : 'Tất cả'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sắp xếp:</span>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as BbcSortBy)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (v: string) => {
    setLocalValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(v), 300)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Tìm kiếm bài học..."
        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-white text-text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
    </div>
  )
}

function SourceAttribution() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#1D4ED8" />
        <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">B</text>
      </svg>
      <span>Nội dung từ BBC Learning English</span>
      <ExternalLink size={14} className="opacity-50" />
    </div>
  )
}

export default function BbcLessonListPage({ onNavigate }: BbcLessonListPageProps) {
  const [level, setLevel] = useState<BbcLevelFilter | null>(null)
  const [sortBy, setSortBy] = useState<BbcSortBy>('latest')
  const [search, setSearch] = useState('')
  const [series, setSeries] = useState<string>('all')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['bbc-lessons', level, sortBy, search, series],
    queryFn: ({ pageParam = 1 }) =>
      bbcApi.listLessons({
        level: level ?? undefined,
        sortBy,
        search: search || undefined,
        series: series !== 'all' ? series : undefined,
        page: pageParam,
        perPage: 20,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.lastPage) {
        return lastPage.pagination.currentPage + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })

  const lessons = data?.pages.flatMap((p) => p.data) ?? []

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <>
      <BbcSEOList totalLessons={data?.pages[0]?.pagination.total} />
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">BBC Learning English</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Học tiếng Anh với BBC — Không lưu nội dung gốc
              </p>
            </div>
            <SourceAttribution />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar selectedLevel={level} selectedSort={sortBy} selectedSeries={series} onLevelChange={setLevel} onSortChange={setSortBy} onSeriesChange={setSeries} />
        </div>

        {data?.pages[0]?.source && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Tổng cộng <strong className="text-text-primary">{data.pages[0].pagination.total}</strong> bài học
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonLessonCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            Đã xảy ra lỗi khi tải danh sách bài học.
          </div>
        ) : lessons.length === 0 ? (
          search ? <NoSearchResults query={search} /> : <NoLessons />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} onNavigate={onNavigate} />
              ))}
            </div>
            <div ref={bottomRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Đang tải thêm...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
