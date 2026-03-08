import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';

export default function TodayScreen() {
  const { todayHabits, loading, toggle, reload } = useHabits();

  const completed = todayHabits.filter((h) => h.todayCompleted).length;
  const total = todayHabits.length;
  const progress = total === 0 ? 0 : completed / total;

  const today = new Date();
  const dateLabel = today.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ヘッダーサマリー */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{dateLabel}</Text>
        <Text style={styles.summaryText}>
          {total === 0 ? '習慣を追加しよう！' : `${completed} / ${total} 完了`}
        </Text>

        {/* プログレスバー */}
        {total > 0 && (
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>

      {/* リスト */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      >
        {total === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>まだ習慣がありません{'\n'}追加してみましょう！</Text>
          </View>
        ) : (
          todayHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onToggle={() => toggle(habit.id)} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
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
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dateText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  summaryText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  progressBg: {
    marginTop: 12,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  list: { padding: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 64 },
  emptyText: { marginTop: 16, color: '#6b7280', textAlign: 'center', fontSize: 16, lineHeight: 24 },
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
