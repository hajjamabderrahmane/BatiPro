import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface PrimaryBtnProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  color?: string;
}

export default function PrimaryBtn({ children, onPress, disabled, loading, style, color }: PrimaryBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: color ?? Colors.navy }, (disabled || loading) && styles.disabled, style]}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={styles.label}>{children}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  disabled: {
    opacity: 0.5,
  },
});
