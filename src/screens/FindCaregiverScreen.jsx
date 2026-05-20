import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';
import { supabase } from '../lib/supabase';
import { CAREGIVER_DIRECTORY, normalizeSupabaseCaregiver } from '../data/caregivers';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', sageSoft: '#DDE4D6', muted: '#6B6862',
  mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

const FILTERS = ['All', 'Toronto', 'PSW', 'Dementia', 'Live-in', 'French'];

// ─── Shared atoms ────────────────────────────────────────
export function PhotoTile({ tones = ['#C66E4E', '#B05E40'], initials = '?', size = 56, radius = 14 }) {
  const [a, b] = tones;
  const sw = 8;
  const lines = [];
  for (let i = -size; i < size * 2; i += sw * 2) {
    lines.push(
      <Path key={i}
        d={`M${i} 0 L${i + size} ${size} L${i + size + sw} ${size} L${i + sw} 0 Z`}
        fill={b} />
    );
  }
  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: a, flexShrink: 0, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {lines}
      </Svg>
      <Svg width={size} height={size} style={{ position: 'absolute', opacity: 0.2 }}>
        <Circle cx={size * 0.82} cy={size * 0.18} r={size * 0.45} stroke="#fff" strokeWidth={1} fill="none" />
        <Circle cx={size * 0.82} cy={size * 0.18} r={size * 0.28} stroke="#fff" strokeWidth={1} fill="none" />
      </Svg>
      <View style={{ position: 'absolute', bottom: 6, left: 7 }}>
        <Text style={{
          fontFamily: 'Georgia', fontSize: size * 0.28, color: '#fff',
          fontWeight: '500', letterSpacing: -0.3, lineHeight: size * 0.33,
        }}>{initials}</Text>
      </View>
    </View>
  );
}

export function Stars({ rating = 0, size = 11 }) {
  const full = Math.floor(rating);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <Svg key={i} width={size} height={size} viewBox="0 0 11 11">
          <Path
            d="M5.5 1l1.4 2.8 3.1.5-2.3 2.2.5 3.1L5.5 8.1 2.8 9.6l.5-3.1L1 4.3l3.1-.5L5.5 1z"
            fill={i < full ? '#D49542' : 'none'}
            stroke="#D49542"
            strokeWidth={1}
          />
        </Svg>
      ))}
    </View>
  );
}

function VerifiedTag() {
  return (
    <View style={sh.verifiedTag}>
      <Svg width={10} height={10} viewBox="0 0 11 11">
        <Path d="M5.5 1l1.2.8 1.4-.2.4 1.4 1.2.9-.6 1.3.4 1.4-1.3.4-.7 1.3-1.4-.4L5.5 8l-1-1-1.4.4-.7-1.3-1.3-.4.4-1.4L1 3l1.2-.9.4-1.4 1.4.2L5.5 1z" fill="#fff" />
        <Path d="M3.5 5.5l1.5 1.5 3-3" stroke={C.forest} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={sh.verifiedText}>Verified pro</Text>
    </View>
  );
}

