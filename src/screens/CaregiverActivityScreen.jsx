import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import CaregiverTabBar from '../components/CaregiverTabBar';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#FBE3D9', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ─── Icons ────────────────────────────────────────────────────
function INoteIcon({ color = C.forest }) {
  return (
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M1.5 1h7l3.5 3.5V13h-10.5V1z" stroke={color} strokeWidth={1.3} strokeLinejoin="round" />
      <Path d="M4 7h5M4 10h4" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
function IPulseIcon({ color = C.forest }) {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <Path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IPillIcon({ color = C.forest }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Rect x={1} y={4.5} width={12} height={5} rx={2.5} stroke={color} strokeWidth={1.3} />
      <Path d="M7 4.5v5" stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}
function IDocIcon({ color = C.forest }) {
  return (
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M1.5 1h6.5l3.5 3.5V13h-10V1z" stroke={color} strokeWidth={1.3} strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ init, tint, size = 30 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 99, backgroundColor: tint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: size * 0.4, color: '#fff', fontWeight: '500' }}>{init}</Text>
    </View>
  );
}

// ─── Kind metadata ────────────────────────────────────────────
const KIND = {
  medication:  { icon: IPillIcon,  bg: '#E9DEC4',   label: 'Meds' },
  vitals:      { icon: IPulseIcon, bg: C.sageSoft,  label: 'Vitals' },
  visit_note:  { icon: INoteIcon,  bg: C.terracottaSoft, label: 'Visit' },
  note:        { icon: INoteIcon,  bg: C.terracottaSoft, label: 'Note' },
  document:    { icon: IDocIcon,   bg: C.terracottaSoft, label: 'Doc' },
  default:     { icon: INoteIcon,  bg: C.sageSoft,  label: 'Log' },
};

function kindFor(type) { return KIND[type] || KIND.default; }

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const isYesterday = d.toDateString() === yest.toDateString();
  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `today · ${t}`;
  if (isYesterday) return `Yesterday · ${t}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` · ${t}`;
}

function groupByDate(items) {
  const groups = {};
  for (const item of items) {
    const d = new Date(item.created_at);
    const now = new Date();
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    let label;
    if (d.toDateString() === now.toDateString()) label = 'Today';
    else if (d.toDateString() === yest.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

function summaryOf(item) {
  const p = item.payload || {};
  switch (item.action_type || item.activity_type) {
    case 'medication': {
      const status = p.status === 'taken' ? 'Confirmed' : p.status === 'skipped' ? 'Skipped' : 'Logged';
      return `${status} ${p.medication_name || 'medication'} for ${item.person_name || ''}`;
    }
    case 'vitals':
      return `Logged vitals for ${item.person_name || ''}`;
    case 'visit_note':
    case 'note':
      return `Visit note — ${item.person_name || ''}`;
    default:
      return item.title || item.note || 'Activity logged';
  }
}

function detailOf(item) {
  const p = item.payload || {};
  if (p.note) return p.note;
  if (item.note) return item.note;
  if (p.value) return String(p.value);
  return '';
}

function FeedItem({ item, isLast, userInit, userTint }) {
  const k = kindFor(item.action_type || item.activity_type);
  const IconComp = k.icon;
  const time = formatTime(item.created_at);
  const flagged = item.payload?.flagged || item.flagged;

  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingBottom: isLast ? 0 : 10, position: 'relative' }}>
      <View style={{ width: 32, flexShrink: 0, position: 'relative', alignItems: 'center' }}>
        <Avatar init={userInit} tint={userTint} size={30} />
        {!isLast && (
          <View style={{ position: 'absolute', top: 32, bottom: -10, width: 1.5, backgroundColor: C.line }} />
        )}
      </View>
      <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: k.bg, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
            <IconComp color={C.forest} />
          </View>
          <Text style={{ fontSize: 11.5, color: C.muted, flex: 1 }}>
            <Text style={{ color: C.ink, fontWeight: '600' }}>You</Text>
            {' · '}{time.replace('today · ', '').replace('Yesterday · ', '')}
          </Text>
          {!!flagged && (
            <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, backgroundColor: C.terracottaSoft }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: C.terracotta, letterSpacing: 0.4 }}>FLAGGED</Text>
            </View>
          )}
        </View>
        <Text style={{ marginTop: 6, fontSize: 13, fontWeight: '600', color: C.ink, letterSpacing: -0.1 }}>
          {summaryOf(item)}
        </Text>
        {!!detailOf(item) && (
          <Text style={{ marginTop: 3, fontSize: 12, color: C.muted, lineHeight: 16 }} numberOfLines={3}>
            {detailOf(item)}
          </Text>
        )}
      </View>
    </View>
  );
}

const FILTERS = ['All', 'Vitals', 'Meds', 'Visits', 'Notes'];

export default function CaregiverActivityScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userInit, setUserInit] = useState('CG');
  const [userTint] = useState('#C66E4E');
  const [stats, setStats] = useState({ visits: 0, logs: 0, flagged: 0 });

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      const name = prof?.full_name || user.email || '';
      setUserInit(name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CG');

      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(80);

      const rows = data || [];
      setItems(rows);

      const visits = rows.filter(r => r.action_type === 'visit_note' || r.action_type === 'note').length;
      const logs = rows.length;
      const flagged = rows.filter(r => r.payload?.flagged || r.flagged).length;
      setStats({ visits, logs, flagged });
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = items.filter(item => {
    if (filter === 'All') return true;
    const type = item.action_type || item.activity_type || '';
    if (filter === 'Vitals') return type === 'vitals';
    if (filter === 'Meds') return type === 'medication';
    if (filter === 'Visits') return type === 'visit_note';
    if (filter === 'Notes') return type === 'note';
    return true;
  });

  const grouped = groupByDate(filtered);
  const dateKeys = Object.keys(grouped);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.modeStrip} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text style={s.modeLabel}>Your activity</Text>
        <Text style={s.heading}>What you've logged</Text>
        <Text style={s.sub}>Visible to the families you care for.</Text>
      </View>

      {/* Stats strip */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={s.statsCard}>
          {[
            { v: stats.visits, l: 'Visits / wk' },
            { v: stats.logs,   l: 'Logs' },
            { v: stats.flagged, l: 'Flagged' },
          ].map((item, i, arr) => (
            <View key={i} style={[s.statCol, i < arr.length - 1 && s.statColBorder]}>
              <Text style={s.statBig}>{item.v}</Text>
              <Text style={s.statLabel}>{item.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 0, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, gap: 6, flexDirection: 'row' }}>
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[s.filterChip, active && s.filterChipActive]} activeOpacity={0.8}>
              <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Nothing logged yet</Text>
          <Text style={s.emptySub}>Your medication logs, vitals, and visit notes will appear here.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {dateKeys.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No {filter.toLowerCase()} logged</Text>
            </View>
          ) : dateKeys.map(dateKey => {
            const dayItems = grouped[dateKey];
            return (
              <View key={dateKey}>
                <Text style={s.dateLabel}>{dateKey}</Text>
                {dayItems.map((item, i) => (
                  <FeedItem
                    key={item.id || i}
                    item={item}
                    isLast={i === dayItems.length - 1}
                    userInit={userInit}
                    userTint={userTint}
                  />
                ))}
                <View style={{ height: 14 }} />
              </View>
            );
          })}
        </ScrollView>
      )}

      <CaregiverTabBar active={2} navigation={navigation} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  modeStrip: { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  modeLabel: { fontSize: 10, color: C.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: '700' },
  heading: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 30, color: C.forestDeep, fontWeight: '400', marginTop: 4, letterSpacing: -0.6 },
  sub: { fontSize: 12.5, color: C.muted, marginTop: 4 },
  statsCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12, flexDirection: 'row' },
  statCol: { flex: 1, paddingHorizontal: 8 },
  statColBorder: { borderRightWidth: 1, borderRightColor: C.lineSoft },
  statBig: { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3, lineHeight: 24 },
  statLabel: { fontSize: 10, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 },
  filterChip: { height: 30, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  filterChipText: { fontSize: 12, fontWeight: '500', color: C.ink, letterSpacing: -0.1 },
  filterChipTextActive: { color: '#fff' },
  dateLabel: { fontSize: 10.5, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '600', marginBottom: 8, paddingLeft: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500', textAlign: 'center' },
  emptySub: { marginTop: 8, fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19 },
});
