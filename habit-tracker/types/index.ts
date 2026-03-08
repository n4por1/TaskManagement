export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  frequency: Frequency;
  customDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  color: string;
  createdAt: string; // ISO date string
}

export interface HabitLog {
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
}

export type HabitWithStats = Habit & {
  todayCompleted: boolean;
  currentStreak: number;
  completionRate: number; // 0-100, last 30 days
};
