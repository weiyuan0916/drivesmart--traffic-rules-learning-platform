// ============================================================
// MicroSettings — VinaListen
// Bottom sheet / sidebar settings panel
// ============================================================

import { Settings2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { MicroSettings } from '../../../types/bbc'

interface MicroSettingsProps {
  settings: MicroSettings
  onChange: (partial: Partial<MicroSettings>) => void
  className?: string
}

const SEGMENT_LENGTH_OPTIONS: MicroSettings['segmentLength'][] = [3, 5, 10]
const PLAYBACK_SPEED_OPTIONS: MicroSettings['playbackSpeed'][] = [0.75, 1, 1.25]

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex gap-1" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150',
              value === opt
                ? 'bg-[#35375B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {opt === 1 ? '1x' : `${opt}x`}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MicroSettings({ settings, onChange, className }: MicroSettingsProps) {
  return (
    <div className={cn('flex flex-col gap-4 p-4 bg-white rounded-xl border border-gray-200', className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Settings2 size={16} />
        Cài đặt
      </div>

      <PillGroup
        label="Thời lượng mỗi đoạn"
        options={SEGMENT_LENGTH_OPTIONS}
        value={settings.segmentLength}
        onChange={(v) => onChange({ segmentLength: v })}
      />

      <PillGroup
        label="Tốc độ phát"
        options={PLAYBACK_SPEED_OPTIONS}
        value={settings.playbackSpeed}
        onChange={(v) => onChange({ playbackSpeed: v })}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tùy chọn</span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showTranscriptAfter}
            onChange={(e) => onChange({ showTranscriptAfter: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-[#35375B] focus:ring-[#35375B]"
          />
          <span className="text-sm text-gray-700">Hiện đáp án sau khi kiểm tra</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => onChange({ autoAdvance: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-[#35375B] focus:ring-[#35375B]"
          />
          <span className="text-sm text-gray-700">Tự động chuyển đoạn tiếp</span>
        </label>
      </div>
    </div>
  )
}
