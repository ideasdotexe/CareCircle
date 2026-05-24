import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Polygon, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1',
  sageSoft: '#DDE4D6', sage: '#A8B5A0',
  muted: '#6B6862', mutedSoft: '#9A968F',
  line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ── Icons ──────────────────────────────────────────────────
const IC = C.forest;
function IBack()  { return <Svg width={9} height={16} viewBox="0 0 9 16" fill="none"><Path d="M8 1L1 8l7 7" stroke={C.forestDeep} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IUser()  { return <Svg width={17} height={17} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="4" stroke={IC} strokeWidth="1.8"/><Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={IC} strokeWidth="1.8" strokeLinecap="round"/></Svg>; }
function IHeart() { return <Svg width={17} height={17} viewBox="0 0 24 24" fill="none"><Path d="M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z" stroke={IC} strokeWidth="1.8" strokeLinejoin="round"/></Svg>; }
function IWarn()  { return <Svg width={17} height={17} viewBox="0 0 24 24" fill="none"><Polygon points="12,3 22,21 2,21" stroke={IC} strokeWidth="1.8" strokeLinejoin="round"/><Path d="M12 10v4" stroke={IC} strokeWidth="1.8" strokeLinecap="round"/><Path d="M12 17.5v.5" stroke={IC} strokeWidth="2" strokeLinecap="round"/></Svg>; }
function IPill()  { return <Svg width={17} height={17} viewBox="0 0 24 24" fill="none"><Path d="M4.5 12.5L12 5a5 5 0 017 7l-7.5 7.5a5 5 0 01-7-7z" stroke={IC} strokeWidth="1.8" strokeLinejoin="round"/><Path d="M9 9l6 6" stroke={IC} strokeWidth="1.8" strokeLinecap="round"/></Svg>; }
function IFlask() { return <Svg width={17} height={17} viewBox="0 0 24 24" fill="none"><Path d="M9 3v8L4 19a2 2 0 001.8 2.9h12.4A2 2 0 0020 19l-5-8V3" stroke={IC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><Path d="M7 3h10" stroke={IC} strokeWidth="1.8" strokeLinecap="round"/></Svg>; }
function IChev()  { return <Svg width={7} height={12} viewBox="0 0 7 12" fill="none"><Path d="M1 1l5 5-5 5" stroke={C.mutedSoft} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function ICheck() { return <Svg width={11} height={9} viewBox="0 0 11 9" fill="none"><Path d="M1 4.5l3 3 6-7" stroke={C.forest} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }

const SECTIONS = [
  { key: 'basicInfo',   icon: IUser,  title: 'Basic Info',   screen: 'BasicInfo',   desc: 'DOB, sex, weight, height' },
  { key: 'conditions',  icon: IHeart, title: 'Conditions',   screen: 'Conditions',  desc: 'Ongoing health conditions' },
  { key: 'allergies',   icon: IWarn,  title: 'Allergies',    screen: 'Allergies',   desc: 'Food, drug, environmental' },
  { key: 'medications', icon: IPill,  title: 'Medications',  screen: 'Medications', desc: 'Current & past medications' },
  { key: 'labResults',  icon: IFlask, title: 'Lab Results',  screen: 'LabResults',  desc: 'Upload lab PDFs or photos' },
];

async function loadCounts(personId) {
  const [basic, conds, allergies, meds, labs] = await Promise.all([
    supabase.from('persons').select('sex,weight_kg,height_cm,date_of_birth').eq('id', personId).maybeSingle(),
    supabase.from('conditions').select('id', { count: 'exact', head: true }).eq('person_id', personId),
    supabase.from('allergies').select('id', { count: 'exact', head: true }).eq('person_id', personId),
    supabase.from('medications').select('id', { count: 'exact', head: true }).eq('person_id', personId),
    supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('person_id', personId),
  ]);
  const p = basic.data;
  return {
    basicInfo:   !!(p?.sex || p?.weight_kg || p?.height_cm || p?.date_of_birth),
    conditions:  conds.count   ?? 0,
    allergies:   allergies.count ?? 0,
    medications: meds.count    ?? 0,
    labResults:  labs.count    ?? 0,
  };
}

function sectionSubtitle(key, counts) {
  const n = counts[key];
  if (key === 'basicInfo') return n ? 'Added' : 'DOB, sex, weight, height';
  const labels = { conditions: 'condition', allergies: 'allerg', medications: 'medication', labResults: 'report' };
  const base = labels[key];
  if (!n) return 'Not added yet';
  if (key === 'allergies') return `${n} ${n === 1 ? 'allergy' : 'allergies'}`;
  return `${n} ${base}${n !== 1 ? 's' : ''}`;
}

export default function MyHealthProfileScreen({ navigation }) {
  const [userName, setUserName]   = useState('');
  const [initials, setInitials]   = useState('');
  const [selfPerson, setSelfPerson] = useState(null);
  const [counts, setCounts]       = useState({ basicInfo: false, conditions: 0, allergies: 0, medications: 0, labResults: 0 });
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Resolve display name
      const { data: profile } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Me';
      setUserName(name);
      setInitials(name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase());

      // Find or create the self-person record
      let { data: existing } = await supabase
        .from('persons').select('*').eq('user_id', user.id).eq('is_self', true).maybeSingle();

      if (!existing) {
        const { data: created } = await supabase
          .from('persons')
          .insert({ user_id: user.id, name, relationship: 'Myself', is_self: true })
          .select()
          .single();
        existing = created;
      }

      if (existing) {
        setSelfPerson(existing);
        const c = await loadCounts(existing.id);
        setCounts(c);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const completedCount = SECTIONS.filter(s => s.key === 'basicInfo' ? counts.basicInfo : counts[s.key] > 0).length;
  const pct = Math.round((completedCount / SECTIONS.length) * 100);

  const goTo = (screen) => {
    if (!selfPerson) return;
    navigation.navigate(screen, { person: selfPerson, personId: selfPerson.id });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={s.topTitle}>My Health Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={C.forest} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={s.hero}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <Text style={s.heroName}>{userName}</Text>
            <Text style={s.heroSub}>Your personal health record</Text>

            {/* Progress */}
            <View style={s.progressRow}>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={s.progressPct}>{pct}%</Text>
            </View>
            <Text style={s.progressLabel}>{completedCount} of {SECTIONS.length} sections complete</Text>
          </View>

          {/* Sections */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text style={s.sectionHead}>Health sections</Text>
            <View style={s.listCard}>
              {SECTIONS.map((sec, i) => {
                const Icon = sec.icon;
                const done = sec.key === 'basicInfo' ? counts.basicInfo : counts[sec.key] > 0;
                const sub = sectionSubtitle(sec.key, counts);
                return (
                  <TouchableOpacity
                    key={sec.key}
                    style={[s.row, i < SECTIONS.length - 1 && s.rowBorder]}
                    onPress={() => goTo(sec.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.iconBox, { backgroundColor: done ? C.sageSoft : C.cream }]}>
                      <Icon />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.rowTitle}>{sec.title}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>{sub}</Text>
                    </View>
                    {done
                      ? <View style={s.doneBadge}><ICheck /></View>
                      : <IChev />
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500' },
  scroll: { paddingBottom: 40 },

  hero: { alignItems: 'center', paddingTop: 28, paddingBottom: 24, paddingHorizontal: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 28, fontWeight: '500' },
  heroName: { fontFamily: 'Georgia', fontSize: 24, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.4 },
  heroSub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginBottom: 4 },
  progressTrack: { flex: 1, height: 7, backgroundColor: C.lineSoft, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: C.forestDeep, borderRadius: 99 },
  progressPct: { fontSize: 12, fontWeight: '700', color: C.forestDeep, minWidth: 34, textAlign: 'right' },
  progressLabel: { fontSize: 12, color: C.muted },

  sectionHead: {
    fontSize: 12, fontWeight: '700', color: C.muted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10,
  },
  listCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  iconBox: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  rowSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  doneBadge: {
    width: 22, height: 22, borderRadius: 99,
    backgroundColor: C.sageSoft, alignItems: 'center', justifyContent: 'center',
  },
});
