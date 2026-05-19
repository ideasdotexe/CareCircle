import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { IconBell, IconShield, IconArrow } from '../components/Icons';
import CaregiverTabBar from '../components/CaregiverTabBar';
import { supabase } from '../lib/supabase';

export default function CaregiverTodayScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(p);
      try {
        const { data } = await supabase
          .from('caregiver_relationships')
          .select('*, person:person_id(*), owner:owner_id(*)')
          .eq('caregiver_id', user.id)
          .neq('status', 'revoked');
        setAssigned(data || []);
      } catch (_) { setAssigned([]); }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const name = profile?.first_name || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.modeStrip} />
      <View style={styles.topBar}>
        <View>
          <View style={styles.modeTag}>
            <IconShield color={colors.terracotta} />
            <Text style={styles.modeTagText}>CAREGIVER MODE</Text>
          </View>
          <Text style={styles.greeting}>Today, {name}</Text>
          <Text style={styles.dateStr}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.bellPill}>
          <IconBell />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 120 }}>
          {assigned.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No people shared with you yet</Text>
              <Text style={styles.emptyText}>When a family invites you to help, they'll appear here.</Text>
            </View>
          ) : assigned.map(rel => (
            <View key={rel.id} style={styles.personCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.avatar, { backgroundColor: '#3F5D54' }]}>
                  <Text style={styles.avatarText}>{(rel.person?.first_name || '?')[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personEyebrow}>{rel.person?.relationship || 'Person'} · shared by {rel.owner?.first_name || 'family'}</Text>
                  <Text style={styles.personName}>{rel.person?.first_name} {rel.person?.last_name || ''}</Text>
                </View>
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{(rel.role || 'family').toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('CaregiverVisit', { personId: rel.person?.id, personName: rel.person?.first_name })}>
                <Text style={styles.startBtnText}>Start visit</Text>
                <IconArrow color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <CaregiverTabBar active={0} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  modeStrip: { height: 4, backgroundColor: colors.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
  modeTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTagText: { fontSize: 10, color: colors.terracotta, letterSpacing: 0.6, fontWeight: '700' },
  greeting: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 32, color: colors.forestDeep, fontWeight: '400', marginTop: 4 },
  dateStr: { marginTop: 2, fontSize: 12.5, color: colors.muted },
  bellPill: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  emptyText: { marginTop: 8, fontSize: 12.5, color: colors.muted, textAlign: 'center' },
  personCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 18, fontWeight: '500' },
  personEyebrow: { fontSize: 10.5, color: colors.muted, letterSpacing: 0.4 },
  personName: { fontFamily: 'Georgia', fontSize: 19, color: colors.forestDeep, fontWeight: '500', marginTop: 1 },
  roleChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99, backgroundColor: colors.terracottaSoft },
  roleChipText: { fontSize: 9.5, color: '#7A3F2A', fontWeight: '700', letterSpacing: 0.4 },
  startBtn: { marginTop: 14, height: 44, borderRadius: 12, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  startBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
