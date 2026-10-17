

import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import * as Location from 'expo-location';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Svg, {
  Polyline,
} from 'react-native-svg';

import Card from '../components/Card';
import PrimaryBtn from '../components/PrimaryBtn';
import OutlineBtn from '../components/OutlineBtn';

import {
  validerPointage,
} from '../src/services/api';

import type {
  PointageResponse,
} from '../src/services/api';

import { Colors } from '../constants/colors';

function CheckIcon() {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#16A34A"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

type Status =
  | 'checking'
  | 'locating'
  | 'sending'
  | 'success'
  | 'error';

export default function ConfirmScreen() {
  const router = useRouter();

  const {
    codeQr,
  } = useLocalSearchParams<{
    codeQr: string;
  }>();

  const [
    status,
    setStatus,
  ] = useState<Status>('checking');

  const [
    errorMsg,
    setErrorMsg,
  ] = useState('');

  const [
    result,
    setResult,
  ] = useState<PointageResponse | null>(
    null
  );

  useEffect(() => {
    processPointage();
  }, []);

  async function processPointage() {
    setErrorMsg('');

    /*
     * Le QR a déjà été vérifié dans ScanScreen.
     *
     * On arrive ici uniquement si le QR correspond
     * au chantier affecté.
     */

    if (!codeQr) {
      setStatus('error');
      setErrorMsg(
        'QR Code invalide.'
      );
      return;
    }

    /*
     * Maintenant seulement on demande
     * l'autorisation GPS.
     */

    setStatus('locating');

    const {
      status: permStatus,
    } =
      await Location.requestForegroundPermissionsAsync();

    if (permStatus !== 'granted') {
      setStatus('error');

      setErrorMsg(
        "L'autorisation de localisation est nécessaire pour pointer."
      );

      return;
    }

    let position;

    try {
      position =
        await Location.getCurrentPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,
          }
        );
    } catch {
      setStatus('error');

      setErrorMsg(
        'Position GPS indisponible. Vérifiez que le GPS est activé.'
      );

      return;
    }

    setStatus('sending');

    try {
      const data =
        await validerPointage({
          code_qr: codeQr as string,

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        });

      setResult(data);

      setStatus('success');
    } catch (err: any) {
      setStatus('error');

      const backendMessage =
        err?.response?.data?.message;

      setErrorMsg(
        backendMessage ||
          "Impossible d'enregistrer le pointage."
      );
    }
  }

  function retourAccueil() {
    router.replace('/(tabs)');
  }

  /*
   * Vérification en cours
   */
  if (status === 'checking') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={Colors.navy}
          />

          <Text style={styles.loadingText}>
            Vérification du chantier...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * GPS en cours
   */
  if (status === 'locating') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={Colors.navy}
          />

          <Text style={styles.loadingText}>
            Vérification de votre position...
          </Text>

          <Text style={styles.loadingDescription}>
            Votre position GPS est utilisée pour
            vérifier que vous êtes sur le chantier.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Envoi vers le backend
   */
  if (status === 'sending') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={Colors.navy}
          />

          <Text style={styles.loadingText}>
            Enregistrement du pointage...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Succès
   */
  if (status === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Card style={styles.resultCard}>
            <View style={styles.successIcon}>
              <CheckIcon />
            </View>

            <Text style={styles.successTitle}>
              Pointage enregistré
            </Text>

            <Text style={styles.successMessage}>
              {result?.message ??
                'Votre pointage a été enregistré avec succès.'}
            </Text>

            <PrimaryBtn
              onPress={retourAccueil}
            >
              Retour à l'accueil
            </PrimaryBtn>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Erreur
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Card style={styles.resultCard}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>
              !
            </Text>
          </View>

          <Text style={styles.errorTitle}>
            Pointage impossible
          </Text>

          <Text style={styles.errorMessage}>
            {errorMsg}
          </Text>

          <OutlineBtn
            onPress={retourAccueil}
          >
            Retour à l'accueil
          </OutlineBtn>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 18,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },

  loadingDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },

  resultCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },

  successMessage: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorIconText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#DC2626',
  },

  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});