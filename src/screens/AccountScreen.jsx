import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { IconChevronRight } from '../components/Icons';
import TabBar from '../components/TabBar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AccountScreen({ navigation }) {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(p);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Welcome';
  const initials = name === 'Welcome' ? 'CC' : name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.heroWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.menuCard}>
            <MenuRow label="My profile" onPress={() => navigation.navigate('Profile')} />
            <MenuRow label="Notifications" />
            <MenuRow label="Privacy" />
            <MenuRow label="Help" />
            <MenuRow label="About" last />
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <TabBar active={3} navigation={navigation} />
    </SafeAreaView>
  );
}

function MenuRow({ label, onPress, last }) {
  return (
    <TouchableOpacity style={[styles.row, !last && styles.rowBorder]} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <IconChevronRight />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  heroWrap: { paddingTop: 32, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 28, fontWeight: '500' },
  name: { marginTop: 16, fontFamily: 'Georgia', fontSize: 24, color: colors.forestDeep, fontWeight: '400' },
  email: { marginTop: 4, fontSize: 13, color: colors.muted },
  menuCard: { marginTop: 28, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  rowLabel: { fontSize: 14, color: colors.ink, fontWeight: '500' },
  signOutBtn: { marginTop: 22, marginHorizontal: 20, height: 52, borderRadius: 14, backgroundColor: colors.terracotta, alignItems: 'center', justifyContent: 'center' },
  signOutText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
