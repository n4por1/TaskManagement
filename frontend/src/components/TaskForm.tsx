import { useState } from 'react'
import type { Task, TaskCreate, TaskStatus, Priority } from '../types'

interface Props {
  initial?: Task
  goalId?: number
  parentTaskId?: number
  onSubmit: (data: TaskCreate) => void
  onCancel: () => void
  loading?: boolean
}

const STATUSES: TaskStatus[] = ['未着手', '進行中', '待ち', '完了']
const PRIORITIES: Priority[] = ['低', '中', '高']

export function TaskForm({ initial, goalId, parentTaskId, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<TaskCreate>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    due_date: initial?.due_date ?? '',
    status: initial?.status ?? '未着手',
    priority: initial?.priority ?? '中',
    goal_id: initial?.goal_id ?? goalId,
    parent_task_id: initial?.parent_task_id ?? parentTaskId,
  })

  const set = <K extends keyof TaskCreate>(k: K, v: TaskCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      description: form.description || undefined,
      due_date: form.due_date || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">タイトル *</label>
        <input
          required
          className="input"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>
      <div>
        <label className="label">説明</label>
        <textarea
          className="input min-h-16 resize-y"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div>
        <label className="label">期限</label>
        <input
          type="date"
          className="input"
          value={form.due_date ?? ''}
          onChange={(e) => set('due_date', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">ステータス</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as TaskStatus)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">優先度</label>
          <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '保存中…' : '保存'}
        </button>
      </div>
    </form>
  )
}
