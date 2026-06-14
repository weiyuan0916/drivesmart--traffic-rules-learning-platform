import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Clock, ExternalLink, PlayCircle, BookOpen, ArrowLeft, Headphones } from 'lucide-react'
import { bbcApi } from '../../api/bbcApi'
import { BbcSEODetail } from './BbcSEO'
import type { BbcLesson } from '../../types/bbc'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Sơ cấp',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Chưa học',
  in_progress: 'Đang học',
  completed: 'Hoàn thành',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m} phút ${s} giây` : `${m} phút`
}

function formatDate(iso: string | null): string {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface BbcLessonDetailPageProps {
  topicSlug?: string
  onNavigate?: (view: string, extra?: Record<string, unknown>) => void
  onLessonLoaded?: (lesson: BbcLesson) => void
}

export default function BbcLessonDetailPage({ topicSlug, onNavigate, onLessonLoaded }: BbcLessonDetailPageProps) {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ['bbc-lesson', slug ?? topicSlug],
    queryFn: () => bbcApi.getLesson(slug ?? topicSlug ?? ''),
    enabled: !!(slug ?? topicSlug),
  })

  useEffect(() => {
    if (lesson && lesson.progress?.status === 'not_started') {
      bbcApi.updateProgress(lesson.id, 'in_progress').catch(() => {})
    }
    if (lesson && onLessonLoaded) {
      onLessonLoaded(lesson)
    }
  }, [lesson, onLessonLoaded])

  const goBack = () => {
    if (onNavigate) onNavigate('bbc-list')
    else navigate('/listening/bbc')
  }

  const goToPractice = () => {
    if (onNavigate) onNavigate('bbc-workspace', { slug: lesson!.slug })
    else navigate(`/listening/bbc/${lesson!.slug}/practice`)
  }

  const goToDictation = () => {
    if (onNavigate) onNavigate('bbc-dictation', { slug: lesson!.slug, lesson: lesson! })
    else navigate(`/listening/bbc/${lesson!.slug}/dictation`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height={200} className="rounded-2xl" />
        <div className="space-y-3">
          <Skeleton variant="text" width="80%" height={28} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={120} />
        </div>
      </div>
    )
  }

  if (isError || !lesson) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Không tìm thấy bài học.</p>
        <Button variant="secondary" onClick={goBack}>Quay lại danh sách</Button>
      </div>
    )
  }

  return (
    <>
      <BbcSEODetail
        title={lesson.title}
        slug={lesson.slug}
        level={lesson.level}
        durationSeconds={lesson.durationSeconds}
        thumbnailUrl={lesson.thumbnailUrl}
      />
      <div className="space-y-6">
        {/* Back */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      {/* Thumbnail */}
      <div className="rounded-2xl overflow-hidden bg-gray-100">
        {lesson.thumbnailUrl ? (
          <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] flex items-center justify-center">
            <span className="text-white font-bold text-4xl">BBC</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">{lesson.title}</h1>
          {lesson.progress && (
            <span className={cn('flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium', STATUS_COLORS[lesson.progress.status] ?? '')}>
              {STATUS_LABELS[lesson.progress.status] ?? lesson.progress.status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {lesson.level && (
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', LEVEL_COLORS[lesson.level] ?? 'bg-gray-100 text-gray-600')}>
              {LEVEL_LABELS[lesson.level] ?? lesson.level}
            </span>
          )}
          {lesson.durationSeconds && (
            <span className="flex items-center gap-1.5"><Clock size={14} />{formatDuration(lesson.durationSeconds)}</span>
          )}
          {lesson.publishedAt && <span>{formatDate(lesson.publishedAt)}</span>}
        </div>

        {/* Source attribution */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 rounded-lg px-3 py-2">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#1D4ED8" />
            <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">B</text>
          </svg>
          <div>
            <span className="font-medium text-blue-700">Source: BBC Learning English</span>
            <span className="text-blue-600/70"> — Nội dung gốc từ bbc.co.uk/learningenglish</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="flex-1 gap-2" onClick={goToPractice}>
          <PlayCircle size={20} />
          Bắt đầu học
        </Button>
        <Button variant="secondary" size="lg" className="flex-1 gap-2" onClick={goToDictation}>
          <Headphones size={20} />
          Luyện nghe chép
        </Button>
        <Button variant="secondary" size="lg" className="flex-1 gap-2" onClick={() => window.open(lesson.sourceUrl, '_blank', 'noopener,noreferrer')}>
          <ExternalLink size={20} />
          Mở bài gốc
        </Button>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
          <BookOpen size={16} />
          Gợi ý học tập
        </div>
        <ul className="text-sm text-blue-800/80 space-y-1.5 list-disc list-inside">
          <li>Mở bài gốc từ BBC để nghe audio/video trực tiếp</li>
          <li>Sử dụng không gian học tập để ghi chú và lưu từ vựng</li>
          <li>Tập nghe và gõ lại những gì bạn nghe được</li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        DriveSmart không lưu trữ nội dung audio hay transcript từ BBC.
        Dữ liệu cá nhân (ghi chú, từ vựng, tiến độ) chỉ được lưu trong tài khoản của bạn.
      </p>
      </div>
    </>
  )
}
