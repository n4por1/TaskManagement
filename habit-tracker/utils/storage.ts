import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog } from '@/types';

const HABITS_KEY = 'habits';
const LOGS_KEY = 'habit_logs';

export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABITS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadLogs(): Promise<HabitLog[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveLogs(logs: HabitLog[]): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function toggleLog(habitId: string, date: string): Promise<boolean> {
  const logs = await loadLogs();
  const idx = logs.findIndex((l) => l.habitId === habitId && l.date === date);
  let completed: boolean;
  if (idx >= 0) {
    completed = !logs[idx].completed;
    logs[idx] = { habitId, date, completed };
  } else {
    completed = true;
    logs.push({ habitId, date, completed });
  }
  await saveLogs(logs);
  return completed;
}
