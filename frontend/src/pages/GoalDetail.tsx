import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi, tasksApi } from '../api/client'
import type { GoalCreate } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { ProgressBar } from '../components/ProgressBar'
import { WbsTree } from '../components/WbsTree'
import { Modal } from '../components/Modal'
import { GoalForm } from '../components/GoalForm'

export function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const goalId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)

  const { data: goal, isLoading: loadingGoal } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => goalsApi.get(goalId),
  })

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', goalId],
    queryFn: () => tasksApi.list({ goal_id: goalId }),
  })

  const updateMutation = useMutation({
    mutationFn: (data: GoalCreate) => goalsApi.update(goalId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goal', goalId] }); setShowEdit(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: () => goalsApi.delete(goalId),
    onSuccess: () => navigate('/'),
  })

  if (loadingGoal || loadingTasks) return <div className="p-8 text-gray-400">読み込み中…</div>
  if (!goal) return <div className="p-8 text-red-400">目標が見つかりません</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-400">
        <Link to="/" className="hover:text-blue-500">ダッシュボード</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{goal.title}</span>
      </div>

      {/* Goal header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
            {goal.description && (
              <p className="mt-2 text-gray-600 whitespace-pre-line">{goal.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={goal.status} />
              <PriorityBadge priority={goal.priority} />
              {goal.start_date && <span className="text-xs text-gray-400">開始: {goal.start_date}</span>}
              {goal.end_date && <span className="text-xs text-gray-400">期限: {goal.end_date}</span>}
            </div>
            {goal.success_criteria && (
              <div className="mt-3 rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-green-700 mb-1">成功条件</p>
                <p className="text-sm text-green-800 whitespace-pre-line">{goal.success_criteria}</p>
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="btn-ghost text-sm" onClick={() => setShowEdit(true)}>編集</button>
            <button
              className="text-sm text-red-400 hover:text-red-600 font-medium"
              onClick={() => { if (confirm(`「${goal.title}」を削除しますか？`)) deleteMutation.mutate() }}
            >
              削除
            </button>
          </div>
        </div>

        {goal.task_count > 0 && (
          <div className="mt-5 border-t pt-4">
            <ProgressBar
              progress={goal.progress}
              completed={goal.completed_task_count}
              total={goal.task_count}
            />
          </div>
        )}
      </div>

      {/* WBS */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <WbsTree tasks={tasks} goalId={goalId} />
      </div>

      {showEdit && (
        <Modal title="目標編集" onClose={() => setShowEdit(false)}>
          <GoalForm
            initial={goal}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setShowEdit(false)}
            loading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
