import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface OutlineBtnProps {
  children: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  style?: ViewStyle;
}

export default function OutlineBtn({ children, onPress, danger, style }: OutlineBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.btn,
        danger ? styles.danger : styles.normal,
        style,
      ]}
    >
      <Text style={[styles.label, danger ? styles.dangerText : styles.normalText]}>
        {children}
      </Text>
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
    borderWidth: 1,
  },
  normal: {
    borderColor: Colors.border,
  },
  danger: {
    borderColor: '#FCA5A5',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  normalText: {
    color: Colors.navy,
  },
  dangerText: {
    color: Colors.red,
  },
});
