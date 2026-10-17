// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// import { useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Svg, { Path, Polyline } from 'react-native-svg';
// import Card from '../../components/Card';
// import SiteCard from '../../components/SiteCard';
// import ProgressBar from '../../components/ProgressBar';
// import { useAuth } from '../../src/context/AuthContext';
// import { getMonChantier, getPointageAujourdhui, getHistorique } from '../../src/services/api';
// import type { BackendChantier, BackendPointage, Pointage } from '../../src/services/api';
// import { Colors } from '../../constants/colors';

// type HomeState = 'loading' | 'empty' | 'arrived' | 'done';

// function BellIcon() {
//   return (
//     <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
//       <Path d="M13.73 21a2 2 0 01-3.46 0" />
//     </Svg>
//   );
// }

// function QrIcon() {
//   return (
//     <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M3 3h5v5H3z" />
//       <Path d="M16 3h5v5h-5z" />
//       <Path d="M3 16h5v5H3z" />
//       <Path d="M16 16h5v5h-5z" />
//       <Path d="M21 16v5M16 21h5" />
//     </Svg>
//   );
// }

// function CheckIcon({ size = 16, color = 'white' }: { size?: number; color?: string }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
//       <Polyline points="20 6 9 17 4 12" />
//     </Svg>
//   );
// }

// const JOURS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
// const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// function formatDate(date: Date) {
//   const jour = JOURS_FR[date.getDay()];
//   const jourNum = date.getDate();
//   const mois = MOIS_FR[date.getMonth()];
//   const an = date.getFullYear();
//   return `${jour} ${jourNum} ${mois} ${an}`;
// }

// export default function HomeScreen() {
//   const router = useRouter();
//   const { utilisateur } = useAuth();
//   const [homeState, setHomeState] = useState<HomeState>('loading');
//   const [chantier, setChantier] = useState<BackendChantier | null>(null);
//   const [todayPointage, setTodayPointage] = useState<BackendPointage | null>(null);
//   const [weekHours, setWeekHours] = useState(0);
//   const [weekDays, setWeekDays] = useState(0);

