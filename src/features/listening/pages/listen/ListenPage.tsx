import { useParams } from 'react-router-dom'

export default function ListenPage() {
  const { lessonId } = useParams()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Bài học
      </h1>
      <p className="text-muted-foreground mb-4">Lesson ID: {lessonId}</p>
      <p className="text-sm text-muted-foreground">
        ListenPage will be implemented in T-B-006 to T-B-010.
      </p>
    </div>
  )
}
