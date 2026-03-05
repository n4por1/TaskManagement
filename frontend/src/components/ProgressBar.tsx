interface Props {
  progress: number  // 0.0 – 1.0
  completed: number
  total: number
  added?: number
}

export function ProgressBar({ progress, completed, total, added }: Props) {
  const pct = Math.round(progress * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {completed} / {total} tasks
        </span>
        <span className="font-semibold text-gray-800">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {added !== undefined && added > 0 && (
        <p className="text-xs text-amber-600">(+{added} tasks added)</p>
      )}
    </div>
  )
}
