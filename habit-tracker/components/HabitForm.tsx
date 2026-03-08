import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Frequency, Habit } from '@/types';

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: '毎日',
  weekdays: '平日（月〜金）',
  weekends: '週末（土日）',
  custom: 'カスタム',
};

const EMOJIS = ['✅', '💪', '📚', '🏃', '🧘', '💧', '🛌', '🍎', '✍️', '🎯', '🎵', '🧹'];
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

interface Props {
  initial?: Partial<Habit>;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function HabitForm({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✅');
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'daily');
  const [customDays, setCustomDays] = useState<number[]>(initial?.customDays ?? [1, 2, 3, 4, 5]);
  const [color, setColor] = useState(initial?.color ?? '#6366f1');

  function toggleDay(day: number) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('入力エラー', 'タイトルを入力してください');
      return;
    }
    if (frequency === 'custom' && customDays.length === 0) {
      Alert.alert('入力エラー', '曜日を1つ以上選択してください');
      return;
    }
    onSave({ title: title.trim(), emoji, frequency, customDays, color });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* タイトル */}
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 毎朝30分ウォーキング"
        placeholderTextColor="#9ca3af"
        maxLength={50}
        returnKeyType="done"
      />

      {/* 絵文字 */}
      <Text style={styles.label}>アイコン</Text>
      <View style={styles.emojiGrid}>
        {EMOJIS.map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
            onPress={() => setEmoji(e)}
          >
            <Text style={styles.emojiText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 頻度 */}
      <Text style={styles.label}>頻度</Text>
      {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.radioBtn, frequency === f && styles.radioBtnActive]}
          onPress={() => setFrequency(f)}
        >
          <View style={[styles.radioCircle, frequency === f && { borderColor: color }]}>
            {frequency === f && <View style={[styles.radioDot, { backgroundColor: color }]} />}
          </View>
          <Text style={[styles.radioLabel, frequency === f && { color }]}>
            {FREQUENCY_LABELS[f]}
          </Text>
        </TouchableOpacity>
      ))}

      {/* カスタム曜日 */}
      {frequency === 'custom' && (
        <View style={styles.daysRow}>
          {DAY_LABELS.map((label, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayBtn,
                customDays.includes(i) && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => toggleDay(i)}
            >
              <Text style={[styles.dayText, customDays.includes(i) && { color: '#fff' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* カラー */}
      <Text style={styles.label}>カラー</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorBtnActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      {/* ボタン */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  emojiBtnActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  emojiText: { fontSize: 22 },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioBtnActive: { backgroundColor: '#f5f3ff', borderColor: '#c4b5fd' },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15, color: '#374151' },
  daysRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  colorBtnActive: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
  saveBtn: { flex: 2, padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
