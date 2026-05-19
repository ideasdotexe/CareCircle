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
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      // Also try full_name from profiles
      const displayName = p?.full_name || p?.first_name || 'there';
      setProfile({ ...p, _displayName: displayName });
      try {
        const { data: rels } = await supabase
          .from('caregiver_relationships')
          .select('id, caregiver_id, owner_id, person_id, status, role')
          .eq('caregiver_id', user.id)
          .neq('status', 'revoked');

        if (rels?.length) {
          const personIds = [...new Set(rels.map(r => r.person_id).filter(Boolean))];
          const ownerIds  = [...new Set(rels.map(r => r.owner_id).filter(Boolean))];
          const [{ data: personsData }, { data: ownersData }] = await Promise.all([
            personIds.length ? supabase.from('persons').select('*').in('id', personIds) : { data: [] },
            ownerIds.length  ? supabase.from('profiles').select('id, full_name, first_name, last_name').in('id', ownerIds) : { data: [] },
          ]);
          const personMap = Object.fromEntries((personsData || []).map(p => [p.id, p]));
          const ownerMap  = Object.fromEntries((ownersData  || []).map(o => [o.id, o]));
          setAssigned(rels.map(r => ({
            ...r,
            person: personMap[r.person_id] || null,
            owner:  ownerMap[r.owner_id]   || null,
          })));
        } else {
          setAssigned([]);
        }
      } catch (_) { setAssigned([]); }
      // Pending requests badge
      try {
        const { count } = await supabase
          .from('caregiver_requests')
          .select('id', { count: 'exact', head: true })
          .eq('caregiver_id', user.id)
          .eq('status', 'pending');
        setPendingCount(count || 0);
      } catch (_) {}
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const name = profile?._displayName || 'there';

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
        <TouchableOpacity style={styles.bellPill} onPress={() => navigation.navigate('CaregiverNotifications')}>
          <IconBell />
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
            </View>
          )}
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
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.terracotta, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
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
