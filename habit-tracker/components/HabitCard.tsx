import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitWithStats } from '@/types';

interface Props {
  habit: HabitWithStats;
  onToggle: () => void;
}

export function HabitCard({ habit, onToggle }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, habit.todayCompleted && styles.cardDone]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.colorBar, { backgroundColor: habit.color }]} />
      <View style={styles.body}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
        <View style={styles.info}>
          <Text style={[styles.title, habit.todayCompleted && styles.titleDone]}>
            {habit.title}
          </Text>
          {habit.currentStreak > 0 && (
            <Text style={styles.streak}>🔥 {habit.currentStreak}日連続</Text>
          )}
        </View>
        <View style={[styles.check, habit.todayCompleted && { backgroundColor: habit.color }]}>
          {habit.todayCompleted && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDone: {
    opacity: 0.75,
  },
  colorBar: { width: 6 },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  emoji: { fontSize: 30, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  titleDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  streak: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
