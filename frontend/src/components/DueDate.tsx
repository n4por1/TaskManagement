/** due_date (YYYY-MM-DD) を受け取り、状態を返す */
export type DueDateState = 'overdue' | 'soon' | 'ok' | null

export function getDueDateState(dueDate: string | null): DueDateState {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'soon'
  return 'ok'
}

export function DueDateLabel({ dueDate }: { dueDate: string | null }) {
  const state = getDueDateState(dueDate)
  if (!dueDate || !state) return null

  const label = `期限: ${dueDate}`
  if (state === 'overdue')
    return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600">⚠ {label}</span>
  if (state === 'soon')
    return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">⏰ {label}</span>
  return <span className="text-xs text-gray-400">{label}</span>
}
