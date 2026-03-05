import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/client'
import type { Task, TaskCreate } from '../types'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { Modal } from './Modal'
import { TaskForm } from './TaskForm'

interface Props {
  tasks: Task[]
  goalId: number
}

interface TaskRowProps {
  task: Task
  goalId: number
  depth: number
}

function TaskRow({ task, goalId, depth }: TaskRowProps) {
  const [showAddChild, setShowAddChild] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['goal', goalId] })
    qc.invalidateQueries({ queryKey: ['tasks', goalId] })
  }

  const createMutation = useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data),
    onSuccess: () => { invalidate(); setShowAddChild(false) },
  })

  const updateMutation = useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.update(task.id, data),
    onSuccess: () => { invalidate(); setShowEdit(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: invalidate,
  })

  const isLeaf = task.children.length === 0
  const canAddChild = depth < 2  // root=1, child=2 → max depth 2 means no more children at depth 2

  const pct = Math.round(task.progress * 100)

  return (
    <div>
      <div className={`flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 group ${depth === 1 ? 'border-l-2 border-blue-300' : 'border-l-2 border-gray-200'}`}>
        {/* Expand toggle */}
        <button
          className="mt-0.5 w-4 shrink-0 text-gray-400 hover:text-gray-600"
          onClick={() => setExpanded((e) => !e)}
        >
          {task.children.length > 0 ? (expanded ? '▾' : '▸') : '·'}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-medium ${task.status === '完了' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.due_date && (
              <span className="text-xs text-gray-400">{task.due_date}</span>
            )}
          </div>
          {task.description && (
            <p className="mt-0.5 text-xs text-gray-500 truncate">{task.description}</p>
          )}
          {!isLeaf && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 w-24 rounded-full bg-gray-200">
                <div className="h-1 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400">{pct}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canAddChild && (
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setShowAddChild(true)}
            >
              + 子タスク
            </button>
          )}
          <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setShowEdit(true)}>編集</button>
          <button
            className="text-xs text-red-400 hover:text-red-600"
            onClick={() => { if (confirm(`「${task.title}」を削除しますか？`)) deleteMutation.mutate() }}
          >
            削除
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && task.children.length > 0 && (
        <div className="ml-6">
          {task.children.map((child) => (
            <TaskRow key={child.id} task={child} goalId={goalId} depth={depth + 1} />
          ))}
        </div>
      )}

      {showAddChild && (
        <Modal title="子タスク追加" onClose={() => setShowAddChild(false)}>
          <TaskForm
            goalId={goalId}
            parentTaskId={task.id}
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowAddChild(false)}
            loading={createMutation.isPending}
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title="タスク編集" onClose={() => setShowEdit(false)}>
          <TaskForm
            initial={task}
            goalId={goalId}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setShowEdit(false)}
            loading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}

export function WbsTree({ tasks, goalId }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['goal', goalId] })
    qc.invalidateQueries({ queryKey: ['tasks', goalId] })
  }

  const createMutation = useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data),
    onSuccess: () => { invalidate(); setShowAdd(false) },
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">WBS</h3>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(true)}>
          + タスク追加
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">タスクがありません</p>
      ) : (
        <div className="space-y-1">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} goalId={goalId} depth={1} />
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="タスク追加" onClose={() => setShowAdd(false)}>
          <TaskForm
            goalId={goalId}
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowAdd(false)}
            loading={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
