import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { HabitForm } from '@/components/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/types';

export default function HabitFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { habits, addHabit, updateHabit } = useHabits();
  const navigation = useNavigation();

  const existing = id ? habits.find((h) => h.id === id) : undefined;

  useEffect(() => {
    navigation.setOptions({ title: existing ? '習慣を編集' : '習慣を追加' });
  }, [existing]);

  function handleSave(data: Omit<Habit, 'id' | 'createdAt'>) {
    if (existing) {
      updateHabit({ ...existing, ...data });
    } else {
      addHabit({
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...data,
      });
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HabitForm
        initial={existing}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
});
