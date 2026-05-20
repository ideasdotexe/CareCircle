import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import TabBar from '../components/TabBar';

// ─── Design tokens ────────────────────────────────────────
const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1',
  sageSoft: '#DDE4D6', sage: '#A8B5A0',
  muted: '#6B6862', mutedSoft: '#9A968F',
  line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ─── Subtype metadata ─────────────────────────────────────
const SUBTYPE = {
  Blood:     { color: '#C66E4E', label: 'Blood' },
  Imaging:   { color: '#1F3D38', label: 'Imaging' },
  ECG:       { color: '#A8B5A0', label: 'ECG' },
  Pathology: { color: '#7A5A3F', label: 'Path' },
  Other:     { color: '#9A968F', label: 'Other' },
};

function guessSubtype(data) {
  if (!data) return 'Other';
  const title = (data.title || data.report_type || '').toLowerCase();
  if (/blood|cbc|lipid|inr|hba|glucose|bmp|comp/.test(title)) return 'Blood';
  if (/imaging|x.?ray|mri|ct|echo|dexa|ultra/.test(title)) return 'Imaging';
  if (/ecg|ekg|electro/.test(title)) return 'ECG';
  if (/pathol|biopsy|histol/.test(title)) return 'Pathology';
  return 'Other';
}

// ─── Icons ────────────────────────────────────────────────
function IBack({ color = C.ink }) {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IScan() {
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
      <Path d="M1 5V3a2 2 0 012-2h2M17 5V3a2 2 0 00-2-2h-2M1 13v2a2 2 0 002 2h2M17 13v2a2 2 0 01-2 2h-2" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M1 9h16" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
function ISearch() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Circle cx={6} cy={6} r={4.5} stroke={C.muted} strokeWidth={1.4} />
      <Path d="M9.5 9.5L13 13" stroke={C.muted} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function IFlask({ color = '#fff' }) {
  return (
    <Svg width={12} height={14} viewBox="0 0 12 14" fill="none">
      <Path d="M4.5 1v4L1 12a.8.8 0 00.7 1h8.6a.8.8 0 00.7-1L7.5 5V1" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.5 1h5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function IImage({ color = '#fff' }) {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <Rect x={1} y={1} width={12} height={10} rx={1.5} stroke={color} strokeWidth={1.3} />
      <Path d="M1 8l3-3 3 3 2-2 4 4" stroke={color} strokeWidth={1.3} strokeLinejoin="round" fill="none" />
      <Circle cx={9.5} cy={3.5} r={1} fill={color} />
    </Svg>
  );
}
function IPulse({ color = '#fff' }) {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <Path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IRx({ color = '#fff' }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M3 1h4a3 3 0 010 6H3v6m0-6h3l4 6M3 1v6" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IWarn({ color = C.terracotta }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path d="M6 1l5 9H1L6 1z" stroke={color} strokeWidth={1.3} strokeLinejoin="round" />
      <Path d="M6 5v2.5M6 8.5v.5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
function IChevR() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke={C.mutedSoft} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function subtypeIcon(sub, color = '#fff') {
  if (sub === 'Blood') return <IFlask color={color} />;
  if (sub === 'Imaging') return <IImage color={color} />;
  if (sub === 'ECG') return <IPulse color={color} />;
  return <IFlask color={color} />;
}

// ─── Report card ──────────────────────────────────────────
function ReportCard({ report, onPress }) {
  const data = report.extracted_data || {};
  const subtype = guessSubtype(data);
  const meta = SUBTYPE[subtype] || SUBTYPE.Other;
  const date = report.report_date
    ? new Date(report.report_date).toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date(report.created_at).toLocaleDateString('en-CA', { day: 'numeric', month: 'short' });
  const testCount = data.tests?.length ?? 0;
  const abnormal = data.tests?.filter(t => t.flag && t.flag !== 'normal').length ?? 0;
  const labName = data.lab_name || '';

  return (
    <TouchableOpacity style={rc.card} onPress={onPress} activeOpacity={0.82}>
      {/* Colored left stripe */}
      <View style={[rc.stripe, { backgroundColor: meta.color }]} />

      {/* Icon badge */}
      <View style={[rc.iconBadge, { backgroundColor: meta.color }]}>
        {subtypeIcon(subtype)}
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={rc.title} numberOfLines={1}>
            {data.title || data.report_type || 'Lab report'}
          </Text>
          {abnormal > 0 && (
            <View style={rc.flagBadge}>
              <IWarn />
              <Text style={rc.flagText}>{abnormal}</Text>
            </View>
          )}
        </View>
        <Text style={rc.sub}>
          {labName ? `${labName} · ` : ''}{date}
        </Text>
        {testCount > 0 && (
          <Text style={rc.count}>
            {testCount} result{testCount !== 1 ? 's' : ''}
            {abnormal > 0 ? ` · ${abnormal} out of range` : ''}
          </Text>
        )}
        {/* Subtype pill */}
        <View style={[rc.subtypePill, { backgroundColor: meta.color + '22' }]}>
          <Text style={[rc.subtypeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <IChevR />
    </TouchableOpacity>
  );
}

const rc = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 8, paddingRight: 14, paddingVertical: 14,
    overflow: 'hidden',
  },
  stripe: { width: 4, alignSelf: 'stretch', borderRadius: 4, marginLeft: 0, flexShrink: 0 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: '600', color: C.ink, letterSpacing: -0.1, flex: 1 },
  sub: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  count: { fontSize: 11, color: C.mutedSoft, marginTop: 2 },
  flagBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99,
    backgroundColor: C.terracottaSoft,
  },
  flagText: { fontSize: 10, color: C.terracotta, fontWeight: '700' },
  subtypePill: {
    marginTop: 5, alignSelf: 'flex-start',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99,
  },
  subtypeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Cluster card (3+ same subtype) ─────────────────────
function ClusterCard({ items, subtype, onPress }) {
  const meta = SUBTYPE[subtype] || SUBTYPE.Other;
  const latest = items[0];
  const data = latest.extracted_data || {};
  const date = latest.report_date
    ? new Date(latest.report_date).toLocaleDateString('en-CA', { day: 'numeric', month: 'short' })
    : new Date(latest.created_at).toLocaleDateString('en-CA', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity style={cc.wrap} onPress={onPress} activeOpacity={0.82}>
      {/* Stacked paper effect */}
      <View style={[cc.paper3, { backgroundColor: meta.color + '30' }]} />
      <View style={[cc.paper2, { backgroundColor: meta.color + '55' }]} />
      <View style={[cc.card, { backgroundColor: meta.color }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <View style={cc.iconBadge}>{subtypeIcon(subtype)}</View>
            <Text style={cc.label}>{meta.label} reports</Text>
          </View>
          <Text style={cc.count}>{items.length} reports</Text>
          <Text style={cc.date}>Latest: {date}</Text>
        </View>
        <View style={cc.chevron}>
          <IChevR />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  wrap: { marginBottom: 12, height: 108 },
  paper3: { position: 'absolute', bottom: 0, left: 6, right: 6, height: 96, borderRadius: 16 },
  paper2: { position: 'absolute', bottom: 5, left: 3, right: 3, height: 98, borderRadius: 16 },
  card: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
  },
  iconBadge: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },
  count: { fontSize: 20, fontFamily: 'Georgia', color: '#fff', fontWeight: '400', letterSpacing: -0.4 },
  date: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  chevron: { opacity: 0.7 },
});

// ─── Main screen ──────────────────────────────────────────
export default function DocsHomeScreen({ navigation }) {
  const [persons, setPersons] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState('reports'); // 'reports' | 'prescriptions'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = useCallback(async (personOverride) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: personsData } = await supabase
        .from('persons')
        .select('id, name, relationship')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!personsData?.length) { setLoading(false); return; }
      setPersons(personsData);

      const target = personOverride ?? personsData[activeIdx] ?? personsData[0];
      const idx = personsData.findIndex(p => p.id === target.id);
      if (idx >= 0) setActiveIdx(idx);

      const { data: labData } = await supabase
        .from('lab_results')
        .select('id, report_date, extracted_data, created_at')
        .eq('person_id', target.id)
        .order('created_at', { ascending: false });

      setReports(labData ?? []);
    } catch (_) {}
    setLoading(false);
  }, [activeIdx]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const switchPerson = (p, i) => {
    setActiveIdx(i);
    load(p);
  };

  const activePerson = persons[activeIdx];

  // Auto-cluster: ≥3 reports of same subtype → cluster card
  const filtered = reports.filter(r => {
    if (!q) return true;
    const data = r.extracted_data || {};
    const haystack = [data.title, data.lab_name, data.report_type].join(' ').toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  // Group by subtype for clustering
  const subtypeGroups = {};
  filtered.forEach(r => {
    const sub = guessSubtype(r.extracted_data);
    (subtypeGroups[sub] = subtypeGroups[sub] || []).push(r);
  });

  const rendered = [];
  const clustered = new Set();
  Object.entries(subtypeGroups).forEach(([sub, items]) => {
    if (items.length >= 3) {
      rendered.push({ type: 'cluster', subtype: sub, items, key: sub });
      items.forEach(r => clustered.add(r.id));
    }
  });
  filtered.forEach(r => {
    if (!clustered.has(r.id)) {
      rendered.push({ type: 'single', report: r, key: r.id });
    }
  });

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* ── Top bar ── */}
      <View style={st.topBar}>
        <TouchableOpacity style={st.iconBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={st.topTitle}>Documents</Text>
        <TouchableOpacity
          style={st.scanBtn}
          onPress={() => navigation.navigate('DocumentUpload', { person: activePerson })}
        >
          <IScan />
          <Text style={st.scanText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* ── Hero ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 }}>
        <Text style={st.hero}>
          {activePerson?.name
            ? `${activePerson.name}'s\nrecords.`
            : 'Health\nrecords.'}
        </Text>
        <Text style={st.heroSub}>Prescriptions, lab reports and imaging — all in one place.</Text>
      </View>

      {/* ── Person chips ── */}
      {persons.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexShrink: 0 }}
          contentContainerStyle={st.personRow}
        >
          {persons.map((p, i) => {
            const active = i === activeIdx;
            const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => switchPerson(p, i)}
                style={[st.personChip, active && st.personChipActive]}
              >
                <View style={[st.personInit, { backgroundColor: tint }]}>
                  <Text style={st.personInitText}>{(p.name || '?')[0]}</Text>
                </View>
                <Text style={[st.personChipName, active && { color: '#fff' }]}>{p.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Tab toggle ── */}
      <View style={st.tabRow}>
        <TouchableOpacity
          style={[st.tabBtn, tab === 'reports' && st.tabBtnActive]}
          onPress={() => setTab('reports')}
        >
          <Text style={[st.tabText, tab === 'reports' && st.tabTextActive]}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.tabBtn, tab === 'prescriptions' && st.tabBtnActive]}
          onPress={() => setTab('prescriptions')}
        >
          <Text style={[st.tabText, tab === 'prescriptions' && st.tabTextActive]}>Prescriptions</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={st.searchWrap}>
        <View style={st.searchBox}>
          <ISearch />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search reports…"
            placeholderTextColor={C.mutedSoft}
            style={st.searchInput}
          />
        </View>
      </View>

      {/* ── Body ── */}
      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'prescriptions' ? (
            /* Prescriptions: scan prompt only for now */
            <View style={st.emptyCard}>
              <View style={st.emptyIconWrap}>
                <IRx color={C.forest} />
              </View>
              <Text style={st.emptyTitle}>No prescriptions yet</Text>
              <Text style={st.emptyText}>
                Scan a prescription with the button above — AI reads the details automatically.
              </Text>
              <TouchableOpacity
                style={st.emptyBtn}
                onPress={() => navigation.navigate('DocumentUpload', { person: activePerson })}
              >
                <IScan />
                <Text style={st.emptyBtnText}>Scan prescription</Text>
              </TouchableOpacity>
            </View>
          ) : reports.length === 0 ? (
            <View style={st.emptyCard}>
              <View style={st.emptyIconWrap}>
                <IFlask color={C.forest} />
              </View>
              <Text style={st.emptyTitle}>No lab reports yet</Text>
              <Text style={st.emptyText}>
                Scan a lab result above — AI extracts all values and flags anything out of range.
              </Text>
              <TouchableOpacity
                style={st.emptyBtn}
                onPress={() => navigation.navigate('DocumentUpload', { person: activePerson })}
              >
                <IScan />
                <Text style={st.emptyBtnText}>Scan report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={st.countLine}>
                {filtered.length} report{filtered.length !== 1 ? 's' : ''}
                {q ? ` matching "${q}"` : ''}
              </Text>
              {rendered.map(item =>
                item.type === 'cluster' ? (
                  <ClusterCard
                    key={item.key}
                    items={item.items}
                    subtype={item.subtype}
                    onPress={() => navigation.navigate('LabResults', { person: activePerson })}
                  />
                ) : (
                  <ReportCard
                    key={item.key}
                    report={item.report}
                    onPress={() => navigation.navigate('LabResults', { person: activePerson })}
                  />
                )
              )}
            </>
          )}
        </ScrollView>
      )}

      <TabBar active={2} navigation={navigation} params={activePerson ? { person: activePerson } : undefined} />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 36, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: C.forestDeep,
  },
  scanText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  hero: { fontFamily: 'Georgia', fontSize: 27, lineHeight: 32, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.6 },
  heroSub: { marginTop: 6, fontSize: 13, color: C.muted, lineHeight: 18 },

  personRow: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2, gap: 8 },
  personChip: {
    height: 36, paddingHorizontal: 12, paddingLeft: 4, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  personChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  personInit: { width: 26, height: 26, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  personInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 11, fontWeight: '500' },
  personChipName: { fontSize: 12.5, fontWeight: '500', color: C.ink },

  tabRow: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: C.line,
    padding: 3,
  },
  tabBtn: {
    flex: 1, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tabBtnActive: { backgroundColor: C.forestDeep },
  tabText: { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTextActive: { color: '#fff' },

  searchWrap: { paddingHorizontal: 20, paddingTop: 10 },
  searchBox: {
    height: 42, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.ink },

  countLine: { fontSize: 11, color: C.mutedSoft, marginBottom: 10, letterSpacing: 0.2 },

  emptyCard: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: C.line,
    padding: 28, alignItems: 'center', marginTop: 12,
  },
  emptyIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.sageSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500', marginBottom: 6 },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 7,
    height: 42, paddingHorizontal: 18, borderRadius: 12,
    backgroundColor: C.forestDeep,
  },
  emptyBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
});
