import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { FREQUENCY_LABELS } from '@/components/HabitForm';

export default function HabitsScreen() {
  const { allHabitsWithStats, deleteHabit } = useHabits();

  function handleDelete(id: string, title: string) {
    Alert.alert('削除確認', `「${title}」を削除しますか？\n記録も全て消えます。`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => deleteHabit(id),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.list}>
        {allHabitsWithStats.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>習慣を追加してみましょう！</Text>
          </View>
        ) : (
          allHabitsWithStats.map((habit) => (
            <View key={habit.id} style={styles.card}>
              <View style={[styles.colorBar, { backgroundColor: habit.color }]} />
              <View style={styles.content}>
                <Text style={styles.emoji}>{habit.emoji}</Text>
                <View style={styles.info}>
                  <Text style={styles.title}>{habit.title}</Text>
                  <Text style={styles.freq}>{FREQUENCY_LABELS[habit.frequency]}</Text>
                  <View style={styles.stats}>
                    <Text style={styles.statText}>🔥 {habit.currentStreak}日連続</Text>
                    <Text style={styles.statText}>  {habit.completionRate}% (30日)</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/habit-form', params: { id: habit.id } })}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(habit.id, habit.title)}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/habit-form')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 64 },
  emptyText: { marginTop: 16, color: '#6b7280', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  colorBar: { width: 6 },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14 },
  emoji: { fontSize: 32, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  freq: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  stats: { flexDirection: 'row', marginTop: 6 },
  statText: { fontSize: 12, color: '#6b7280' },
  actions: { flexDirection: 'column', gap: 8 },
  actionBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
