import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeType = 'present' | 'partial' | 'absent' | 'active';

interface StatusBadgeProps {
  type: BadgeType;
}

const configs = {
  present: { bg: '#F0FDF4', text: '#16A34A', border: '#86EFAC', label: 'Présent', dot: '#16A34A' },
  partial: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', label: 'Arrivée', dot: '#D97706' },
  absent: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Absent', dot: '#DC2626' },
  active: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', label: 'En cours', dot: '#2563EB' },
};

export default function StatusBadge({ type }: StatusBadgeProps) {
  const c = configs[type];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});
