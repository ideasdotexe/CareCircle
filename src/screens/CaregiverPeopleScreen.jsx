import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { IconShield, IconPill, IconPulse, IconDoc, IconPeople } from '../components/Icons';
import CaregiverTabBar from '../components/CaregiverTabBar';
import { supabase } from '../lib/supabase';

const PERM_KEYS = ['vitals', 'medications', 'reports', 'profile', 'appointments', 'activity'];
function parsePerms(raw) {
  const full = {};
  PERM_KEYS.forEach(k => { full[k] = { view: true, contribute: true }; });
  if (!raw) return full;
  if (Array.isArray(raw)) {
    const p = {};
    PERM_KEYS.forEach(k => { p[k] = { view: raw.includes(k), contribute: raw.includes(k) }; });
    return p;
  }
  if (typeof raw === 'object') {
    const p = {};
    PERM_KEYS.forEach(k => {
      const v = raw[k];
      if (v && typeof v === 'object') p[k] = { view: v.view !== false, contribute: !!v.contribute };
      else p[k] = { view: v !== false, contribute: v !== false };
    });
    return p;
  }
  return full;
}

export default function CaregiverPeopleScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [persons, setPersons] = useState([]);
  const [permMap, setPermMap] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(p);
      const userEmail = (user.email || '').toLowerCase();
      let personIds = [];
      const pm = {};

      const { data: rels } = await supabase
        .from('caregiver_relationships')
        .select('person_id, permissions')
        .eq('caregiver_id', user.id)
        .neq('access_revoked', true);
      (rels || []).forEach(r => {
        if (r.person_id) { personIds.push(r.person_id); pm[r.person_id] = parsePerms(r.permissions); }
      });
      personIds = [...new Set(personIds)];

      if (!personIds.length) {
        const [{ data: byId }, { data: byEmail }] = await Promise.all([
          supabase.from('caregiver_requests').select('person_id, permissions').eq('caregiver_id', user.id).eq('status', 'accepted'),
          supabase.from('caregiver_requests').select('person_id, permissions').eq('caregiver_email', userEmail).eq('status', 'accepted'),
        ]);
        [...(byId || []), ...(byEmail || [])].forEach(r => {
          if (r.person_id && !pm[r.person_id]) { personIds.push(r.person_id); pm[r.person_id] = parsePerms(r.permissions); }
        });
        personIds = [...new Set(personIds)];
      }

      setPermMap(pm);
      if (personIds.length) {
        const { data: ps } = await supabase.from('persons').select('*').in('id', personIds);
        setPersons(ps || []);
      } else {
        setPersons([]);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const active = persons[activeIdx];
  const perms  = active ? (permMap[active.id] || parsePerms(null)) : parsePerms(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.modeStrip} />
      <View style={styles.topBar}>
        <View>
          <View style={styles.modeTag}>
            <IconShield color={colors.terracotta} />
            <Text style={styles.modeTagText}>CAREGIVER MODE</Text>
          </View>
          <Text style={styles.title}>My people</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personRow}>
            {persons.map((p, i) => {
              const isActive = i === activeIdx;
              const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
              return (
                <TouchableOpacity key={p.id} onPress={() => setActiveIdx(i)} style={[styles.personChip, isActive && styles.personChipActive]}>
                  <View style={[styles.personInit, { backgroundColor: tint }]}>
                    <Text style={styles.personInitText}>{(p.name || '?')[0]}</Text>
                  </View>
                  <Text style={[styles.personChipName, isActive && { color: '#fff' }]}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {active ? (
            <>
              <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
                <View style={styles.recipientCard}>
                  <Text style={styles.recipientEyebrow}>{(active.relationship || '').toUpperCase()}</Text>
                  <Text style={styles.recipientName}>{active.name}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
                <Text style={styles.sectionTitle}>Quick access</Text>
                <View style={styles.grid}>
                  <Tile label="Visit" sub="Start" onPress={() => navigation.navigate('CaregiverVisit', { personId: active.id })} icon={IconPill} />
                  {perms.vitals?.view && (
                    <Tile label="Vitals" sub={perms.vitals.contribute ? 'Log' : 'View'}
                      onPress={() => perms.vitals.contribute
                        ? navigation.navigate('CaregiverVitalsLog', { personId: active.id })
                        : navigation.navigate('VitalsHistory', { personId: active.id, personName: active.name })}
                      icon={IconPulse} />
                  )}
                  {perms.medications?.view && (
                    <Tile label="Meds" sub="Today" onPress={() => navigation.navigate('Medications', { personId: active.id })} icon={IconPill} />
                  )}
                  {perms.activity?.contribute && (
                    <Tile label="Notes" sub="Add" onPress={() => navigation.navigate('CaregiverVisitNote', { personId: active.id })} icon={IconDoc} />
                  )}
                  {perms.reports?.view && (
                    <Tile label="Documents" sub={perms.reports.contribute ? 'View & upload' : 'View'}
                      onPress={() => navigation.navigate('DocsHome', { personId: active.id })} icon={IconDoc} />
                  )}
                  {perms.appointments?.view && (
                    <Tile label="Appts" sub="Calendar"
                      onPress={() => navigation.navigate('AppointmentsScreen', { personId: active.id, personName: active.name })} icon={IconPeople} />
                  )}
                </View>
              </View>
            </>
          ) : (
            <View style={{ padding: 40 }}>
              <Text style={styles.emptyText}>No people assigned yet.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <CaregiverTabBar active={1} navigation={navigation} />
    </SafeAreaView>
  );
}

function Tile({ label, sub, onPress, icon: Icon }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <View style={styles.tileIcon}>{Icon ? <Icon color={colors.forest} /> : null}</View>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  modeStrip: { height: 4, backgroundColor: colors.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14 },
  modeTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTagText: { fontSize: 10, color: colors.terracotta, letterSpacing: 0.6, fontWeight: '700' },
  title: { fontFamily: 'Georgia', fontSize: 26, color: colors.forestDeep, fontWeight: '400', marginTop: 4 },
  personRow: { paddingHorizontal: 20, paddingTop: 18, gap: 8, flexDirection: 'row' },
  personChip: { height: 36, paddingHorizontal: 12, paddingLeft: 4, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6 },
  personChipActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  personInit: { width: 28, height: 28, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  personInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 12, fontWeight: '500' },
  personChipName: { fontSize: 13, fontWeight: '500', color: colors.ink },
  recipientCard: { backgroundColor: colors.forestDeep, borderRadius: 20, padding: 20 },
  recipientEyebrow: { fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  recipientName: { fontFamily: 'Georgia', fontSize: 22, color: '#fff', fontWeight: '400', marginTop: 4 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: colors.forestDeep, fontWeight: '500', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14, minHeight: 92 },
  tileIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  tileSub: { fontSize: 10.5, color: colors.muted, marginTop: 2 },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 13 },
});
