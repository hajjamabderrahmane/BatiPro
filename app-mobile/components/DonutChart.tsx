import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DonutChartProps {
  percent: number;
}

export default function DonutChart({ percent }: DonutChartProps) {
  const size = 112;
  const r = 44;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const greenArc = (percent / 100) * circ;
  const gapArc = circ - greenArc;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#FEE2E2"
          strokeWidth={12}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#16A34A"
          strokeWidth={12}
          strokeDasharray={`${greenArc} ${gapArc}`}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.sub}>présence</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
  },
  percent: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  sub: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
});
