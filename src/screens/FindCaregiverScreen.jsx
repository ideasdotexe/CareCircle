import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';
import { IconChevronLeft, IconChevronRight } from '../components/Icons';
import { supabase } from '../lib/supabase';

const FILTERS = ['All', 'Toronto', 'PSW', 'Dementia', 'Live-in', 'French'];

export default function FindCaregiverScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('caregiver_profiles').select('*').limit(50);
        setResults(data || []);
      } catch (_) { setResults([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = results.filter(c => {
    const matchTag = tag === 'All' || (c.city || '').includes(tag) || (c.specialties || []).some(s => s.toLowerCase().includes(tag.toLowerCase()));
    if (!matchTag) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (c.full_name || '').toLowerCase().includes(s) || (c.city || '').toLowerCase().includes(s) || (c.title || '').toLowerCase().includes(s);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Find a caregiver</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
        <Text style={styles.hero}>The right hands,{'\n'}close to home.</Text>
        <Text style={styles.heroSub}>Verified professional caregivers across Canada. Search by name, city, or specialty.</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <View style={styles.searchBox}>
          <SearchIcon />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Name, city, or specialty"
            placeholderTextColor={colors.mutedSoft}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(t => {
          const active = tag === t;
          return (
            <TouchableOpacity key={t} onPress={() => setTag(t)} style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, active && { color: '#fff' }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <Text style={styles.resultsMeta}>{filtered.length} {filtered.length === 1 ? 'match' : 'matches'}</Text>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptyText}>Try a different city, language, or specialty.</Text>
            </View>
          ) : filtered.map(c => (
            <TouchableOpacity key={c.id} style={styles.card} onPress={() => navigation.navigate('CaregiverPublicProfile', { id: c.id, caregiver: c })}>
              <View style={[styles.avatar, { backgroundColor: '#C66E4E' }]}>
                <Text style={styles.avatarText}>{getInitials(c.full_name || '?')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.cardName}>{c.full_name || 'Caregiver'}</Text>
                  {c.verified && (
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedText}>VERIFIED PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardMeta}>{c.title || ''}{c.years_experience ? ` · ${c.years_experience} yrs` : ''}</Text>
                <Text style={styles.cardLoc}>{[c.city, c.province].filter(Boolean).join(', ')}</Text>
                <Text style={styles.cardRate}>{c.rate || ''}</Text>
              </View>
              <IconChevronRight />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SearchIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Circle cx="7" cy="7" r="5" stroke={colors.muted} strokeWidth="1.5" fill="none" />
      <Path d="M11 11l4 4" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function getInitials(name) {
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  hero: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 30, color: colors.forestDeep, fontWeight: '400' },
  heroSub: { marginTop: 8, fontSize: 13, color: colors.muted, lineHeight: 18 },
  searchBox: { height: 50, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontSize: 14.5, color: colors.ink },
  filterRow: { paddingHorizontal: 20, paddingTop: 12, gap: 7, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, height: 32, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', justifyContent: 'center', marginRight: 6 },
  filterChipActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  filterChipText: { fontSize: 12.5, color: colors.ink, fontWeight: '500' },
  resultsMeta: { paddingVertical: 14, fontFamily: 'Georgia', fontSize: 15, color: colors.forestDeep, fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 16, fontWeight: '500' },
  cardName: { fontSize: 14.5, fontWeight: '600', color: colors.ink },
  verifiedTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: colors.forest },
  verifiedText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  cardMeta: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  cardLoc: { fontSize: 11, color: colors.muted, marginTop: 4 },
  cardRate: { fontSize: 11, color: colors.forest, fontWeight: '600', marginTop: 4 },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 15, color: colors.forestDeep, fontWeight: '500' },
  emptyText: { fontSize: 12, color: colors.muted, marginTop: 6, textAlign: 'center' },
});
