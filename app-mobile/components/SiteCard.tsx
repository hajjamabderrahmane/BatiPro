import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import type { BackendChantier } from '../src/services/api';

interface SiteCardProps {
  chantier?: BackendChantier | null;
}

export default function SiteCard({ chantier }: SiteCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>Chantier assigné</Text>
        <Text style={styles.name}>{chantier?.nom ?? 'Aucun chantier'}</Text>
        <View style={styles.addressRow}>
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
            <Circle cx={12} cy={10} r={3} />
          </Svg>
          <Text style={styles.address}>{chantier?.adresse ?? '—'}</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>En cours</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  info: { flex: 1 },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 12,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.blue,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.blue,
  },
});
