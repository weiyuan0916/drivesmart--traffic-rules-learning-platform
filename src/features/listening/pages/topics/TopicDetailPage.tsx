import { useParams } from 'react-router-dom'

export default function TopicDetailPage() {
  const { slug } = useParams()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Chi tiết chủ đề
      </h1>
      <p className="text-muted-foreground mb-4">Slug: {slug}</p>
      <p className="text-sm text-muted-foreground">
        TopicDetailPage will be implemented in T-B-005 (Topics &amp; Lessons).
      </p>
    </div>
  )
}
