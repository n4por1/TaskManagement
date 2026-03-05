import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { goalsApi } from '../api/client'
import type { GoalCreate } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { ProgressBar } from '../components/ProgressBar'
import { Modal } from '../components/Modal'
import { GoalForm } from '../components/GoalForm'

export function Dashboard() {
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: GoalCreate) => goalsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); setShowCreate(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  if (isLoading) return <div className="p-8 text-gray-400">読み込み中…</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">目標一覧</h1>
          <p className="text-sm text-gray-500 mt-0.5">{goals.length} 件の目標</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + 目標追加
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 mb-3">目標がまだありません</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            最初の目標を作成
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/goals/${goal.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {goal.title}
                  </Link>
                  {goal.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{goal.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={goal.status} />
                    <PriorityBadge priority={goal.priority} />
                    {goal.end_date && (
                      <span className="text-xs text-gray-400">期限: {goal.end_date}</span>
                    )}
                  </div>
                </div>
                <button
                  className="shrink-0 text-gray-300 hover:text-red-400 text-lg"
                  onClick={() => { if (confirm(`「${goal.title}」を削除しますか？`)) deleteMutation.mutate(goal.id) }}
                  title="削除"
                >
                  ×
                </button>
              </div>
              {goal.task_count > 0 && (
                <div className="mt-4">
                  <ProgressBar
                    progress={goal.progress}
                    completed={goal.completed_task_count}
                    total={goal.task_count}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="目標追加" onClose={() => setShowCreate(false)}>
          <GoalForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreate(false)}
            loading={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
