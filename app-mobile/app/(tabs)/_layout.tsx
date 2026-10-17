import { Tabs } from 'expo-router';
import BottomTabBar from '../../components/BottomTabBar';
import { useRouter, useSegments } from 'expo-router';

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const activeTab = segments[segments.length - 1] || 'index';

  return (
    <Tabs
      tabBar={props => (
        <BottomTabBar
          activeTab={activeTab === '(tabs)' ? 'index' : activeTab}
          onNavigate={(route) => router.push(route as any)}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