//   const userName = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : 'Utilisateur';
//   const initials = utilisateur ? `${utilisateur.prenom?.[0] ?? ''}${utilisateur.nom?.[0] ?? ''}`.toUpperCase() : 'U';
//   const today = new Date();
//   const dateStr = formatDate(today);

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function loadData() {
//     try {
//       const [chantierData, pointageData, history] = await Promise.all([
//         getMonChantier(),
//         getPointageAujourdhui(),
//         getHistorique(),
//       ]);

//       setChantier(chantierData);

//       // Compute week stats from history
//       const weekStart = new Date(today);
//       weekStart.setDate(today.getDate() - today.getDay());
//       const weekEnd = new Date(weekStart);
//       weekEnd.setDate(weekStart.getDate() + 6);

//       const weekPointages = history.filter((p: Pointage) => {
//         const d = new Date(p.date + 'T00:00:00');
//         return d >= weekStart && d <= weekEnd;
//       });

//       const workedDays = weekPointages.filter((p: Pointage) => p.type === 'present').length;
//       let totalMin = 0;
//       weekPointages.forEach((p: Pointage) => {
//         if (p.duree && p.duree !== '—') {
//           const parts = p.duree.replace('h', ':').split(':');
//           totalMin += parseInt(parts[0], 10) * 60 + parseInt(parts[1] ?? '0', 10);
//         }
//       });
//       setWeekDays(workedDays);
//       setWeekHours(Math.round(totalMin / 60));

//       // Determine today's state
//       if (pointageData) {
//         setTodayPointage(pointageData);
//         setHomeState(pointageData.heure_depart ? 'done' : 'arrived');
//       } else {
//         setHomeState('empty');
//       }
//     } catch {
//       setHomeState('empty');
//     }
//   }

//   function goToScanner() {
//     router.push('/scan');
//   }

//   const arriveeTime = todayPointage?.heure_arrivee
//     ? todayPointage.heure_arrivee.slice(0, 5)
//     : null;
//   const departTime = todayPointage?.heure_depart
//     ? todayPointage.heure_depart.slice(0, 5)
//     : null;

//   const stats = homeState === 'empty' || homeState === 'loading'
//     ? [
//         { label: 'Arrivée', val: '—', dot: Colors.navy, dim: true },
//         { label: 'Départ', val: '—', dot: Colors.orange, dim: true },
//         { label: 'Durée', val: '—', dot: Colors.textMuted, dim: true },
//       ]
//     : homeState === 'arrived'
//     ? [
//         { label: 'Arrivée', val: arriveeTime ?? '—', dot: Colors.navy, dim: false },
//         { label: 'Départ', val: '—', dot: Colors.orange, dim: true },
//         { label: 'Durée', val: '—', dot: Colors.textMuted, dim: true },
//       ]
//     : [
//         { label: 'Arrivée', val: arriveeTime ?? '—', dot: Colors.navy, dim: false },
//         { label: 'Départ', val: departTime ?? '—', dot: Colors.orange, dim: false },
//         { label: 'Durée', val: '', dot: '#16A34A', dim: false },
//       ];

//   // Calculate duration if both times available
//   let dureeVal = '—';
//   if (arriveeTime && departTime) {
//     const [ah, am] = arriveeTime.split(':').map(Number);
//     const [dh, dm] = departTime.split(':').map(Number);
//     const totalMin = (dh * 60 + dm) - (ah * 60 + am);
//     if (totalMin > 0) {
//       dureeVal = `${Math.floor(totalMin / 60)}h${(totalMin % 60).toString().padStart(2, '0')}`;
//     }
//   }
//   if (homeState === 'done') {
//     stats[2] = { label: 'Durée', val: dureeVal, dot: '#16A34A', dim: false };
//   }

//   if (homeState === 'loading') {
//     return (
//       <SafeAreaView style={styles.safeArea} edges={['top']}>
//         <View style={[styles.header, { justifyContent: 'center', alignItems: 'center' }]}>
//           <ActivityIndicator color="#fff" size="large" />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
// <SafeAreaView style={styles.safeArea} edges={['top']}>
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{initials}</Text>
//           </View>
//           <View>
//             <Text style={styles.greeting}>Bonjour, {utilisateur?.prenom ?? userName}</Text>
//             <Text style={styles.subGreeting}>{dateStr}</Text>
//           </View>
//         </View>
//         <View style={styles.bellBtn}>
//           <BellIcon />
//         </View>
//       </View>

//       <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//         <SiteCard chantier={chantier} />

//         <View style={styles.section}>
//           <Card style={styles.actionCard}>
//             {homeState === 'empty' && (
//               <>
//                 <View style={{ gap: 4 }}>
//                   <Text style={styles.actionLabel}>Arrivée</Text>
//                   <Text style={styles.actionTitle}>Non pointée</Text>
//                   <Text style={styles.actionDesc}>Scannez le QR code du chantier pour enregistrer votre arrivée.</Text>
//                 </View>
//                 <TouchableOpacity style={[styles.scanBtn, { backgroundColor: Colors.navy }]} onPress={goToScanner} activeOpacity={0.8}>
//                   <QrIcon />
//                   <Text style={styles.scanBtnText}>Pointer mon arrivée</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {homeState === 'arrived' && (
//               <>
//                 <View style={{ gap: 8 }}>
//                   <Text style={styles.actionLabel}>Pointage du jour</Text>
//                   <View style={styles.successRow}>
//                     <View style={styles.successCheck}>
//                       <CheckIcon size={10} color="white" />
//                     </View>
//                     <Text style={styles.successText}>
//                       Arrivée enregistrée à <Text style={{ fontFamily: 'Inter_700Bold' }}>{arriveeTime}</Text>
//                     </Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity style={[styles.scanBtn, { backgroundColor: Colors.orange }]} onPress={goToScanner} activeOpacity={0.8}>
//                   <QrIcon />
//                   <Text style={styles.scanBtnText}>Pointer mon départ</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {homeState === 'done' && (
//               <View style={{ gap: 12 }}>
//                 <View style={styles.doneHeader}>
//                   <View style={styles.doneCheck}>
//                     <CheckIcon size={16} />
//                   </View>
//                   <View>
//                     <Text style={styles.doneTitle}>Pointage terminé</Text>
//                     <Text style={styles.doneSub}>Bonne journée !</Text>
//                   </View>
//                 </View>
//                 <View style={styles.statsRow}>
//                   {stats.map(({ label, val, dot }) => (
//                     <View key={label} style={styles.statBox}>
//                       <View style={styles.statLabelRow}>
//                         <View style={[styles.statDot, { backgroundColor: dot }]} />
//                         <Text style={styles.statLabel}>{label}</Text>
//                       </View>
//                       <Text style={styles.statVal}>{val}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             )}
//           </Card>

//           {homeState !== 'done' && (
//             <View style={styles.statsRow}>
//               {stats.map(({ label, val, dot, dim }) => (
//                 <Card key={label} style={styles.statCard}>
//                   <View style={styles.statLabelRow}>
//                     <View style={[styles.statDot, { backgroundColor: dot, opacity: dim ? 0.4 : 1 }]} />
//                     <Text style={styles.statLabel}>{label}</Text>
//                   </View>
//                   <Text style={[styles.statVal, dim && { color: Colors.textPlaceholder }]}>{val}</Text>
//                 </Card>
//               ))}
//             </View>
//           )}

//           {homeState === 'done' && (
//             <Card style={styles.weekCard}>
//               <Text style={styles.weekTitle}>Cette semaine</Text>
//               <View style={{ gap: 12 }}>
//                 <ProgressBar label="Heures travaillées" value={weekHours} max={40} unit="h" />
//                 <ProgressBar label="Ponctualité" value={weekDays} max={5} unit="j" />
//               </View>
//             </Card>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: Colors.background },
//   // header: {
//   //   backgroundColor: Colors.navy,
//   //   paddingHorizontal: 20,
//   //   paddingTop: 8,
//   //   paddingBottom: 24,
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   justifyContent: 'space-between',
//   // },
//   header: {
//     backgroundColor: Colors.navy,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 36,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
// },
//   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: Colors.orange,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
//   greeting: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
//   subGreeting: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 2 },
//   bellBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   scroll: { flex: 1 },
//   content: { padding: 20, paddingBottom: 100 },
//   section: { marginTop: 24, gap: 16 },
//   actionCard: { padding: 20, gap: 16 },
//   actionLabel: {
//     fontSize: 10,
//     fontFamily: 'Inter_600SemiBold',
//     color: Colors.textMuted,
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },
//   actionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
//   actionDesc: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 4 },
//   scanBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     paddingVertical: 14,
//     borderRadius: 12,
//   },
//   scanBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
//   successRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: '#F0FDF4',
//     borderWidth: 1,
//     borderColor: '#86EFAC',
//   },
//   successCheck: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: '#16A34A',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   successText: { fontSize: 14, color: '#16A34A', fontFamily: 'Inter_500Medium', flex: 1 },
//   doneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   doneCheck: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#16A34A',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   doneTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
//   doneSub: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
//   statsRow: { flexDirection: 'row', gap: 10 },
//   statCard: { flex: 1, padding: 12, alignItems: 'center', gap: 6 },
//   statBox: { flex: 1, padding: 12, backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 6 },
//   statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   statDot: { width: 6, height: 6, borderRadius: 3 },
//   statLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
//   statVal: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
//   weekCard: { padding: 16, gap: 12 },
//   weekTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
// });


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';

