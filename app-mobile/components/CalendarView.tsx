import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Colors } from '../constants/colors';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

interface CalendarViewProps {
  empty?: boolean;
  attendance?: Record<string, 'present' | 'partial'>;
  onDaySelect?: (date: string) => void;
}

export default function CalendarView({ empty, attendance = {}, onDaySelect }: CalendarViewProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dateKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const isToday = (d: number) => year === now.getFullYear() && month === now.getMonth() && d === now.getDate();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setMonth(m => Math.max(0, m - 1))}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="15 18 9 12 15 6" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity
          onPress={() => setMonth(m => Math.min(11, m + 1))}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="9 18 15 12 9 6" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNames}>
        {DAYS.map(d => (
          <View key={d} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e-${i}`} style={styles.gridCell} />;
          const k = dateKey(d);
          const today = isToday(d);
          const sel = k === selected;
          const att = empty ? undefined : attendance[k];
          return (
            <View key={k} style={styles.gridCell}>
              <TouchableOpacity
                onPress={() => { setSelected(k); onDaySelect?.(k); }}
                activeOpacity={0.7}
                style={[
                  styles.dayBtn,
                  today ? styles.todayBtn : sel ? styles.selectedBtn : null,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  today ? styles.todayText : sel ? styles.selectedText : null,
                ]}>
                  {d}
                </Text>
              </TouchableOpacity>
              {!empty && att ? (
                <View style={[styles.dot, { backgroundColor: att === 'present' ? '#16A34A' : '#FBBF24' }]} />
              ) : (
                <View style={styles.dotPlaceholder} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  navBtn: { padding: 6, borderRadius: 8 },
  monthLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  dayNames: { flexDirection: 'row' },
  dayNameCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayNameText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '14.28%', alignItems: 'center', paddingVertical: 2 },
  dayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtn: { backgroundColor: Colors.navy },
  selectedBtn: { backgroundColor: Colors.navyLight },
  dayText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.text },
  todayText: { color: '#fff', fontFamily: 'Inter_600SemiBold' },
  selectedText: { color: Colors.navy },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  dotPlaceholder: { width: 5, height: 5, marginTop: 2 },
});
