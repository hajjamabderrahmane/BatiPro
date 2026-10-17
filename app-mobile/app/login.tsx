// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
// import { useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Svg, { Path, Circle, Line } from 'react-native-svg';
// import Card from '../components/Card';
// import PrimaryBtn from '../components/PrimaryBtn';
// import { useAuth } from '../src/context/AuthContext';
// import { Colors } from '../constants/colors';

// function AlertCircleIcon() {
//   return (
//     <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.red} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <Circle cx={12} cy={12} r={10} />
//       <Line x1={12} y1={8} x2={12} y2={12} />
//       <Line x1={12} y1={16} x2={12.01} y2={16} />
//     </Svg>
//   );
// }

// function EyeIcon({ show }: { show: boolean }) {
//   if (show) {
//     return (
//       <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//         <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//         <Circle cx={12} cy={12} r={3} />
//       </Svg>
//     );
//   }
//   return (
//     <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
//       <Line x1={1} y1={1} x2={23} y2={23} />
//     </Svg>
//   );
// }

// export default function LoginScreen() {
//   const router = useRouter();
//   const { login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPw, setShowPw] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   async function handleLogin() {
//     if (!email || !password) {
//       setError('Veuillez remplir tous les champs');
//       return;
//     }
//     setError('');
//     setLoading(true);
//     try {
//       await login(email, password);
//       router.replace('/(tabs)');
//     } catch (err: any) {
//       setError(err.message || 'Identifiants incorrects');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <SafeAreaView style={styles.safeArea} edges={['top']}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>BatiPro</Text>
//           <Text style={styles.headerSubtitle}>Gestion du pointage des chantiers</Text>
//         </View>
//         <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
//           <Card style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Connexion</Text>
//               <Text style={styles.cardSubtitle}>Connectez-vous à votre espace</Text>
//             </View>

//             {error ? (
//               <View style={styles.errorBox}>
//                 <AlertCircleIcon />
//                 <Text style={styles.errorText}>{error}</Text>
//               </View>
//             ) : null}

//             <View style={styles.fields}>
//               <View style={styles.fieldGroup}>
//                 <Text style={styles.fieldLabel}>Email</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={email}
//                   onChangeText={setEmail}
//                   placeholder="votre@email.com"
//                   placeholderTextColor={Colors.textPlaceholder}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                 />
//               </View>
//               <View style={styles.fieldGroup}>
//                 <Text style={styles.fieldLabel}>Mot de passe</Text>
//                 <View style={styles.pwWrap}>
//                   <TextInput
//                     style={[styles.input, { paddingRight: 44 }]}
//                     value={password}
//                     onChangeText={setPassword}
//                     placeholder="••••••••"
//                     placeholderTextColor={Colors.textPlaceholder}
//                     secureTextEntry={!showPw}
//                   />
//                   <TouchableOpacity
//                     style={styles.eyeBtn}
//                     onPress={() => setShowPw(v => !v)}
//                     activeOpacity={0.7}
//                   >
//                     <EyeIcon show={showPw} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>

//             <PrimaryBtn onPress={handleLogin} loading={loading}>
//               Se connecter
//             </PrimaryBtn>
//           </Card>
//         </ScrollView>
//       </SafeAreaView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: Colors.background },
//   header: {
//     backgroundColor: Colors.navy,
//     paddingTop: 16,
//     paddingBottom: 64,
//     paddingHorizontal: 24,
//     alignItems: 'center',
//     gap: 6,
//   },
//   headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
//   headerSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.6)' },
//   scroll: { flex: 1, marginTop: -32 },
//   content: { padding: 20, paddingBottom: 40 },
//   card: { padding: 24, gap: 20 },
//   cardHeader: { gap: 4 },
//   cardTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.text },
//   cardSubtitle: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
//   errorBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: '#FEF2F2',
//     borderWidth: 1,
//     borderColor: '#FECACA',
//   },
//   errorText: { fontSize: 14, color: Colors.red, fontFamily: 'Inter_400Regular', flex: 1 },
//   fields: { gap: 12 },
//   fieldGroup: { gap: 6 },
//   fieldLabel: {
//     fontSize: 11,
//     fontFamily: 'Inter_600SemiBold',
//     color: Colors.textSecondary,
//     textTransform: 'uppercase',
//     letterSpacing: 0.8,
//   },
//   input: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     fontSize: 14,
//     color: Colors.text,
//     backgroundColor: Colors.background,
//     fontFamily: 'Inter_400Regular',
//   },
//   pwWrap: { position: 'relative' },
//   eyeBtn: {
//     position: 'absolute',
//     right: 12,
//     top: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 36,
//   },
// });

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import Card from '../components/Card';
import PrimaryBtn from '../components/PrimaryBtn';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../constants/colors';
import { Button } from "react-native";


function AlertCircleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.red} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Line x1={12} y1={8} x2={12} y2={12} />
      <Line x1={12} y1={16} x2={12.01} y2={16} />
    </Svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  if (show) {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <Circle cx={12} cy={12} r={3} />
      </Svg>
    );
  }
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <Line x1={1} y1={1} x2={23} y2={23} />
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

// const testConnection = async () => {
//   alert("Le bouton fonctionne !");

//   try {
//     console.log("🔵 Test connexion...");

//     const response = await fetch(
//       "http://192.168.1.4:8000/api/login",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: "admin@test.com",
//           mot_de_passe: "Admin1234",
//         }),
//       }
//     );

//     console.log("🟢 Status :", response.status);

//     const text = await response.text();
//     console.log("🟢 Réponse :", text);

//   } catch (error) {
//     console.log("🔴 Erreur réseau :", error);
//     alert("Erreur réseau : " + String(error));
//   }
// };
  return (
    
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBlock}>
    <Image source={require('../assets/Log.png')} style={styles.logoImage} />
    <Text style={styles.appName}>BatiPro</Text>
    <Text style={styles.tagline}>Pointez maintenant</Text>
</View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Connexion</Text>

            {error ? (
              <View style={styles.errorBox}>
                <AlertCircleIcon />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.fields}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor={Colors.textPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mot de passe</Text>
                <View style={styles.pwWrap}>
                  <TextInput
                    style={[styles.input, { paddingRight: 44 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textPlaceholder}
                    secureTextEntry={!showPw}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)} activeOpacity={0.7}>
                    <EyeIcon show={showPw} />
                  </TouchableOpacity>
                  {/* <Button
  title="Tester connexion"
  onPress={testConnection}
/> */}
                </View>
              </View>
            </View>

            <PrimaryBtn onPress={handleLogin} loading={loading}>
              Se connecter
            </PrimaryBtn>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },

  logoBlock: { alignItems: 'center', gap: 6, marginBottom: 32 },
  logoImage: { width: 72, height: 72, borderRadius: 16, marginBottom: 8 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoBadgeText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  appName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.text },
  tagline: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 2 },

  card: { padding: 24, gap: 20 },
  cardTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.text },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontSize: 14, color: Colors.red, fontFamily: 'Inter_400Regular', flex: 1 },
  fields: { gap: 12 },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
    fontFamily: 'Inter_400Regular',
  },
  pwWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
  },
});
