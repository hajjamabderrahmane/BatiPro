// import React, { useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { useRouter } from 'expo-router';
// import PrimaryBtn from '../components/PrimaryBtn';
// import { Colors } from '../constants/colors';

// export default function ScanScreen() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const router = useRouter();

//   if (!permission) {
//     return <View style={styles.container}><Text style={styles.text}>Chargement...</Text></View>;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.text}>BatiPro a besoin d'accéder à la caméra</Text>
//         <PrimaryBtn onPress={requestPermission}>Autoriser la caméra</PrimaryBtn>
//       </View>
//     );
//   }

//   const handleBarcodeScanned = ({ data }: { data: string }) => {
//     if (scanned) return;
//     setScanned(true);
//     router.replace({ pathname: '/confirm', params: { codeQr: data } });
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={styles.camera}
//         facing="back"
//         barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
//         onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
//       />
//       <View style={styles.frame} />
//       <Text style={styles.hint}>Placez le QR Code du chantier dans le cadre</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
//   camera: { ...StyleSheet.absoluteFillObject },
//   frame: { width: 240, height: 240, borderWidth: 3, borderColor: '#fff', borderRadius: 16 },
//   hint: { color: '#fff', fontSize: 14, marginTop: 24, position: 'absolute', bottom: 80 },
//   text: { color: '#fff', fontSize: 16, marginBottom: 16, textAlign: 'center', paddingHorizontal: 24 },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import PrimaryBtn from '../components/PrimaryBtn';
import { Colors } from '../constants/colors';

export default function ScanScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] =
    useState(false);

  const router = useRouter();

  const {
    codeQrAffecte,
    chantierId,
  } = useLocalSearchParams<{
    codeQrAffecte: string;
    chantierId: string;
  }>();

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Chargement...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          BatiPro a besoin d'accéder à la caméra
        </Text>

        <PrimaryBtn
          onPress={requestPermission}
        >
          Autoriser la caméra
        </PrimaryBtn>
      </View>
    );
  }

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned) {
      return;
    }

    setScanned(true);

    // QR attendu du chantier affecté
    const qrAffecte =
      Array.isArray(codeQrAffecte)
        ? codeQrAffecte[0]
        : codeQrAffecte;

    // QR réellement scanné
    const qrScanne = data.trim();

    // ❌ Mauvais chantier
    if (!qrAffecte || qrScanne !== qrAffecte) {
      Alert.alert(
        'Chantier incorrect',
        "Vous n'êtes pas affecté à ce chantier.",
        [
          {
            text: 'Réessayer',
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );

      return;
    }

    // ✅ Bon chantier
    router.replace({
      pathname: '/confirm',
      params: {
        codeQr: qrScanne,
        chantierId: chantierId?.toString() ?? '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarcodeScanned
        }
      />

      <View style={styles.overlay}>
        <View style={styles.frame} />

        <Text style={styles.hint}>
          Scannez le QR Code de votre chantier
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  camera: {
    flex: 1,
    width: '100%',
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  frame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },

  hint: {
    marginTop: 24,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },

  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});