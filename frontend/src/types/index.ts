export type GoalStatus = '未着手' | '進行中' | '完了' | '中止'
export type TaskStatus = '未着手' | '進行中' | '待ち' | '完了'
export type Priority = '低' | '中' | '高'

export interface Goal {
  id: number
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: GoalStatus
  priority: Priority
  success_criteria: string | null
  parent_goal_id: number | null
  created_at: string
  progress: number
  task_count: number
  completed_task_count: number
}

export interface Task {
  id: number
  title: string
  description: string | null
  due_date: string | null
  status: TaskStatus
  priority: Priority
  goal_id: number | null
  parent_task_id: number | null
  created_at: string
  completed_at: string | null
  progress: number
  children: Task[]
}

export interface GoalCreate {
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status?: GoalStatus
  priority?: Priority
  success_criteria?: string
  parent_goal_id?: number
}

export interface GoalUpdate extends Partial<GoalCreate> {}

export interface TaskCreate {
  title: string
  description?: string
  due_date?: string
  status?: TaskStatus
  priority?: Priority
  goal_id?: number
  parent_task_id?: number
}

export interface TaskUpdate extends Partial<TaskCreate> {}

export interface SuggestedTask {
  title: string
  description: string
  subtasks: string[]
}

export interface SuggestTasksResponse {
  tasks: SuggestedTask[]
}
