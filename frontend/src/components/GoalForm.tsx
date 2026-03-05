import { useState } from 'react'
import type { Goal, GoalCreate, GoalStatus, Priority } from '../types'

interface Props {
  initial?: Goal
  onSubmit: (data: GoalCreate) => void
  onCancel: () => void
  loading?: boolean
}

const STATUSES: GoalStatus[] = ['未着手', '進行中', '完了', '中止']
const PRIORITIES: Priority[] = ['低', '中', '高']

export function GoalForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<GoalCreate>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    start_date: initial?.start_date ?? '',
    end_date: initial?.end_date ?? '',
    status: initial?.status ?? '未着手',
    priority: initial?.priority ?? '中',
    success_criteria: initial?.success_criteria ?? '',
  })

  const set = <K extends keyof GoalCreate>(k: K, v: GoalCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      description: form.description || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      success_criteria: form.success_criteria || undefined,
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
          className="input min-h-20 resize-y"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">開始日</label>
          <input
            type="date"
            className="input"
            value={form.start_date ?? ''}
            onChange={(e) => set('start_date', e.target.value)}
          />
        </div>
        <div>
          <label className="label">終了日</label>
          <input
            type="date"
            className="input"
            value={form.end_date ?? ''}
            onChange={(e) => set('end_date', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">ステータス</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as GoalStatus)}>
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
      <div>
        <label className="label">成功条件</label>
        <textarea
          className="input resize-y"
          value={form.success_criteria}
          onChange={(e) => set('success_criteria', e.target.value)}
        />
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
