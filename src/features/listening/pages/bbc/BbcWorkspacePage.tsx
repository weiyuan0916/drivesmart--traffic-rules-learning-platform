import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, Clock, CheckCircle, PlayCircle, BookOpen, Trash2, Plus, Save } from 'lucide-react'
import { bbcApi } from '../../api/bbcApi'
import { useBbcStore } from '../../stores/bbcStore'
import { BbcSEOWorkspace } from './BbcSEO'
import type { BbcVocabularyItem, BbcVocabularyPayload } from '../../types/bbc'
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

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}p ${s}s` : `${m}p`
}

// ── Notes Tab ───────────────────────────────────────────────

function NotesTab({ lessonId }: { lessonId: number }) {
  const { notes, setNotes, notesDirty, setNotesDirty } = useBbcStore()
  const saveNote = useMutation({
    mutationFn: (content: string) => bbcApi.updateNotes(lessonId, content),
    onSuccess: () => setNotesDirty(false),
    onError: () => setNotesDirty(true),
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (value: string) => {
    setNotes(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveNote.mutate(value), 5000)
  }

  const handleSaveNow = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    saveNote.mutate(notes)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Ghi chú học tập</h3>
        <div className="flex items-center gap-2">
          {notesDirty && <span className="text-xs text-muted-foreground">Chưa lưu</span>}
          <Button size="sm" variant="secondary" onClick={handleSaveNow} disabled={!notesDirty || saveNote.isPending} className="gap-1.5">
            <Save size={14} />Lưu
          </Button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Viết ghi chú của bạn ở đây... Ghi chú sẽ tự động lưu sau 5 giây."
        className={cn(
          'flex-1 w-full p-4 border border-border rounded-xl resize-none',
          'text-text-primary placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-colors min-h-[200px]',
        )}
      />
      <div className="text-xs text-muted-foreground text-right">
        {notes.trim().split(/\s+/).filter(Boolean).length} từ
      </div>
    </div>
  )
}

// ── Vocabulary Tab ──────────────────────────────────────────

function VocabularyTab({ lessonId }: { lessonId: number }) {
  const { vocabulary, setVocabulary, addVocabulary, removeVocabulary } = useBbcStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BbcVocabularyPayload>({ word: '', meaning: '', example: '', note: '' })

  const { data: serverVocab } = useQuery({
    queryKey: ['bbc-vocabulary', lessonId],
    queryFn: () => bbcApi.getVocabulary(lessonId),
    initialData: [],
  })

  useEffect(() => { setVocabulary(serverVocab) }, [serverVocab, setVocabulary])

  const saveMutation = useMutation({
    mutationFn: (payload: BbcVocabularyPayload) => bbcApi.saveVocabulary(lessonId, payload),
    onSuccess: (item) => {
      addVocabulary(item)
      setForm({ word: '', meaning: '', example: '', note: '' })
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (vocabId: number) => bbcApi.deleteVocabulary(lessonId, vocabId),
    onSuccess: (_, vocabId) => { removeVocabulary(vocabId) },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.word.trim()) return
    saveMutation.mutate(form)
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Từ vựng</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus size={14} />Thêm từ
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border p-4 space-y-3 bg-white">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Từ *</label>
            <input value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="word"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nghĩa</label>
            <input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="meaning"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ví dụ</label>
            <input value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} placeholder="example sentence"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saveMutation.isPending} className="gap-1.5"><Save size={14} />Lưu</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {vocabulary.length === 0 && !showForm && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Chưa có từ vựng nào. Nhấn "Thêm từ" để bắt đầu.
          </div>
        )}
        {vocabulary.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-white p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="font-semibold text-text-primary">{item.word}</span>
                {item.meaning && <span className="ml-2 text-sm text-muted-foreground">{item.meaning}</span>}
              </div>
              <button onClick={() => deleteMutation.mutate(item.id)} className="text-muted-foreground hover:text-error transition-colors" aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
            {item.example && <p className="text-sm text-muted-foreground italic">{item.example}</p>}
            {item.note && <p className="text-xs text-muted-foreground bg-gray-50 rounded px-2 py-1">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dictation Tab ───────────────────────────────────────────

function DictationTab() {
  const { dictationText, setDictationText, dictationDirty } = useBbcStore()

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Luyện nghe chép</h3>
        {dictationDirty && <span className="text-xs text-muted-foreground">Đã thay đổi</span>}
      </div>
      <p className="text-sm text-muted-foreground">
        Nghe audio từ BBC Learning English và gõ lại những gì bạn nghe được.
      </p>
      <textarea
        value={dictationText}
        onChange={(e) => setDictationText(e.target.value)}
        placeholder="Gõ transcript bạn nghe được ở đây..."
        className={cn(
          'flex-1 w-full p-4 border border-border rounded-xl resize-none',
          'text-text-primary placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-colors min-h-[200px] font-mono text-sm',
        )}
      />
      <div className="text-xs text-muted-foreground text-right">
        {dictationText.trim().split(/\s+/).filter(Boolean).length} từ
      </div>
    </div>
  )
}

// ── Main Workspace Page ─────────────────────────────────────

interface BbcWorkspacePageProps {
  topicSlug?: string
  onNavigate?: (view: string, extra?: Record<string, string>) => void
}

export default function BbcWorkspacePage({ topicSlug, onNavigate }: BbcWorkspacePageProps) {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { activeTab, setActiveTab, reset } = useBbcStore()

  const lessonSlug = slug ?? topicSlug ?? ''

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['bbc-lesson', lessonSlug],
    queryFn: () => bbcApi.getLesson(lessonSlug),
    enabled: !!lessonSlug,
  })

  const completeMutation = useMutation({
    mutationFn: () => bbcApi.markComplete(lesson!.id),
    onSuccess: () => { /* refetch handled by query invalidation if needed */ },
  })

  useEffect(() => () => reset(), [reset])

  const goBack = () => {
    if (onNavigate) onNavigate('bbc-detail', { slug: lessonSlug })
    else navigate(`/listening/bbc/${lessonSlug}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height={160} className="rounded-xl" />
        <div className="space-y-3">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" height={400} className="rounded-xl" />
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Không tìm thấy bài học.</p>
        <Button variant="secondary" onClick={goBack}>Quay lại</Button>
      </div>
    )
  }

  const tabs = [
    { id: 'notes' as const, label: 'Ghi chú', icon: BookOpen },
    { id: 'vocabulary' as const, label: 'Từ vựng', icon: BookOpen },
    { id: 'dictation' as const, label: 'Nghe chép', icon: PlayCircle },
  ]

  return (
    <>
      <BbcSEOWorkspace lessonTitle={lesson.title} slug={lesson.slug} />
      <div className="space-y-6">
        {/* Back + Header */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
          Quay lại
        </button>
        {lesson.progress?.status !== 'completed' && (
          <Button size="sm" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending} className="gap-1.5">
            <CheckCircle size={14} />Đánh dấu hoàn thành
          </Button>
        )}
        {lesson.progress?.status === 'completed' && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle size={16} />Đã hoàn thành
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lesson Info Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden bg-gray-100">
            {lesson.thumbnailUrl ? (
              <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] flex items-center justify-center">
                <span className="text-white font-bold text-2xl">BBC</span>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4 bg-white">
            <h2 className="font-bold text-text-primary leading-tight">{lesson.title}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              {lesson.level && (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', LEVEL_COLORS[lesson.level] ?? 'bg-gray-100 text-gray-600')}>
                  {LEVEL_LABELS[lesson.level] ?? lesson.level}
                </span>
              )}
              {lesson.durationSeconds && (
                <div className="flex items-center gap-1.5"><Clock size={14} />{formatDuration(lesson.durationSeconds)}</div>
              )}
            </div>
            <a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <ExternalLink size={14} />Mở bài gốc BBC
            </a>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Nội dung từ BBC Learning English. DriveSmart là nền tảng học tập, không lưu trữ nội dung gốc.
            </p>
          </div>
        </div>

        {/* Right: Workspace */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="flex border-b border-border">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                    activeTab === id
                      ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                      : 'text-muted-foreground hover:text-text-primary',
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <div className="p-4 min-h-[400px]">
              {activeTab === 'notes' && <NotesTab lessonId={lesson.id} />}
              {activeTab === 'vocabulary' && <VocabularyTab lessonId={lesson.id} />}
              {activeTab === 'dictation' && <DictationTab />}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
