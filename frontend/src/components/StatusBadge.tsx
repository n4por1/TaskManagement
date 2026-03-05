import type { GoalStatus, TaskStatus } from '../types'

type Status = GoalStatus | TaskStatus

const colors: Record<Status, string> = {
  未着手: 'bg-gray-100 text-gray-600',
  進行中: 'bg-blue-100 text-blue-700',
  待ち: 'bg-amber-100 text-amber-700',
  完了: 'bg-green-100 text-green-700',
  中止: 'bg-red-100 text-red-600',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
