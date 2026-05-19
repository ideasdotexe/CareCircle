import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { IconChevronLeft, IconPlus } from '../components/Icons';
import { supabase } from '../lib/supabase';

export default function ManageCaregiversScreen({ navigation, route }) {
  const [persons, setPersons] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: pp } = await supabase.from('persons').select('*').eq('user_id', user.id);
      setPersons(pp || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const active = persons[activeIdx];
    if (!active) return;
    (async () => {
      try {
        const { data } = await supabase.from('caregiver_relationships').select('*').eq('person_id', active.id);
        setCaregivers(data || []);
      } catch (_) { setCaregivers([]); }
    })();
  }, [persons, activeIdx]);

  const active = persons[activeIdx];
  const activeCgs = caregivers.filter(c => c.status !== 'pending');
  const pendingCgs = caregivers.filter(c => c.status === 'pending');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Share & Caregivers</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
            {active && <Text style={styles.eyebrow}>{active.first_name} · {active.relationship || ''}</Text>}
            <Text style={styles.hero}>The people who help</Text>
            <Text style={styles.heroSub}>You decide what each person sees and what they can add. Change or revoke anytime.</Text>
          </View>

          {persons.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personRow}>
              {persons.map((p, i) => {
                const isActive = i === activeIdx;
                return (
                  <TouchableOpacity key={p.id} onPress={() => setActiveIdx(i)} style={[styles.personChip, isActive && styles.personChipActive]}>
                    <Text style={[styles.personChipText, isActive && { color: '#fff' }]}>{p.first_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('FindCaregiver')}>
              <Text style={styles.primaryBtnText}>Find caregiver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('InviteCaregiver', { personId: active?.id })}>
              <IconPlus color={colors.forestDeep} />
              <Text style={styles.outlineBtnText}>Invite</Text>
            </TouchableOpacity>
          </View>

          {activeCgs.length > 0 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
              <Text style={styles.sectionTitle}>Active</Text>
              {activeCgs.map(c => <CaregiverCard key={c.id} c={c} />)}
            </View>
          )}

          {pendingCgs.length > 0 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <Text style={styles.sectionTitle}>Pending</Text>
              {pendingCgs.map(c => <CaregiverCard key={c.id} c={c} pending />)}
            </View>
          )}

          {activeCgs.length === 0 && pendingCgs.length === 0 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No caregivers yet. Invite family or hire a professional.</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function CaregiverCard({ c, pending }) {
  const sections = Array.isArray(c.permissions) ? c.permissions : (c.sections ? Object.keys(c.sections).filter(k => c.sections[k]?.v) : []);
  return (
    <View style={[styles.card, pending && { borderStyle: 'dashed' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.avatar, { backgroundColor: pending ? '#A8B5A0' : '#C66E4E' }]}>
          <Text style={styles.avatarText}>{(c.caregiver_name || c.caregiver_email || '?').slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{c.caregiver_name || c.caregiver_email || 'Caregiver'}</Text>
          <Text style={styles.cardMeta}>{c.role || 'Family'}{c.relationship ? ` · ${c.relationship}` : ''}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: pending ? colors.terracottaSoft : colors.sageSoft }]}>
          <Text style={[styles.statusChipText, { color: pending ? colors.terracotta : colors.forest }]}>{(c.status || 'active').toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.permBar}>
        <Text style={styles.permText}>{sections.length} sections</Text>
        <TouchableOpacity>
          <Text style={styles.editText}>Edit access →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  eyebrow: { fontSize: 10.5, color: colors.muted, letterSpacing: 0.5, fontWeight: '600' },
  hero: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 30, color: colors.forestDeep, fontWeight: '400', marginTop: 4 },
  heroSub: { marginTop: 6, fontSize: 13, color: colors.muted, lineHeight: 18 },
  personRow: { padding: 20, paddingTop: 14, gap: 8, flexDirection: 'row' },
  personChip: { paddingHorizontal: 14, height: 36, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', justifyContent: 'center', marginRight: 8 },
  personChipActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  personChipText: { fontSize: 13, fontWeight: '500', color: colors.ink },
  btnRow: { paddingHorizontal: 20, paddingTop: 18, flexDirection: 'row', gap: 8 },
  primaryBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '500' },
  outlineBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  outlineBtnText: { color: colors.forestDeep, fontSize: 14.5, fontWeight: '500' },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 17, color: colors.forestDeep, fontWeight: '500', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  cardName: { fontSize: 14.5, fontWeight: '600', color: colors.ink },
  cardMeta: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusChipText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 },
  permBar: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.lineSoft, flexDirection: 'row', justifyContent: 'space-between' },
  permText: { fontSize: 11, color: colors.muted },
  editText: { fontSize: 11, color: colors.forest, fontWeight: '600' },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center' },
});
