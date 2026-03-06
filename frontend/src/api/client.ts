import axios from 'axios'
import type { Goal, GoalCreate, GoalUpdate, Task, TaskCreate, TaskUpdate, SuggestTasksResponse } from '../types'

const http = axios.create({ baseURL: '/api' })

// ─── Goals ───────────────────────────────────────────────────────────────────

export const goalsApi = {
  list: () => http.get<Goal[]>('/goals').then((r) => r.data),
  get: (id: number) => http.get<Goal>(`/goals/${id}`).then((r) => r.data),
  create: (data: GoalCreate) => http.post<Goal>('/goals', data).then((r) => r.data),
  update: (id: number, data: GoalUpdate) =>
    http.patch<Goal>(`/goals/${id}`, data).then((r) => r.data),
  delete: (id: number) => http.delete(`/goals/${id}`),
  suggestTasks: (id: number) =>
    http.post<SuggestTasksResponse>(`/goals/${id}/suggest-tasks`).then((r) => r.data),
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { goal_id?: number; status?: string }) =>
    http.get<Task[]>('/tasks', { params }).then((r) => r.data),
  get: (id: number) => http.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (data: TaskCreate) => http.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: number, data: TaskUpdate) =>
    http.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),
  delete: (id: number) => http.delete(`/tasks/${id}`),
}
