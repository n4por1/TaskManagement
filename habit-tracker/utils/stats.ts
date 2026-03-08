import { Habit, HabitLog, HabitWithStats } from '@/types';

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isScheduledOn(habit: Habit, date: Date): boolean {
  const day = date.getDay(); // 0=Sun
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return day >= 1 && day <= 5;
    case 'weekends':
      return day === 0 || day === 6;
    case 'custom':
      return habit.customDays?.includes(day) ?? false;
  }
}

export function computeStreak(habit: Habit, logs: HabitLog[]): number {
  const logSet = new Set(
    logs.filter((l) => l.habitId === habit.id && l.completed).map((l) => l.date)
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (!isScheduledOn(habit, d)) continue;
    if (logSet.has(toDateString(d))) {
      streak++;
    } else {
      // 今日がまだ未完了の場合は streak を終わらせない（当日スキップ）
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

export function computeCompletionRate(habit: Habit, logs: HabitLog[]): number {
  const logSet = new Set(
    logs.filter((l) => l.habitId === habit.id && l.completed).map((l) => l.date)
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let scheduled = 0;
  let completed = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (!isScheduledOn(habit, d)) continue;
    scheduled++;
    if (logSet.has(toDateString(d))) completed++;
  }
  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

export function buildHabitWithStats(
  habit: Habit,
  logs: HabitLog[],
  today: string
): HabitWithStats {
  const todayLog = logs.find((l) => l.habitId === habit.id && l.date === today);
  return {
    ...habit,
    todayCompleted: todayLog?.completed ?? false,
    currentStreak: computeStreak(habit, logs),
    completionRate: computeCompletionRate(habit, logs),
  };
}
