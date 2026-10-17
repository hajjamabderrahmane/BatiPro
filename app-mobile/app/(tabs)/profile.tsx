import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../constants/colors';

const INFO_LABELS: Record<string, string> = {
  email: 'Email',
  role: 'Rôle',
  nom: 'Nom',
  prenom: 'Prénom',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { utilisateur, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const name = utilisateur?.name || 'Utilisateur';
  const initials = useMemo(() => {
    if (utilisateur?.prenom && utilisateur?.nom) {
      return `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [name, utilisateur]);

  const roleLabel = utilisateur?.role === 'chef_chantier' ? 'Chef de chantier' : utilisateur?.role === 'admin' ? 'Administrateur' : 'Employé';

  const infoRows = useMemo(() => {
    if (!utilisateur) return [['Email', '—'], ['Rôle', '—'], ['Nom', '—'], ['Prénom', '—']];
    return [
      ['Email', utilisateur.email || '—'],
      ['Rôle', roleLabel],
      ['Nom', utilisateur.nom || '—'],
      ['Prénom', utilisateur.prenom || '—'],
    ];
  }, [utilisateur, roleLabel]);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.replace('/splash');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Informations personnelles</Text>
          </View>
          {infoRows.map(([label, val], i) => (
            <View key={label} style={[styles.row, i < infoRows.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowVal}>{val}</Text>
            </View>
          ))}
        </Card>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.logoutText}>Déconnexion</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.navy,
    paddingTop: 8,
    paddingBottom: 56,
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  nameBlock: { alignItems: 'center', gap: 8 },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.orange },
  roleText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#fff' },
  scroll: { flex: 1, marginTop: -24 },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  rowVal: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  logoutBtn: {
    backgroundColor: Colors.red,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