export function SearchResultCard({ c, onPress }) {
  return (
    <TouchableOpacity style={sh.card} onPress={onPress} activeOpacity={0.8}>
      <PhotoTile tones={c.photoTone} initials={c.initials} size={54} radius={14} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={sh.cardName}>{c.name}</Text>
          {c.verified && <VerifiedTag />}
        </View>
        <Text style={sh.cardMeta}>{c.title}{c.yearsExp > 0 ? ` · ${c.yearsExp} yrs experience` : ''}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <Svg width={11} height={13} viewBox="0 0 11 13" fill="none">
            <Path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={C.mutedSoft} strokeWidth={1.3} />
            <Circle cx={5.5} cy={5} r={1.5} stroke={C.mutedSoft} strokeWidth={1.3} />
          </Svg>
          <Text style={sh.cardLoc}>{c.region ? `${c.region}, ` : ''}{c.city}{c.province ? ` · ${c.province}` : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
          {c.rating > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Stars rating={c.rating} />
              <Text style={sh.ratingNum}>{c.rating.toFixed(1)}</Text>
              {c.reviewCount > 0 && <Text style={sh.ratingCount}>({c.reviewCount})</Text>}
            </View>
          )}
          {c.rating > 0 && !!c.rate && <Text style={{ color: C.line }}>·</Text>}
          {!!c.rate && <Text style={sh.rate}>{c.rate}</Text>}
        </View>
      </View>
      <View style={{ alignSelf: 'center' }}>
        <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
          <Path d="M1 1l5 5-5 5" stroke={C.mutedSoft} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────
export default function FindCaregiverScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('All');
  const [supabaseCaregivers, setSupabaseCaregivers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // ── Source 1: caregiver_profiles table (dedicated caregiver listings) ──
        const { data: cpRows } = await supabase
          .from('caregiver_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        const fromCpTable = (cpRows || []).map(normalizeSupabaseCaregiver);

        // ── Source 2: profiles table where role = 'caregiver' ──
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, role')
          .eq('role', 'caregiver');

        const cpIds = new Set(fromCpTable.map(c => c.id));
        const fromProfiles = (profileRows || [])
          .filter(p => !cpIds.has(p.id)) // avoid duplicates
          .map(p => normalizeSupabaseCaregiver({
            id: p.id,
            full_name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || null,
          }))
          .filter(c => c.name && c.name !== 'Caregiver');

        setSupabaseCaregivers([...fromCpTable, ...fromProfiles]);
      } catch (_) {
        // silently ignore — mock data still shows
      }
    })();
  }, []);

  // Merge: mock directory + real Supabase profiles (dedup by id)
  const mockIds = new Set(CAREGIVER_DIRECTORY.map(c => c.id));
  const realOnly = supabaseCaregivers.filter(c => !mockIds.has(c.id));
  const allCaregivers = [...CAREGIVER_DIRECTORY, ...realOnly];

  const matchTag = (c) => {
    if (tag === 'All') return true;
    if (tag === 'PSW') return /psw/i.test(c.title);
    if (tag === 'Dementia') return (c.specialties || []).some(s => /dementia/i.test(s));
    if (tag === 'Live-in') return (c.specialties || []).some(s => /live/i.test(s)) || /live/i.test(c.title);
    if (tag === 'French') return (c.languages || []).includes('French');
    return c.city === tag;
  };

  const matchQ = (c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.city || '').toLowerCase().includes(s) ||
      (c.region || '').toLowerCase().includes(s) ||
      (c.province || '').toLowerCase().includes(s) ||
      (c.title || '').toLowerCase().includes(s) ||
      (c.specialties || []).join(' ').toLowerCase().includes(s) ||
      (c.languages || []).join(' ').toLowerCase().includes(s)
    );
  };

  const filtered = allCaregivers.filter(c => matchTag(c) && matchQ(c));

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Top bar */}
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.iconBtn}>
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={st.title}>Find a caregiver</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Text style={st.hero}>The right hands,{'\n'}close to home.</Text>
        <Text style={st.heroSub}>Verified professional caregivers across Canada. Search by name, city, or specialty.</Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={st.searchBox}>
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Circle cx={7} cy={7} r={5} stroke={C.muted} strokeWidth={1.5} />
            <Path d="M11 11l4 4" stroke={C.muted} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Name, city, or specialty"
            placeholderTextColor={C.mutedSoft}
            style={st.searchInput}
          />
          {!!q && (
            <TouchableOpacity onPress={() => setQ('')} style={st.clearBtn}>
              <Text style={{ fontSize: 12, color: C.muted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips — fixed height row, must not flex-grow */}
      <View style={{ flexShrink: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
          {FILTERS.map(t => {
            const active = tag === t;
            return (
              <TouchableOpacity
                key={t} onPress={() => setTag(t)}
                style={[st.filterChip, active && st.filterChipActive]}
              >
                <Text style={[st.filterChipText, active && { color: '#fff' }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={st.resultsMeta}>
          <Text style={st.resultsMetaText}>
            {filtered.length} {filtered.length === 1 ? 'match' : 'matches'}
            {!!q && <Text style={{ color: C.muted, fontWeight: '400' }}> for "{q}"</Text>}
          </Text>
          <Text style={st.sortedBy}>Sorted by rating</Text>
        </View>
        {filtered.length === 0 ? (
          <View style={st.empty}>
            <Text style={st.emptyTitle}>No matches yet</Text>
            <Text style={st.emptyText}>Try a different city, language, or specialty.</Text>
          </View>
        ) : (
          filtered.map(c => (
            <SearchResultCard
              key={c.id}
              c={c}
              onPress={() => navigation.navigate('CaregiverPublicProfile', { caregiver: c })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const sh = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
    padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  cardName: { fontSize: 14.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  cardMeta: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  cardLoc: { fontSize: 11, color: C.mutedSoft },
  ratingNum: { fontSize: 11, color: C.ink, fontWeight: '600' },
  ratingCount: { fontSize: 10.5, color: C.mutedSoft },
  rate: { fontSize: 11, color: C.forest, fontWeight: '600' },
  verifiedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99,
    backgroundColor: C.forest,
  },
  verifiedText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
});

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.2 },
  hero: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 30, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.6 },
  heroSub: { marginTop: 8, fontSize: 13, color: C.muted, lineHeight: 18 },
  searchBox: { height: 50, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontSize: 14.5, color: C.ink, letterSpacing: -0.15 },
  clearBtn: { width: 22, height: 22, borderRadius: 99, backgroundColor: C.line, alignItems: 'center', justifyContent: 'center' },
  filterRow: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2, gap: 7, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, height: 32, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', justifyContent: 'center', marginRight: 4 },
  filterChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  filterChipText: { fontSize: 12.5, color: C.ink, fontWeight: '500', letterSpacing: -0.1 },
  resultsMeta: { paddingTop: 14, paddingBottom: 8, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  resultsMetaText: { fontFamily: 'Georgia', fontSize: 15, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.2 },
  sortedBy: { fontSize: 11, color: C.muted, letterSpacing: 0.3 },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 24, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 15, color: C.forestDeep, fontWeight: '500' },
  emptyText: { fontSize: 12, color: C.muted, marginTop: 6, textAlign: 'center' },
});
