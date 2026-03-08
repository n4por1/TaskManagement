import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog, HabitWithStats } from '@/types';
import { loadHabits, saveHabits, loadLogs, toggleLog } from '@/utils/storage';
import { buildHabitWithStats, toDateString, isScheduledOn } from '@/utils/stats';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = toDateString(new Date());

  const load = useCallback(async () => {
    const [h, l] = await Promise.all([loadHabits(), loadLogs()]);
    setHabits(h);
    setLogs(l);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const todayHabits: HabitWithStats[] = habits
    .filter((h) => isScheduledOn(h, new Date()))
    .map((h) => buildHabitWithStats(h, logs, today));

  const allHabitsWithStats: HabitWithStats[] = habits.map((h) =>
    buildHabitWithStats(h, logs, today)
  );

  async function addHabit(habit: Habit) {
    const next = [...habits, habit];
    setHabits(next);
    await saveHabits(next);
  }

  async function updateHabit(updated: Habit) {
    const next = habits.map((h) => (h.id === updated.id ? updated : h));
    setHabits(next);
    await saveHabits(next);
  }

  async function deleteHabit(id: string) {
    const next = habits.filter((h) => h.id !== id);
    setHabits(next);
    await saveHabits(next);
  }

  async function toggle(habitId: string) {
    const completed = await toggleLog(habitId, today);
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.habitId === habitId && l.date === today);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { habitId, date: today, completed };
        return next;
      }
      return [...prev, { habitId, date: today, completed }];
    });
  }

  return {
    habits,
    logs,
    loading,
    todayHabits,
    allHabitsWithStats,
    addHabit,
    updateHabit,
    deleteHabit,
    toggle,
    reload: load,
  };
}