import Card from '../../components/Card';
import SiteCard from '../../components/SiteCard';
import ProgressBar from '../../components/ProgressBar';

import { useAuth } from '../../src/context/AuthContext';
import {
  getMonChantier,
  getPointageAujourdhui,
  getHistorique,
} from '../../src/services/api';

import type {
  BackendChantier,
  BackendPointage,
  Pointage,
} from '../../src/services/api';

import { Colors } from '../../constants/colors';

type HomeState = 'loading' | 'empty' | 'arrived' | 'done';

function BellIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" />
    </Svg>
  );
}

function QrIcon() {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 3h5v5H3z" />
      <Path d="M16 3h5v5h-5z" />
      <Path d="M3 16h5v5H3z" />
      <Path d="M16 16h5v5h-5z" />
      <Path d="M21 16v5M16 21h5" />
    </Svg>
  );
}

function CheckIcon({
  size = 16,
  color = 'white',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

const JOURS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

const MOIS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

function formatDate(date: Date) {
  const jour = JOURS_FR[date.getDay()];
  const jourNum = date.getDate();
  const mois = MOIS_FR[date.getMonth()];
  const an = date.getFullYear();

  return `${jour} ${jourNum} ${mois} ${an}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { utilisateur } = useAuth();

  const [homeState, setHomeState] =
    useState<HomeState>('loading');

  const [chantier, setChantier] =
    useState<BackendChantier | null>(null);

  const [todayPointage, setTodayPointage] =
    useState<BackendPointage | null>(null);

  const [weekHours, setWeekHours] = useState(0);
  const [weekDays, setWeekDays] = useState(0);

  const userName = utilisateur
    ? `${utilisateur.prenom} ${utilisateur.nom}`
    : 'Utilisateur';

  const initials = utilisateur
    ? `${utilisateur.prenom?.[0] ?? ''}${utilisateur.nom?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const today = new Date();
  const dateStr = formatDate(today);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        chantierData,
        pointageData,
        history,
      ] = await Promise.all([
        getMonChantier(),
        getPointageAujourdhui(),
        getHistorique(),
      ]);

      setChantier(chantierData);

      // Calcul des statistiques de la semaine
      const weekStart = new Date(today);

      weekStart.setDate(
        today.getDate() - today.getDay()
      );

      const weekEnd = new Date(weekStart);

      weekEnd.setDate(
        weekStart.getDate() + 6
      );

      const weekPointages = history.filter(
        (p: Pointage) => {
          const d = new Date(
            p.date + 'T00:00:00'
          );

          return d >= weekStart && d <= weekEnd;
        }
      );

      const workedDays =
        weekPointages.filter(
          (p: Pointage) =>
            p.type === 'present'
        ).length;

      let totalMin = 0;

      weekPointages.forEach(
        (p: Pointage) => {
          if (
            p.duree &&
            p.duree !== '—'
          ) {
            const parts = p.duree
              .replace('h', ':')
              .split(':');

            totalMin +=
              parseInt(parts[0], 10) * 60 +
              parseInt(
                parts[1] ?? '0',
                10
              );
          }
        }
      );

      setWeekDays(workedDays);
      setWeekHours(
        Math.round(totalMin / 60)
      );

      // État du pointage aujourd'hui
      if (pointageData) {
        setTodayPointage(pointageData);

        setHomeState(
          pointageData.heure_depart
            ? 'done'
            : 'arrived'
        );
      } else {
        setHomeState('empty');
      }
    } catch {
      setHomeState('empty');
    }
  }

  function goToScanner() {
    // Sécurité : aucun chantier chargé
    if (!chantier) {
      Alert.alert(
        'Chantier indisponible',
        'Impossible de récupérer votre chantier affecté.'
      );
      return;
    }

    // On transmet au scanner le chantier affecté.
    router.push({
      pathname: '/scan',
      params: {
        chantierId: chantier.id.toString(),
        codeQrAffecte: chantier.code_qr,
      },
    });
  }

  const arriveeTime =
    todayPointage?.heure_arrivee
      ? todayPointage.heure_arrivee.slice(0, 5)
      : null;

  const departTime =
    todayPointage?.heure_depart
      ? todayPointage.heure_depart.slice(0, 5)
      : null;

  const stats =
    homeState === 'empty' ||
    homeState === 'loading'
      ? [
          {
            label: 'Arrivée',
            val: '—',
            dot: Colors.navy,
            dim: true,
          },
          {
            label: 'Départ',
            val: '—',
            dot: Colors.orange,
            dim: true,
          },
          {
            label: 'Durée',
            val: '—',
            dot: Colors.textMuted,
            dim: true,
          },
        ]
      : homeState === 'arrived'
      ? [
          {
            label: 'Arrivée',
            val: arriveeTime ?? '—',
            dot: Colors.navy,
            dim: false,
          },
          {
            label: 'Départ',
            val: '—',
            dot: Colors.orange,
            dim: true,
          },
          {
            label: 'Durée',
            val: '—',
            dot: Colors.textMuted,
            dim: true,
          },
        ]
      : [
          {
            label: 'Arrivée',
            val: arriveeTime ?? '—',
            dot: Colors.navy,
            dim: false,
          },
          {
            label: 'Départ',
            val: departTime ?? '—',
            dot: Colors.orange,
            dim: false,
          },
          {
            label: 'Durée',
            val: '',
            dot: '#16A34A',
            dim: false,
          },
        ];

  let dureeVal = '—';

  if (arriveeTime && departTime) {
    const [ah, am] =
      arriveeTime.split(':').map(Number);

    const [dh, dm] =
      departTime.split(':').map(Number);

    const totalMin =
      dh * 60 +
      dm -
      (ah * 60 + am);

    if (totalMin > 0) {
      dureeVal =
        `${Math.floor(totalMin / 60)}h${(
          totalMin % 60
        )
          .toString()
          .padStart(2, '0')}`;
    }
  }

  if (homeState === 'done') {
    stats[2] = {
      label: 'Durée',
      val: dureeVal,
      dot: '#16A34A',
      dim: false,
    };
  }

  if (homeState === 'loading') {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View
          style={[
            styles.header,
            {
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <ActivityIndicator
            color="#fff"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <View>
            <Text style={styles.greeting}>
              Bonjour, {utilisateur?.prenom ?? userName}
            </Text>

            <Text style={styles.subGreeting}>
              {dateStr}
            </Text>
          </View>
        </View>

        <View style={styles.bellBtn}>
          <BellIcon />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SiteCard chantier={chantier} />

        <View style={styles.section}>
          <Card style={styles.actionCard}>
            {homeState === 'empty' && (
              <>
                <View style={{ gap: 4 }}>
                  <Text style={styles.actionLabel}>
                    Arrivée
                  </Text>

                  <Text style={styles.actionTitle}>
                    Non pointée
                  </Text>

                  <Text style={styles.actionDesc}>
                    Scannez le QR code du chantier
                    pour enregistrer votre arrivée.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.scanBtn,
                    {
                      backgroundColor:
                        Colors.navy,
                    },
                  ]}
                  onPress={goToScanner}
                  activeOpacity={0.8}
                >
                  <QrIcon />

                  <Text style={styles.scanBtnText}>
                    Pointer mon arrivée
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {homeState === 'arrived' && (
              <>
                <View style={{ gap: 8 }}>
                  <Text style={styles.actionLabel}>
                    Pointage du jour
                  </Text>

                  <View style={styles.successRow}>
                    <View style={styles.successCheck}>
                      <CheckIcon
                        size={10}
                        color="white"
                      />
                    </View>

                    <Text style={styles.successText}>
                      Arrivée enregistrée à{' '}
                      <Text
                        style={{
                          fontFamily:
                            'Inter_700Bold',
                        }}
                      >
                        {arriveeTime}
                      </Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.scanBtn,
                    {
                      backgroundColor:
                        Colors.orange,
                    },
                  ]}
                  onPress={goToScanner}
                  activeOpacity={0.8}
                >
                  <QrIcon />

                  <Text style={styles.scanBtnText}>
                    Pointer mon départ
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {homeState === 'done' && (
              <View style={{ gap: 12 }}>
                <View style={styles.doneHeader}>
                  <View style={styles.doneCheck}>
                    <CheckIcon size={16} />
                  </View>

                  <View>
                    <Text style={styles.doneTitle}>
                      Pointage terminé
                    </Text>

                    <Text style={styles.doneSub}>
                      Bonne journée !
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  {stats.map(
                    ({
                      label,
                      val,
                      dot,
                    }) => (
                      <View
                        key={label}
                        style={styles.statBox}
                      >
                        <View
                          style={
                            styles.statLabelRow
                          }
                        >
                          <View
                            style={[
                              styles.statDot,
                              {
                                backgroundColor:
                                  dot,
                              },
                            ]}
                          />

                          <Text
                            style={
                              styles.statLabel
                            }
                          >
                            {label}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.statVal
                          }
                        >
                          {val}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}
          </Card>

          {homeState !== 'done' && (
            <View style={styles.statsRow}>
              {stats.map(
                ({
                  label,
                  val,
                  dot,
                  dim,
                }) => (
                  <Card
                    key={label}
                    style={styles.statCard}
                  >
                    <View
                      style={
                        styles.statLabelRow
                      }
                    >
                      <View
                        style={[
                          styles.statDot,
                          {
                            backgroundColor:
                              dot,
                            opacity: dim
                              ? 0.4
                              : 1,
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.statLabel
                        }
                      >
                        {label}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.statVal,
                        dim && {
                          color:
                            Colors.textPlaceholder,
                        },
                      ]}
                    >
                      {val}
                    </Text>
                  </Card>
                )
              )}
            </View>
          )}

          {homeState === 'done' && (
            <Card style={styles.weekCard}>
              <Text style={styles.weekTitle}>
                Cette semaine
              </Text>

              <View style={{ gap: 12 }}>
                <ProgressBar
                  label="Heures travaillées"
                  value={weekHours}
                  max={40}
                  unit="h"
                />

                <ProgressBar
                  label="Ponctualité"
                  value={weekDays}
                  max={5}
                  unit="j"
                />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },

  greeting: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },

  subGreeting: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },

  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  section: {
    marginTop: 24,
    gap: 16,
  },

  actionCard: {
    padding: 20,
    gap: 16,
  },

  actionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },

  actionDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },

  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },

  scanBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },

  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },

  successCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successText: {
    fontSize: 14,
    color: '#16A34A',
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },

  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  doneCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },

  doneSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },

  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },

  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statVal: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },

  weekCard: {
    padding: 16,
    gap: 12,
  },

  weekTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});