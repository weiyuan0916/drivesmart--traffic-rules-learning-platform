// ============================================================
// ResetLessonModal — VinaListen
// Confirmation dialog before resetting lesson progress
// ============================================================

import { memo } from 'react'
import { RotateCcw } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

interface ResetLessonModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  lessonName: string
  isLoading?: boolean
}

export const ResetLessonModal = memo(function ResetLessonModal({
  isOpen,
  onClose,
  onConfirm,
  lessonName,
  isLoading = false,
}: ResetLessonModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
          <RotateCcw size={28} className="text-error" aria-hidden="true" />
        </div>

        {/* Title */}
        <h2
          id="reset-modal-title"
          className="text-xl font-semibold text-text-primary"
        >
          Reset Lesson Progress?
        </h2>

        {/* Body */}
        <p className="text-text-secondary text-sm leading-relaxed">
          This will clear your progress for{' '}
          <span className="font-semibold text-text-primary">
            &ldquo;{lessonName}&rdquo;
          </span>{' '}
          and start a new attempt. Your streak and XP will not be affected.
        </p>

        {/* Actions */}
        <div className="flex gap-3 w-full mt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
            aria-label="Reset lesson progress"
          >
            Reset Lesson
          </Button>
        </div>
      </div>
    </Modal>
  )
})
