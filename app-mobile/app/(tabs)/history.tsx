import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import CalendarView from '../../components/CalendarView';
import DonutChart from '../../components/DonutChart';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import { getHistorique, getMonChantier } from '../../src/services/api';
import type { Pointage, BackendChantier } from '../../src/services/api';
import { Colors } from '../../constants/colors';

const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function HistoryScreen() {
  const router = useRouter();
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [chantier, setChantier] = useState<BackendChantier | null>(null);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'partial'>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { m: now.getMonth(), y: now.getFullYear() };
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  async function loadData() {
    try {
      const [ptgs, ch] = await Promise.all([
        getHistorique(),
        getMonChantier(),
      ]);
      setPointages(ptgs);
      setChantier(ch);
      buildAttendance(ptgs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function buildAttendance(ptgs: Pointage[]) {
    const map: Record<string, 'present' | 'partial'> = {};
    for (const p of ptgs) {
      const key = p.date;
      if (p.type === 'present') map[key] = 'present';
      else if (!map[key]) map[key] = 'partial';
    }
    setAttendance(map);
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Monthly stats
  const monthKey = `${month.y}-${String(month.m + 1).padStart(2, '0')}`;
  const monthPtgs = pointages.filter(p => {
    return p.date.startsWith(monthKey);
  });
  const presentCount = monthPtgs.filter(p => p.type === 'present').length;
  const partialCount = monthPtgs.filter(p => p.type === 'partial').length;
  const totalDays = monthPtgs.length;
  const totalWorkedMin = monthPtgs.reduce((acc, p) => {
    if (p.duree && p.duree !== '—') {
      const parts = p.duree.replace('h', ':').split(':');
      return acc + parseInt(parts[0], 10) * 60 + parseInt(parts[1] ?? '0', 10);
    }
    return acc;
  }, 0);
  const totalHours = Math.round(totalWorkedMin / 60);
  const pct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  // CalendarView attendance prop — only show for current month
  const now = new Date();
  const isCurrentMonth = month.m === now.getMonth() && month.y === now.getFullYear();

  const displayedEntries = pointages
    .filter(p => {
      if (!selectedDay) return true;
      return p.date === selectedDay;
    })
    .sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return db.getTime() - da.getTime();
    });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
        <Text style={styles.headerSub}>{chantier?.nom ?? 'Tous chantiers'}</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <Card style={styles.calCard}>
          <CalendarView
            empty={!isCurrentMonth}
            attendance={attendance}
            onDaySelect={(date) => setSelectedDay(prev => prev === date ? null : date)}
          />
        </Card>

        {totalDays > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Résumé du mois</Text>
            <View style={styles.summaryRow}>
              <DonutChart percent={pct} />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={styles.legendText}>Présent — {presentCount} j.</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FCA5A5' }]} />
                  <Text style={styles.legendText}>Absent — {partialCount} j.</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={{ gap: 12 }}>
              <ProgressBar label="Heures travaillées" value={totalHours} max={176} unit="h" />
              <ProgressBar label="Ponctualité" value={presentCount + partialCount} max={22} unit="j" />
            </View>
          </Card>
        )}

        <View>
          <Text style={styles.listTitle}>
            {selectedDay ? `Pointages du ${selectedDay}` : 'Pointages récents'}
          </Text>
          {displayedEntries.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun pointage trouvé</Text>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {displayedEntries.map(e => (
                <TouchableOpacity
                  key={e.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/pointage/${e.id}` as any)}
                >
                  <Card style={styles.entryCard}>
                    <View style={styles.entryRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.entryDate}>{e.date_formatted}</Text>
                        <Text style={styles.entryTimes}>
                          {e.arrivee} → {e.depart}{e.duree !== '—' ? ` · ${e.duree}` : ''}
                        </Text>
                      </View>
                      <StatusBadge type={e.type} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  calCard: { padding: 16 },
  summaryCard: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, backgroundColor: Colors.border },
  listTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  entryCard: { padding: 16 },
  entryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryDate: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  entryTimes: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 4 },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
});
