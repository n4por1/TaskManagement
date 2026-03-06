import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi, tasksApi } from '../api/client'
import type { GoalCreate, SuggestedTask } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { ProgressBar } from '../components/ProgressBar'
import { WbsTree } from '../components/WbsTree'
import { Modal } from '../components/Modal'
import { GoalForm } from '../components/GoalForm'

function SuggestTasksModal({
  goalId,
  onClose,
}: {
  goalId: number
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['suggest-tasks', goalId],
    queryFn: () => goalsApi.suggestTasks(goalId),
  })

  const addMutation = useMutation({
    mutationFn: async (tasks: SuggestedTask[]) => {
      for (const t of tasks) {
        const parent = await tasksApi.create({
          title: t.title,
          description: t.description || undefined,
          goal_id: goalId,
          status: '未着手',
          priority: '中',
        })
        for (const sub of t.subtasks) {
          await tasksApi.create({
            title: sub,
            goal_id: goalId,
            parent_task_id: parent.id,
            status: '未着手',
            priority: '中',
          })
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', goalId] })
      qc.invalidateQueries({ queryKey: ['goal', goalId] })
      onClose()
    },
  })

  const toggleAll = () => {
    if (!data) return
    if (selected.size === data.tasks.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(data.tasks.map((_, i) => i)))
    }
  }

  const handleAdd = () => {
    if (!data) return
    const tasks = data.tasks.filter((_, i) => selected.has(i))
    addMutation.mutate(tasks)
  }

  return (
    <Modal title="AIタスク提案" onClose={onClose}>
      {isLoading && (
        <div className="py-12 text-center text-gray-400">
          <div className="mb-2 text-2xl">✨</div>
          <p>AIがタスクを考えています...</p>
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-red-500">
          提案の取得に失敗しました。ANTHROPIC_API_KEY が設定されているか確認してください。
        </div>
      )}
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{data.tasks.length} 件のタスクが提案されました</span>
            <button className="text-blue-600 hover:underline" onClick={toggleAll}>
              {selected.size === data.tasks.length ? 'すべて解除' : 'すべて選択'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {data.tasks.map((task, i) => (
              <label
                key={i}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                  selected.has(i) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={selected.has(i)}
                  onChange={() => {
                    const next = new Set(selected)
                    next.has(i) ? next.delete(i) : next.add(i)
                    setSelected(next)
                  }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.description && (
                    <p className="mt-0.5 text-sm text-gray-500">{task.description}</p>
                  )}
                  {task.subtasks.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {task.subtasks.map((sub, j) => (
                        <li key={j} className="text-xs text-gray-400">
                          └ {sub}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button className="btn-ghost" onClick={onClose}>
              キャンセル
            </button>
            <button
              className="btn-primary"
              disabled={selected.size === 0 || addMutation.isPending}
              onClick={handleAdd}
            >
              {addMutation.isPending ? '追加中...' : `${selected.size} 件を追加`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const goalId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [showSuggest, setShowSuggest] = useState(false)

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-700">タスク一覧</h2>
          <button
            className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            onClick={() => setShowSuggest(true)}
          >
            ✨ AIでタスクを洗い出す
          </button>
        </div>
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

      {showSuggest && (
        <SuggestTasksModal goalId={goalId} onClose={() => setShowSuggest(false)} />
      )}
    </div>
  )
}
