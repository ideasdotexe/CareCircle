import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CaregiverTabBar from '../components/CaregiverTabBar';
import { fetchDisplayName } from '../lib/userProfile';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

function IChevRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke={C.mutedSoft} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function MenuRow({ label, sub, onPress, last, danger }) {
  return (
    <TouchableOpacity
      style={[s.menuRow, !last && s.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.menuLabel, danger && { color: C.terracotta }]}>{label}</Text>
        {!!sub && <Text style={s.menuSub}>{sub}</Text>}
      </View>
      {!danger && <IChevRight />}
    </TouchableOpacity>
  );
}

function ToggleRow({ label, sub, value, onChange, border }) {
  return (
    <View style={[s.toggleRow, border && s.toggleBorder]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        {!!sub && <Text style={s.toggleSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5DDD0', true: C.forestDeep }}
        thumbColor="#fff"
        ios_backgroundColor="#E5DDD0"
        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
      />
    </View>
  );
}

export default function CaregiverProfileScreen({ navigation }) {
  const { signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [initials, setInitials] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [visibleInSearch, setVisibleInSearch] = useState(true);
  const [acceptingClients, setAcceptingClients] = useState(true);

  const load = useCallback(async () => {
    try {
      const { name, initials: ini, email: em } = await fetchDisplayName('Welcome');
      setDisplayName(name);
      setInitials(ini || (name === 'Welcome' ? 'CG' : ini));
      setEmail(em);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSignOut = () => signOut();

  const handlePasswordReset = () => {
    Alert.alert(
      'Change password',
      `A reset link will be sent to ${email}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send link',
          onPress: async () => {
            try {
              await supabase.auth.resetPasswordForEmail(email);
              Alert.alert('Email sent', 'Check your inbox for the reset link.');
            } catch (e) { Alert.alert('Error', e.message || String(e)); }
          },
        },
      ]
    );
  };

  const name = displayName || 'Welcome';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.modeStrip} />

      <View style={s.topBar}>
        <Text style={s.modeLabel}>Caregiver portal</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.forest} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

          {/* ── Hero ── */}
          <View style={s.heroWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroEmail}>{email}</Text>
          </View>

          {/* ── Account ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text style={s.groupLabel}>Account</Text>
            <View style={s.card}>
              <MenuRow
                label="My profile"
                sub="Specialties, bio, rates, availability"
                onPress={() => navigation.navigate('CaregiverEditProfile')}
                border
              />
              <MenuRow
                label="Change password"
                sub="Send a reset link to your email"
                onPress={handlePasswordReset}
                last
              />
            </View>
          </View>

          {/* ── Availability ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={s.groupLabel}>Availability</Text>
            <View style={s.card}>
              <ToggleRow
                label="Visible in search"
                sub="Families can find your profile."
                value={visibleInSearch}
                onChange={setVisibleInSearch}
                border
              />
              <ToggleRow
                label="Accepting new clients"
                sub="Shows 'available' tag on your profile."
                value={acceptingClients}
                onChange={setAcceptingClients}
              />
            </View>
          </View>

          {/* ── Notifications ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={s.groupLabel}>Notifications</Text>
            <View style={s.card}>
              <ToggleRow
                label="Push notifications"
                sub="Alerts for new assignments and messages."
                value={pushNotifs}
                onChange={setPushNotifs}
              />
            </View>
          </View>

          {/* ── Settings ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={s.groupLabel}>Settings</Text>
            <View style={s.card}>
              <MenuRow
                label="Terms & Conditions"
                onPress={() => Linking.openURL('https://carecircle.app/terms')}
                border
              />
              <MenuRow
                label="Privacy Policy"
                onPress={() => Linking.openURL('https://carecircle.app/privacy')}
                border
              />
              <MenuRow
                label="Help & Support"
                onPress={() => Linking.openURL('https://carecircle.app/support')}
                last
              />
            </View>
          </View>

          {/* ── Sign out ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <View style={s.card}>
              <MenuRow label="Sign out" onPress={handleSignOut} last danger />
            </View>
          </View>

          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: 11, color: C.mutedSoft }}>CareCircle · Caregiver Portal · v1.0</Text>
          </View>
        </ScrollView>
      )}

      <CaregiverTabBar active={2} navigation={navigation} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  modeStrip: { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modeLabel: { fontSize: 10, color: C.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: '700' },
  // Hero
  heroWrap: { paddingTop: 28, alignItems: 'center', paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 28, fontWeight: '500' },
  heroName: { marginTop: 14, fontFamily: 'Georgia', fontSize: 24, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.4 },
  heroEmail: { marginTop: 4, fontSize: 13, color: C.muted },
  // Cards & rows
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  groupLabel: { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  menuLabel: { fontSize: 14, fontWeight: '500', color: C.ink },
  menuSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingHorizontal: 16 },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: C.ink, letterSpacing: -0.1 },
  toggleSub: { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 15 },
});
