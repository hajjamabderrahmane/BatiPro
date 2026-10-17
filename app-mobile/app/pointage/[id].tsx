import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Path, Circle } from 'react-native-svg';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { getHistorique } from '../../src/services/api';
import type { Pointage } from '../../src/services/api';
import { Colors } from '../../constants/colors';

function ChevronLeft() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function MapPinIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={Colors.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
      <Circle cx={12} cy={10} r={3} />
    </Svg>
  );
}

export default function PointageDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pointage, setPointage] = useState<Pointage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const all = await getHistorique();
        const found = all.find(p => p.id === id);
        if (found) {
          setPointage(found);
        } else {
          setError('Pointage introuvable');
        }
      } catch {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail du pointage</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pointage) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail du pointage</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={styles.errorText}>{error || 'Pointage introuvable'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rows = [
    ['Chantier', pointage.chantier_nom || '—'],
    ['Arrivée', pointage.arrivee],
    ['Départ', pointage.depart],
    ['Durée', pointage.duree],
    ['Localisation', pointage.localisation || '—'],
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du pointage</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.detailCard}>
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{pointage.date_formatted}</Text>
            <StatusBadge type={pointage.type} />
          </View>
          <View style={styles.divider} />
          {rows.map(([label, val], i) => (
            <View key={label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowVal}>{val}</Text>
            </View>
          ))}
        </Card>

        {pointage.localisation ? (
          <Card style={styles.mapCard}>
            <Text style={styles.mapLabel}>Localisation GPS</Text>
            <View style={styles.mapPlaceholder}>
              <MapPinIcon />
              <Text style={styles.mapText}>{pointage.localisation}</Text>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  detailCard: { padding: 0, overflow: 'hidden' },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  dateText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  rowVal: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  mapCard: { padding: 16, gap: 12 },
  mapLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  mapPlaceholder: {
    height: 128,
    borderRadius: 12,
    backgroundColor: Colors.navyLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.navy },
  errorText: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
