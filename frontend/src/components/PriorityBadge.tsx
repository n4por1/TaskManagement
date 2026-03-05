import type { Priority } from '../types'

const colors: Record<Priority, string> = {
  低: 'bg-slate-100 text-slate-500',
  中: 'bg-yellow-100 text-yellow-700',
  高: 'bg-red-100 text-red-600',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[priority]}`}>
      {priority}
    </span>
  )
}
