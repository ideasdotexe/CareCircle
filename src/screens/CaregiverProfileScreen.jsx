import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { IconShield, IconArrow } from '../components/Icons';
import CaregiverTabBar from '../components/CaregiverTabBar';
import { supabase } from '../lib/supabase';

export default function CaregiverProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [cgProfile, setCgProfile] = useState(null);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(p);
      try {
        const { data: cp } = await supabase.from('caregiver_profiles').select('*').eq('user_id', user.id).maybeSingle();
        setCgProfile(cp);
      } catch (_) {}
      try {
        const { data: rels } = await supabase
          .from('caregiver_relationships')
          .select('*, person:person_id(*)')
          .eq('caregiver_id', user.id)
          .neq('status', 'revoked');
        setPersons((rels || []).map(r => r.person).filter(Boolean));
      } catch (_) {}
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Caregiver';
  const initials = name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'C';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.modeStrip} />
      <View style={styles.topBar}>
        <View>
          <View style={styles.modeTag}>
            <IconShield color={colors.terracotta} />
            <Text style={styles.modeTagText}>CAREGIVER MODE</Text>
          </View>
          <Text style={styles.title}>My profile</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <View style={styles.hero}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>{cgProfile?.title || 'Caregiver'}</Text>
              <Text style={styles.loc}>{[cgProfile?.city, cgProfile?.province].filter(Boolean).join(', ')}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CaregiverEditProfile')}>
              <Text style={styles.editText}>Edit →</Text>
            </TouchableOpacity>
          </View>

          {Array.isArray(cgProfile?.specialties) && cgProfile.specialties.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specialties</Text>
              <View style={styles.chipsRow}>
                {cgProfile.specialties.map((s, i) => (
                  <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
                ))}
              </View>
            </View>
          )}

          {!!cgProfile?.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bodyText}>{cgProfile.bio}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned people</Text>
            {persons.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No people assigned yet.</Text>
              </View>
            ) : persons.map(p => (
              <View key={p.id} style={styles.personRow}>
                <View style={[styles.smallAvatar, { backgroundColor: '#3F5D54' }]}>
                  <Text style={styles.smallAvatarText}>{(p.first_name || '?')[0]}</Text>
                </View>
                <Text style={styles.personName}>{p.first_name} {p.last_name || ''}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <CaregiverTabBar active={2} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  modeStrip: { height: 4, backgroundColor: colors.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14 },
  modeTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTagText: { fontSize: 10, color: colors.terracotta, letterSpacing: 0.6, fontWeight: '700' },
  title: { fontFamily: 'Georgia', fontSize: 26, color: colors.forestDeep, fontWeight: '400', marginTop: 4 },
  hero: { backgroundColor: colors.forestDeep, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Georgia', color: '#fff', fontSize: 22, fontWeight: '500' },
  name: { fontFamily: 'Georgia', fontSize: 19, color: '#fff', fontWeight: '500' },
  role: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  loc: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  editText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { marginTop: 22 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500', marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  chipText: { fontSize: 12, color: colors.ink, fontWeight: '500' },
  bodyText: { fontSize: 13, color: colors.ink, lineHeight: 19 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18 },
  emptyText: { fontSize: 12.5, color: colors.muted, textAlign: 'center' },
  personRow: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallAvatar: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  personName: { fontSize: 14, color: colors.ink, fontWeight: '500' },
});
