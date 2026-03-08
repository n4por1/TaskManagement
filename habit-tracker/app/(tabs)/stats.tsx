import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '@/hooks/useHabits';
import { toDateString, isScheduledOn } from '@/utils/stats';

export default function StatsScreen() {
  const { allHabitsWithStats, logs } = useHabits();

  // 過去7日のカレンダーデータ
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  // 全習慣の総合完了率（今日）
  const todayTotal = allHabitsWithStats.filter((h) => isScheduledOn(h, new Date())).length;
  const todayDone = allHabitsWithStats.filter((h) => h.todayCompleted).length;

  // 最長ストリーク
  const maxStreak = allHabitsWithStats.reduce((m, h) => Math.max(m, h.currentStreak), 0);

  // 過去30日の完了数
  const totalLast30 = logs.filter((l) => {
    if (!l.completed) return false;
    const d = new Date(l.date);
    const diff = (new Date().getTime() - d.getTime()) / 86400000;
    return diff <= 30;
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* サマリーカード */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#6366f1' }]}>
            <Text style={styles.summaryValue}>{todayDone}/{todayTotal}</Text>
            <Text style={styles.summaryLabel}>今日の達成</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.summaryValue}>🔥 {maxStreak}</Text>
            <Text style={styles.summaryLabel}>最長連続日数</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
            <Text style={styles.summaryValue}>{totalLast30}</Text>
            <Text style={styles.summaryLabel}>30日間の完了数</Text>
          </View>
        </View>

        {/* 習慣ごとの詳細 */}
        <Text style={styles.sectionTitle}>習慣ごとの統計</Text>
        {allHabitsWithStats.length === 0 ? (
          <Text style={styles.noData}>まだデータがありません</Text>
        ) : (
          allHabitsWithStats.map((habit) => (
            <View key={habit.id} style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Text style={styles.streakBadge}>🔥 {habit.currentStreak}日</Text>
              </View>

              {/* 完了率バー */}
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>30日達成率</Text>
                <Text style={styles.rateValue}>{habit.completionRate}%</Text>
              </View>
              <View style={styles.rateBg}>
                <View
                  style={[
                    styles.rateFill,
                    {
                      width: `${habit.completionRate}%`,
                      backgroundColor: habit.color,
                    },
                  ]}
                />
              </View>

              {/* 週間カレンダー */}
              <View style={styles.weekRow}>
                {last7Days.map((d) => {
                  const dateStr = toDateString(d);
                  const scheduled = isScheduledOn(habit, d);
                  const done = logs.some(
                    (l) => l.habitId === habit.id && l.date === dateStr && l.completed
                  );
                  return (
                    <View key={dateStr} style={styles.dayCell}>
                      <Text style={styles.dayLabel}>{dayLabels[d.getDay()]}</Text>
                      <View
                        style={[
                          styles.daydot,
                          !scheduled && styles.daySkipped,
                          scheduled && done && { backgroundColor: habit.color },
                          scheduled && !done && styles.dayMissed,
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  summaryValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  noData: { color: '#9ca3af', textAlign: 'center', marginTop: 32 },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  habitEmoji: { fontSize: 22, marginRight: 8 },
  habitTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  streakBadge: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rateLabel: { fontSize: 12, color: '#6b7280' },
  rateValue: { fontSize: 12, fontWeight: '600', color: '#374151' },
  rateBg: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  rateFill: { height: '100%', borderRadius: 3 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 10, color: '#9ca3af' },
  daydot: { width: 28, height: 28, borderRadius: 14 },
  daySkipped: { backgroundColor: '#f3f4f6' },
  dayMissed: { backgroundColor: '#fee2e2' },
});
