import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
}

export default function ProgressBar({ label, value, max, unit }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}/{max} {unit}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_500Medium' },
  value: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  track: { height: 8, borderRadius: 4, backgroundColor: Colors.navyLight, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: Colors.navy },
});
