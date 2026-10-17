import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface TabItem {
  key: string;
  label: string;
  route: string;
}

const TABS: TabItem[] = [
  { key: 'index', label: 'Accueil', route: '/' },
  { key: 'history', label: 'Historique', route: '/history' },
  { key: 'profile', label: 'Profil', route: '/profile' },
];

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? Colors.navy : Colors.textMuted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? Colors.navy : 'none'} stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  const c = active ? Colors.navy : Colors.textMuted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={3} y1={10} x2={21} y2={10} />
    </Svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? Colors.navy : Colors.textMuted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}

const ICONS = [HomeIcon, HistoryIcon, ProfileIcon];

interface BottomTabBarProps {
  activeTab: string;
  onNavigate: (route: string) => void;
}

export default function BottomTabBar({ activeTab, onNavigate }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {TABS.map((tab, i) => {
        const Icon = ICONS[i];
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onNavigate(tab.route)}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Icon active={active} />
            </View>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    minWidth: 64,
  },
  iconWrap: {
    width: 48,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.navyLight,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.navy,
  },
});
