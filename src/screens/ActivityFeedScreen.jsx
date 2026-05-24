import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── Design tokens ────────────────────────────────────────
const C = {
  cream:         '#F6F1EA',
  ink:           '#1A1F1D',
  forest:        '#1F3D38',
  forestDeep:    '#15302C',
  terracotta:    '#C66E4E',
  terracottaSoft:'#E9CFC1',
  sageSoft:      '#DDE4D6',
  sage:          '#A8B5A0',
  muted:         '#6B6862',
  mutedSoft:     '#9A968F',
  line:          '#E8E0D2',
  lineSoft:      '#EFE8DA',
};

// ─── Icons ────────────────────────────────────────────────
function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
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
function ICheck({ color = '#fff' }) {
  return (
    <Svg width={12} height={10} viewBox="0 0 12 10" fill="none">
      <Path d="M1 5l3 3 7-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IPill({ color = C.forest }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Rect x={1} y={5} width={14} height={6} rx={3} stroke={color} strokeWidth={1.4} />
      <Path d="M8 5v6" stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}
function IPulse({ color = C.forest }) {
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14" fill="none">
      <Path d="M1 7h3l2-5 4 10 2-5h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function INote({ color = C.forest }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M2 2h10v8l-3 3H2V2z" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M9 13v-3h3" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}
function IDoc({ color = C.forest }) {
  return (
    <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
      <Path d="M2 1h7l4 4v10H2V1z" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M9 1v4h4" stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}
function IAppt({ color = C.forest }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Rect x={1} y={2.5} width={12} height={10.5} rx={1.5} stroke={color} strokeWidth={1.4} />
      <Path d="M1 5.5h12M4 1v2.5M10 1v2.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Type meta ────────────────────────────────────────────
const TYPE_META = {
  all:        { label: 'All',          Icon: null },
  med:        { label: 'Meds',         Icon: IPill },
  medication: { label: 'Meds',         Icon: IPill },
  vital:      { label: 'Vitals',       Icon: IPulse },
  note:       { label: 'Notes',        Icon: INote },
  doc:        { label: 'Health Records', Icon: IDoc },
  appt:       { label: 'Appointments', Icon: IAppt },
};

const FILTER_TABS = [
  { k: 'all',   label: 'All',          Icon: null },
  { k: 'med',   label: 'Meds',         Icon: IPill },
  { k: 'vital', label: 'Vitals',       Icon: IPulse },
  { k: 'note',  label: 'Notes',        Icon: INote },
  { k: 'doc',   label: 'Health Records', Icon: IDoc },
  { k: 'appt',  label: 'Appointments', Icon: IAppt },
];

// ─── Helpers ──────────────────────────────────────────────
function actorTone(role) {
  if (!role) return C.forest;
  const r = role.toLowerCase();
  if (r.includes('caregiver') || r.includes('psw') || r.includes('nurse')) return '#C66E4E';
  if (r.includes('family') || r.includes('you')) return '#1F3D38';
  return '#3F5D54'; // doctor / specialist
}

function isDone(item) {
  if (item.status === 'taken' || item.status === 'completed') return true;
  if (item.status === 'skipped') return false;
  return !!(item.completed || item.done || item.taken);
}

function getItemIcon(item) {
  const kind = item.activity_type || item.type || 'note';
  const key = kind === 'medication' ? 'med' : kind;
  return TYPE_META[key]?.Icon ?? INote;
}

function groupByDay(items) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const map = {};
  for (const it of items) {
    const d = it.created_at ? new Date(it.created_at) : new Date();
    const day = new Date(d); day.setHours(0, 0, 0, 0);
    let label;
    if (day.getTime() === today.getTime()) label = 'Today';
    else if (day.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!map[label]) map[label] = { label, items: [], dayKey: day.getTime() };
    map[label].items.push(it);
  }
  return Object.values(map).sort((a, b) => b.dayKey - a.dayKey);
}

// ─── Circular progress ring ───────────────────────────────
function ProgressRing({ pct, isToday }) {
  const r = 15;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  const trackColor = isToday ? 'rgba(255,255,255,0.2)' : C.line;
  const fillColor  = isToday ? '#fff' : C.forest;
  const textColor  = isToday ? '#fff' : C.ink;
  return (
    <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={36} height={36} style={{ position: 'absolute' }}>
        <Circle cx={18} cy={18} r={r} fill="none" stroke={trackColor} strokeWidth={3} />
        <Circle
          cx={18} cy={18} r={r} fill="none"
          stroke={fillColor} strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          rotation={-90}
          origin="18,18"
        />
      </Svg>
      <Text style={{
        fontSize: 8.5, fontWeight: '700', color: textColor,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 0.2,
      }}>{pct}%</Text>
    </View>
  );
}

// ─── Day summary card ─────────────────────────────────────
function DaySummaryCard({ label, items }) {
  const isToday = label === 'Today';
  const total = items.length;
  const doneCount = items.filter(it => isDone(it)).length;
  const flaggedCount = items.filter(it => it.flagged).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Unique contributors
  const contribMap = new Map();
  for (const it of items) {
    if (it.actor_name) contribMap.set(it.actor_name, { name: it.actor_name, role: it.actor_role, tone: actorTone(it.actor_role) });
  }
  const contributors = Array.from(contribMap.values()).slice(0, 3);

  return (
    <View style={[ds.card, isToday && { backgroundColor: C.forestDeep, borderWidth: 0 }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[ds.bucket, isToday && { color: 'rgba(255,255,255,0.7)' }]}>{label.toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
          <Text style={[ds.summary, isToday && { color: '#fff' }]}>
            {doneCount} of {total} completed
          </Text>
          {flaggedCount > 0 && (
            <Text style={[ds.flagNote, isToday && { color: C.terracottaSoft }]}>
              · {flaggedCount} flagged
            </Text>
          )}
        </View>
      </View>

      {/* Contributor stacked avatars */}
      {contributors.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
          {contributors.map((p, i) => (
            <View
              key={i}
              style={[
                ds.avatar,
                { backgroundColor: p.tone, marginLeft: i === 0 ? 0 : -8,
                  borderColor: isToday ? C.forestDeep : '#fff' },
              ]}
            >
              <Text style={ds.avatarText}>{p.name[0]}</Text>
            </View>
          ))}
        </View>
      )}

      <ProgressRing pct={pct} isToday={isToday} />
    </View>
  );
}

// ─── Activity row ─────────────────────────────────────────
function ActivityRow({ item, isLast }) {
  const done = isDone(item);
  const skipped = item.status === 'skipped';
  const flagged = item.flagged;
  const Icon = getItemIcon(item);

  const iconBg = flagged    ? '#FBE3D9'
               : done       ? C.sageSoft
               : C.cream;
  const iconColor = flagged   ? C.terracotta
                  : done      ? C.forest
                  : C.muted;

  const timeStr = item.created_at
    ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  const actorToneVal = actorTone(item.actor_role);

  return (
    <View style={[ar.row, !isLast && ar.border]}>
      {/* Icon badge */}
      <View style={[ar.iconBadge, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Title + time */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <Text style={ar.title} numberOfLines={1}>
            {item.title || item.description || 'Activity'}
          </Text>
          <Text style={ar.time}>{timeStr}</Text>
        </View>

        {/* Note */}
        {!!item.note && (
          <Text style={[ar.note, flagged && { color: C.terracotta }]} numberOfLines={2}>
            {item.note}
          </Text>
        )}

        {/* Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {done && item.actor_name ? (
            <>
              <View style={[ar.actorDot, { backgroundColor: actorToneVal }]}>
                <Text style={ar.actorDotText}>{item.actor_name[0]}</Text>
              </View>
              <Text style={ar.actorLabel}>
                <Text style={{ fontWeight: '600', color: C.ink }}>{item.actor_name}</Text>
                {item.actor_role ? <Text style={{ color: C.mutedSoft }}> · {item.actor_role}</Text> : null}
              </Text>
              {flagged && (
                <View style={ar.flagBadge}>
                  <Text style={ar.flagBadgeText}>FLAGGED · {typeof flagged === 'string' ? flagged.toUpperCase() : 'HIGH'}</Text>
                </View>
              )}
            </>
          ) : skipped ? (
            <View style={ar.pendingPill}>
              <Text style={ar.pendingPillText}>SKIPPED</Text>
            </View>
          ) : !done ? (
            <View style={ar.pendingPill}>
              <Text style={ar.pendingPillText}>Pending</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Check circle */}
      <View style={[ar.check, done && ar.checkDone, skipped && { borderColor: C.terracotta }]}>
        {done && <ICheck color="#fff" />}
        {skipped && <Text style={{ fontSize: 8, color: C.terracotta, fontWeight: '700' }}>✕</Text>}
      </View>
    </View>
  );
}

// Normalize an activity_log row so medication entries have top-level title/status/note
function normalizeRow(row) {
  if (row.action_type === 'medication' && row.payload) {
    const p = row.payload;
    return {
      ...row,
      activity_type: 'medication',
      title: p.medication_name || row.title || 'Medication',
      status: p.status || row.status || null,
      note: p.note || row.note || null,
    };
  }
  return row;
}

// ─── Main screen ──────────────────────────────────────────
export default function ActivityFeedScreen({ navigation, route }) {
  const passedPerson = route?.params?.person;
  const personId = passedPerson?.id || route?.params?.personId;
  const [persons, setPersons] = useState(passedPerson ? [passedPerson] : []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load persons once — skip owner query when a specific person is passed (caregiver mode)
  useEffect(() => {
    if (passedPerson) return; // already set above
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: pp } = await supabase.from('persons').select('*').eq('user_id', user.id).order('created_at');
        setPersons(pp || []);
        if (personId && pp) {
          const idx = pp.findIndex(p => p.id === personId);
          if (idx >= 0) setActiveIdx(idx);
        }
      } catch (_) {}
    })();
  }, [personId]);

  // Load activity when person changes
  const loadActivity = useCallback(async () => {
    const active = persons[activeIdx];
    if (!active) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .eq('person_id', active.id)
        .order('created_at', { ascending: false })
        .limit(150);
      setItems((data || []).map(normalizeRow));
    } catch (_) { setItems([]); }
    finally { setLoading(false); }
  }, [persons, activeIdx]);

  useFocusEffect(useCallback(() => { loadActivity(); }, [loadActivity]));

  const activePerson = persons[activeIdx];
  const displayName = activePerson ? (activePerson.name || activePerson.first_name || 'them') : 'them';

  // Filter items
  const filtered = filter === 'all'
    ? items
    : items.filter(it => {
        const kind = (it.activity_type || it.action_type || it.type || '').toLowerCase();
        if (filter === 'med') return kind === 'med' || kind === 'medication';
        return kind === filter;
      });

  const grouped = groupByDay(filtered);

  return (
    <SafeAreaView style={st.container} edges={['top']}>

      {/* ── Top bar ── */}
      <View style={st.topBar}>
        <TouchableOpacity style={st.iconBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={st.topTitle}>Activity</Text>
        <TouchableOpacity style={st.iconBtn}>
          <ISearch />
        </TouchableOpacity>
      </View>

      {/* ── Hero header ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
        <Text style={st.heroText}>The shared log{'\n'}of {displayName}'s care.</Text>
        <Text style={st.heroSub}>
          Every dose, vital, and note — grouped by day, with who logged it.
        </Text>
      </View>

      {/* ── Person chips ── */}
      {persons.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 0, flexGrow: 0 }} contentContainerStyle={st.personRow}>
          {persons.map((p, i) => {
            const isActive = i === activeIdx;
            const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
            const pName = p.name || p.first_name || '?';
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setActiveIdx(i)}
                style={[st.personChip, isActive && st.personChipActive]}
              >
                <View style={[st.personInit, { backgroundColor: tint }]}>
                  <Text style={st.personInitText}>{pName[0].toUpperCase()}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                  <Text style={[st.personChipName, isActive && { color: '#fff' }]}>{pName}</Text>
                  {p.relationship ? (
                    <Text style={[st.personChipRel, isActive && { color: 'rgba(255,255,255,0.6)' }]}>
                      {p.relationship}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Type filter strip ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexShrink: 0, flexGrow: 0 }}
        contentContainerStyle={st.filterRow}
      >
        {FILTER_TABS.map(tab => {
          const isActive = filter === tab.k;
          return (
            <TouchableOpacity
              key={tab.k}
              onPress={() => setFilter(tab.k)}
              style={[st.filterChip, isActive && st.filterChipActive]}
              activeOpacity={0.75}
            >
              {tab.Icon && (
                <View style={[st.filterIcon, isActive && { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <tab.Icon color={isActive ? '#fff' : C.forest} />
                </View>
              )}
              <Text style={[st.filterLabel, isActive && { color: '#fff' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Body ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={C.forest} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {grouped.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>
                Nothing logged of this kind yet.
              </Text>
            </View>
          ) : (
            grouped.map(group => (
              <View key={group.label} style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                <DaySummaryCard label={group.label} items={group.items} />
                <View style={st.listCard}>
                  {group.items.map((it, i) => (
                    <ActivityRow key={it.id || i} item={it} isLast={i === group.items.length - 1} />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Day summary styles ───────────────────────────────────
const ds = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line,
    padding: 12, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  bucket: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: C.muted },
  summary: { fontFamily: 'Georgia', fontSize: 15, fontWeight: '500', color: C.ink, letterSpacing: -0.2 },
  flagNote: { fontSize: 11, color: C.terracotta, fontWeight: '600', letterSpacing: 0.3 },
  avatar: {
    width: 24, height: 24, borderRadius: 99, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '500', color: '#fff' },
});

// ─── Activity row styles ──────────────────────────────────
const ar = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  border: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  iconBadge: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  title: { fontSize: 14, fontWeight: '600', color: C.ink, letterSpacing: -0.1, flex: 1 },
  time: { fontSize: 11, color: C.mutedSoft, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 0.2, flexShrink: 0 },
  note: { marginTop: 3, fontSize: 12, color: C.muted, lineHeight: 16 },
  actorDot: { width: 20, height: 20, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  actorDotText: { fontFamily: 'Georgia', fontSize: 10, color: '#fff', fontWeight: '500' },
  actorLabel: { fontSize: 11, color: C.muted, flex: 1 },
  flagBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99, backgroundColor: '#FBE3D9' },
  flagBadgeText: { fontSize: 9.5, fontWeight: '700', color: C.terracotta, letterSpacing: 0.4 },
  pendingPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line },
  pendingPillText: { fontSize: 10.5, color: C.muted, fontWeight: '600', letterSpacing: 0.2 },
  check: { width: 22, height: 22, borderRadius: 99, borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginTop: 8, flexShrink: 0 },
  checkDone: { backgroundColor: C.forest, borderColor: C.forest },
});

// ─── Main styles ──────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  // Top bar
  topBar: {
    paddingHorizontal: 24, paddingTop: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.2 },

  // Hero
  heroText: { fontFamily: 'Georgia', fontSize: 27, lineHeight: 32, letterSpacing: -0.7, color: C.forestDeep, fontWeight: '400' },
  heroSub: { marginTop: 8, fontSize: 13, color: C.muted, lineHeight: 18 },

  // Person chips
  personRow: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 8, flexDirection: 'row' },
  personChip: {
    height: 40, paddingHorizontal: 14, paddingLeft: 4, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 8,
  },
  personChipActive: { borderColor: C.forestDeep, backgroundColor: C.forestDeep },
  personInit: { width: 30, height: 30, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  personInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  personChipName: { fontSize: 13, fontWeight: '500', color: C.ink, lineHeight: 14 },
  personChipRel: { fontSize: 9.5, color: C.muted, marginTop: 1, letterSpacing: 0.2 },

  // Filter strip
  filterRow: { paddingHorizontal: 20, paddingTop: 8, gap: 7, flexDirection: 'row' },
  filterChip: {
    height: 32, paddingHorizontal: 12, paddingLeft: 6, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6,
  },
  filterChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  filterIcon: {
    width: 22, height: 22, borderRadius: 99, backgroundColor: C.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  filterLabel: { fontSize: 12.5, fontWeight: '500', color: C.ink, letterSpacing: -0.1 },

  // List
  listCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
});
