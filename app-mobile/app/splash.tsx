
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const { token, isLoading } = useAuth();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  function goNext() {
    if (transitioning) return;
    setTransitioning(true);

    Animated.parallel([
      Animated.timing(slideX, {
        toValue: -width * 0.4,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isLoading && token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    });
  }

  return (
    <TouchableOpacity activeOpacity={1} onPress={goNext} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top} />
        <Animated.View
          style={[
            styles.center,
            {
              transform: [{ translateX: slideX }],
              opacity: fadeOut,
            },
          ]}
        >
          <View style={styles.logoBox}>
            <Image source={require('../assets/Log.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>BatiPro</Text>
          </View>
        </Animated.View>
        <View style={styles.bottom}>
          <Animated.Text style={[styles.hint, { opacity: pulse }]}>
            Appuyez pour continuer
          </Animated.Text>
        </View>
      </SafeAreaView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A5F' },
  safe: { flex: 1, paddingHorizontal: 32, paddingVertical: 48 },
  top: { flex: 1 },
  center: { flex: 2, alignItems: 'center', justifyContent: 'center', gap: 20 },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 64, height: 64 },
  textBlock: { alignItems: 'center', gap: 8 },
  title: { fontSize: 36, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 },
  bottom: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  hint: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_400Regular' },
});