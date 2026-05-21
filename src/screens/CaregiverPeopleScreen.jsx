import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import CaregiverTabBar from '../components/CaregiverTabBar';
import { supabase } from '../lib/supabase';

// ─── Design tokens ───────────────────────────────────────────
const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#FBE3D9', terracottaBorder: '#F2C9B8',
  sageSoft: '#DDE4D6', sage: '#A8B5A0',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
  amber: '#D49542', amberSoft: '#F5E4C9',
};

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Icons ───────────────────────────────────────────────────
function IShield() {
  return (
    <Svg width={11} height={13} viewBox="0 0 12 13" fill="none">
      <Path d="M6 1L1 3.5v3C1 9.5 3.5 12 6 13c2.5-1 5-3.5 5-6.5v-3L6 1z" stroke={C.terracotta} strokeWidth={1.3} />
    </Svg>
  );
}
function IPulse({ color = C.forest }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 22 20" fill="none">
      <Path d="M1 10h4l2-7 4 14 3-9 2 3h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IPill({ color = C.forest }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 22 22" fill="none">
      <Rect x={1} y={7} width={20} height={8} rx={4} stroke={color} strokeWidth={1.8} />
      <Path d="M11 7v8" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function ICal({ color = C.forest }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Rect x={1} y={3.5} width={18} height={15} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M1 8h18M6 1v3M14 1v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IDoc({ color = C.forest }) {
  return (
    <Svg width={16} height={18} viewBox="0 0 18 22" fill="none">
      <Path d="M2 1h10l5 5v15H2V1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 1v5h5" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function IActivity({ color = C.forest }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M11 5v6l4 2.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ITeam({ color = C.forest }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 22 18" fill="none">
      <Circle cx={7} cy={6} r={3.5} stroke={color} strokeWidth={1.7} />
      <Path d="M1 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx={16} cy={7} r={3} stroke={color} strokeWidth={1.7} />
      <Path d="M13 17c0-2.5 1.5-4 3-4s3 1.5 3 4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}
function IVisit({ color = C.forest }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 16 16" fill="none">
      <Path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={13} cy={7} r={1.5} stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}
function IChevR({ color = C.muted }) {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IWarn() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path d="M7 1l6 11H1L7 1z" fill="#fff" />
      <Rect x={6.4} y={5} width={1.2} height={4} fill={C.terracotta} />
      <Circle cx={7} cy={10.5} r={0.7} fill={C.terracotta} />
    </Svg>
  );
}
function IArrowUp({ color }) {
  return <Svg width={10} height={10} viewBox="0 0 10 10"><Path d="M5 1l4 5H1l4-5z" fill={color} /></Svg>;
}
function IArrowDown({ color }) {
  return <Svg width={10} height={10} viewBox="0 0 10 10"><Path d="M5 9L1 4h8L5 9z" fill={color} /></Svg>;
}

// ─── Parse permissions ───────────────────────────────────────
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

// ─── Person hero card (stacked/fanned style) ─────────────────
function PersonCard({ person, isActive, onPress, offsetIdx }) {
  const toneA = person._toneA || '#3F5D54';
  const toneB = person._toneB || '#2E4942';
  const scale = isActive ? 1 : 0.92;
  const translateY = isActive ? 0 : 14;
  const rotate = isActive ? '0deg' : offsetIdx < 0 ? '-10deg' : '10deg';
  const opacity = isActive ? 1 : 0.55;

  const allergies = person.allergies
    ? (typeof person.allergies === 'string' ? person.allergies.split(',').map(s => s.trim()) : person.allergies)
    : [];
  const conditions = person.conditions
    ? (typeof person.conditions === 'string' ? person.conditions.split(',').map(s => s.trim()) : person.conditions)
    : [];

  return (
    <TouchableOpacity
      disabled={isActive}
      onPress={onPress}
      style={[
        ph.cardWrap,
        {
          transform: [{ scale }, { translateY }, { rotate }],
          zIndex: isActive ? 2 : 1,
          opacity,
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={ph.card}>
        {/* Counter */}
        <Text style={ph.counter}>{person._idx}</Text>

        {/* Portrait stripe */}
        <View style={[ph.portrait, { background: undefined }]}>
          <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12 }]}>
            {/* Diagonal stripe background */}
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: 300, height: 16,
                  backgroundColor: i % 2 === 0 ? toneA : toneB,
                  top: (i - 2) * 16,
                  left: -50,
                  transform: [{ rotate: '135deg' }],
                }}
              />
            ))}
          </View>
          <View style={ph.portraitInitials}>
            <Text style={ph.portraitInitialsText}>{person._initials}</Text>
          </View>
          {/* Decorative rings */}
          <Svg width={70} height={70} viewBox="0 0 80 80" style={{ position: 'absolute', right: -12, top: -12, opacity: 0.18 }}>
            <Circle cx={40} cy={40} r={38} stroke="#fff" strokeWidth={1} fill="none" />
            <Circle cx={40} cy={40} r={24} stroke="#fff" strokeWidth={1} fill="none" />
          </Svg>
        </View>

        {/* Name & stats */}
        <View style={{ marginTop: 8 }}>
          <Text style={ph.name}>{person.name}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
            {!!person.date_of_birth && (
              <Text style={ph.stat}>{new Date().getFullYear() - new Date(person.date_of_birth).getFullYear()} yrs</Text>
            )}
            {!!person.blood_type && <Text style={ph.stat}>· {person.blood_type}</Text>}
            {!!person.weight_kg && <Text style={ph.stat}>· {person.weight_kg}kg</Text>}
          </View>
        </View>

        {/* Condition + allergy chips */}
        {(conditions.length > 0 || allergies.length > 0) && (
          <View style={{ marginTop: 6, gap: 4 }}>
            {conditions.length > 0 && (
              <View style={ph.chipRow}>
                <Text style={ph.chipLabel}>Cond</Text>
                {conditions.slice(0, 2).map((c, i) => (
                  <View key={i} style={[ph.chip, { backgroundColor: C.sageSoft }]}>
                    <Text style={[ph.chipText, { color: '#2E4942' }]} numberOfLines={1}>{c}</Text>
                  </View>
                ))}
                {conditions.length > 2 && <Text style={ph.chipMore}>+{conditions.length - 2}</Text>}
              </View>
            )}
            {allergies.length > 0 && (
              <View style={ph.chipRow}>
                <Text style={[ph.chipLabel, { color: C.terracotta }]}>Allg</Text>
                {allergies.slice(0, 2).map((a, i) => (
                  <View key={i} style={[ph.chip, { backgroundColor: C.terracottaSoft }]}>
                    <Text style={[ph.chipText, { color: C.terracotta }]} numberOfLines={1}>{a}</Text>
                  </View>
                ))}
                {allergies.length > 2 && <Text style={ph.chipMore}>+{allergies.length - 2}</Text>}
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Vital chip ──────────────────────────────────────────────
function VitalChip({ vital }) {
  const flag = vital.flag || 'normal';
  const config =
    flag === 'high' ? { bg: C.terracottaSoft, rail: C.terracotta, label: 'HIGH', icon: <IArrowUp color={C.terracotta} /> } :
    flag === 'low'  ? { bg: C.amberSoft,      rail: C.amber,     label: 'LOW',  icon: <IArrowDown color={C.amber} /> } :
                      { bg: C.sageSoft,         rail: C.sage,      label: 'OK',   icon: null };

  return (
    <View style={[vc.vitalCard, { flex: 1 }]}>
      <View style={[vc.vitalRail, { backgroundColor: config.rail }]} />
      <View style={{ paddingLeft: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={vc.vitalLabel}>{vital.label}</Text>
          {flag !== 'normal' && (
            <View style={[vc.vitalBadge, { backgroundColor: config.bg }]}>
              {config.icon}
              <Text style={[vc.vitalBadgeText, { color: config.rail }]}>{config.label}</Text>
            </View>
          )}
        </View>
        <Text style={vc.vitalValue}>{vital.value}</Text>
        <Text style={vc.vitalUnit}>{vital.unit}</Text>
        {!!vital.detail && <Text style={vc.vitalDetail}>{vital.detail}</Text>}
      </View>
    </View>
  );
}

// ─── Interaction row ─────────────────────────────────────────
function InteractionRow({ ix, isLast }) {
  const sev =
    ix.severity === 'major'    ? { bg: C.terracottaSoft, dot: C.terracotta, label: 'MAJOR' } :
    ix.severity === 'moderate' ? { bg: C.amberSoft,      dot: C.amber,     label: 'MODERATE' } :
                                  { bg: C.sageSoft,        dot: C.sage,      label: 'MINOR' };
  return (
    <View style={[vc.row, !isLast && vc.rowBorder]}>
      <View style={[vc.interactIcon, { backgroundColor: sev.dot }]}>
        <IWarn />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={vc.interactDrug}>{ix.a}</Text>
          <Text style={{ fontSize: 11, color: C.mutedSoft }}>×</Text>
          <Text style={vc.interactDrug}>{ix.b}</Text>
          <View style={[vc.severityTag, { backgroundColor: sev.bg }]}>
            <Text style={[vc.severityTagText, { color: sev.dot }]}>{sev.label}</Text>
          </View>
        </View>
        {!!ix.why && (
          <Text style={vc.interactWhy} numberOfLines={3}>{ix.why}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Quick tile ──────────────────────────────────────────────
function QuickTile({ icon: Icon, label, sub, accent, badge, onPress }) {
  return (
    <TouchableOpacity style={vc.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={[vc.tileIcon, { backgroundColor: accent ? C.terracottaSoft : C.cream }]}>
        <Icon color={accent ? C.terracotta : C.forest} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={vc.tileLabel}>{label}</Text>
          {badge && <View style={vc.tileDot} />}
        </View>
        <Text style={vc.tileSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section header ──────────────────────────────────────────
function SectionHead({ title, count, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, marginTop: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={vc.sectionTitle}>{title}</Text>
        {count != null && (
          <Text style={vc.sectionCount}>{String(count).padStart(2, '0')}</Text>
        )}
      </View>
      {!!action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={vc.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Appointment row ─────────────────────────────────────────
function ApptRow({ a, isLast }) {
  const dateParts = a.appointment_date ? a.appointment_date.split('-') : [];
  const day = dateParts[2] || '';
  const monthName = a.appointment_date
    ? new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short' })
    : '';
  return (
    <View style={[vc.row, !isLast && vc.rowBorder, { alignItems: 'center' }]}>
      <View style={vc.apptDate}>
        <Text style={vc.apptDay}>{new Date(a.appointment_date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Text>
        <Text style={vc.apptNum}>{day}</Text>
        <Text style={vc.apptMonth}>{monthName}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={vc.apptTitle}>{a.title || 'Appointment'}</Text>
        <Text style={vc.apptMeta}>
          {a.time
            ? (() => { const h = parseInt(a.time, 10); const m = a.time.split(':')[1] || '00'; return `${h > 12 ? h - 12 : h}:${m} ${h < 12 ? 'AM' : 'PM'}`; })()
            : ''}
          {a.location ? ` · ${a.location}` : ''}
        </Text>
      </View>
      <IChevR />
    </View>
  );
}

// ─── Med row ─────────────────────────────────────────────────
function MedRow({ med, isLast }) {
  const colors = ['#3F5D54', '#C66E4E', '#7A5A3F', '#A8B5A0', '#1F3D38'];
  const tint = colors[med.name?.charCodeAt(0) % colors.length] || '#3F5D54';
  return (
    <View style={[vc.row, !isLast && vc.rowBorder, { alignItems: 'center' }]}>
      <View style={[vc.medIcon, { backgroundColor: tint }]}>
        <Text style={vc.medIconText}>{(med.name || '?')[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={vc.medName}>{med.name}</Text>
          {!!med.dose && <Text style={vc.medDose}>{med.dose}</Text>}
        </View>
        {!!med.instructions && <Text style={vc.medFreq}>{med.instructions}</Text>}
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────
export default function CaregiverPeopleScreen({ navigation }) {
  const [persons, setPersons]   = useState([]);
  const [permMap, setPermMap]   = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [vitals, setVitals]     = useState([]);
  const [meds, setMeds]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [activity, setActivity] = useState([]);

  const toneMap = [
    ['#3F5D54', '#2E4942'],
    ['#C66E4E', '#B05E40'],
    ['#7A5A3F', '#6A4A32'],
  ];

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
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
        const enriched = (ps || []).map((p, i) => ({
          ...p,
          _initials: (p.name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase(),
          _idx: String(i + 1).padStart(2, '0') + ' / ' + String((ps || []).length).padStart(2, '0'),
          _toneA: toneMap[i % toneMap.length][0],
          _toneB: toneMap[i % toneMap.length][1],
        }));
        setPersons(enriched);
      } else {
        setPersons([]);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Load detail data for active person
  useEffect(() => {
    const person = persons[activeIdx];
    if (!person) { setVitals([]); setMeds([]); setAppointments([]); setInteractions([]); setActivity([]); return; }
    const today = new Date().toISOString().split('T')[0];
    (async () => {
      await Promise.allSettled([
        supabase.from('vitals').select('*').eq('person_id', person.id).order('recorded_at', { ascending: false }).limit(10)
          .then(({ data }) => {
            // Group by type and pick latest
            const latest = {};
            (data || []).forEach(v => { if (!latest[v.vital_type]) latest[v.vital_type] = v; });
            setVitals(Object.values(latest).map(v => ({
              label: v.vital_type,
              value: v.value,
              unit: v.unit || '',
              flag: v.flag || 'normal',
              detail: v.recorded_at ? new Date(v.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
            })));
          }).catch(() => setVitals([])),
        supabase.from('medications').select('*').eq('person_id', person.id).eq('active', true)
          .then(({ data }) => setMeds(data || [])).catch(() => setMeds([])),
        supabase.from('appointments').select('*').eq('person_id', person.id).gte('appointment_date', today).order('appointment_date').limit(5)
          .then(({ data }) => setAppointments(data || [])).catch(() => setAppointments([])),
        supabase.from('medication_interactions').select('*').eq('person_id', person.id)
          .then(({ data }) => setInteractions(data || [])).catch(() => setInteractions([])),
        supabase.from('activity_log').select('*').eq('person_id', person.id).order('created_at', { ascending: false }).limit(10)
          .then(({ data }) => setActivity(data || [])).catch(() => setActivity([])),
      ]);
    })();
  }, [persons, activeIdx]);

  const active = persons[activeIdx];
  const perms = active ? (permMap[active.id] || parsePerms(null)) : parsePerms(null);
  const flaggedVitals = vitals.filter(v => v.flag !== 'normal').length;
  const majorIx = interactions.filter(i => i.severity === 'major').length;
  const allergies = active?.allergies
    ? (typeof active.allergies === 'string' ? active.allergies.split(',').map(s => s.trim()) : active.allergies)
    : [];

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.modeStrip} />

      {/* Top bar */}
      <View style={st.topBar}>
        <View>
          <View style={st.modeTag}>
            <IShield />
            <Text style={st.modeTagText}>CAREGIVER MODE</Text>
          </View>
          <Text style={st.title}>My people</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : persons.length === 0 ? (
        <View style={st.emptyWrap}>
          <Text style={st.emptyTitle}>No people assigned</Text>
          <Text style={st.emptySub}>
            When a family assigns you to a care recipient, they'll appear here.
          </Text>
          <TouchableOpacity
            style={st.emptyBtn}
            onPress={() => navigation.navigate('CaregiverNotifications')}
          >
            <Text style={st.emptyBtnText}>Check notifications</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Person chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4, gap: 8, flexDirection: 'row' }}
          >
            {persons.map((p, i) => {
              const isActive = i === activeIdx;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setActiveIdx(i)}
                  style={[st.chip, isActive && st.chipActive]}
                >
                  <View style={[st.chipInit, { backgroundColor: p._toneA }]}>
                    <Text style={st.chipInitText}>{p._initials[0]}</Text>
                  </View>
                  <View>
                    <Text style={[st.chipName, isActive && { color: '#fff' }]}>{p.name?.split(' ')[0]}</Text>
                    {!!p.relationship && (
                      <Text style={[st.chipRel, isActive && { color: 'rgba(255,255,255,0.65)' }]}>
                        {p.relationship}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Stacked hero cards */}
          {active && (
            <View style={st.cardDeck}>
              {persons.length > 1 &&
                persons
                  .filter((_, i) => i !== activeIdx)
                  .slice(0, 2)
                  .map((p, i) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      isActive={false}
                      offsetIdx={i === 0 ? -1 : 1}
                      onPress={() => setActiveIdx(persons.findIndex(pp => pp.id === p.id))}
                    />
                  ))
              }
              <PersonCard
                person={active}
                isActive
                offsetIdx={0}
                onPress={() => {}}
              />
            </View>
          )}

          {active && (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Attention banner */}
              {(flaggedVitals > 0 || majorIx > 0) && (
                <View style={st.alertBanner}>
                  <View style={st.alertIcon}>
                    <IWarn />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.alertText}>
                      <Text style={{ fontWeight: '700' }}>{active.name?.split(' ')[0]} needs attention. </Text>
                      {flaggedVitals > 0 && `${flaggedVitals} flagged reading${flaggedVitals > 1 ? 's' : ''}`}
                      {flaggedVitals > 0 && majorIx > 0 && ', '}
                      {majorIx > 0 && `${majorIx} major interaction${majorIx > 1 ? 's' : ''}`}
                      .
                    </Text>
                  </View>
                </View>
              )}

              {/* Quick access tiles */}
              <SectionHead title="Care details" />
              <View style={st.tileGrid}>
                <QuickTile
                  icon={IVisit}
                  label="Visit"
                  sub="Start session"
                  onPress={() => navigation.navigate('CaregiverVisit', { personId: active.id, personName: active.name })}
                />
                {perms.vitals?.view && (
                  <QuickTile
                    icon={IPulse}
                    label="Vitals"
                    sub={flaggedVitals > 0 ? `${flaggedVitals} flagged` : 'All normal'}
                    accent={flaggedVitals > 0}
                    badge={flaggedVitals > 0}
                    onPress={() => perms.vitals.contribute
                      ? navigation.navigate('CaregiverVitalsLog', { personId: active.id })
                      : navigation.navigate('VitalsHistory', { personId: active.id, personName: active.name })}
                  />
                )}
                {perms.medications?.view && (
                  <QuickTile
                    icon={IPill}
                    label="Medications"
                    sub={`${meds.length} active`}
                    badge={majorIx > 0}
                    onPress={() => navigation.navigate('Medications', { personId: active.id })}
                  />
                )}
                {perms.appointments?.view && (
                  <QuickTile
                    icon={ICal}
                    label="Appointments"
                    sub={`${appointments.length} upcoming`}
                    onPress={() => navigation.navigate('AppointmentsScreen', { personId: active.id, personName: active.name })}
                  />
                )}
                {perms.reports?.view && (
                  <QuickTile
                    icon={IDoc}
                    label="Documents"
                    sub={perms.reports.contribute ? 'View & upload' : 'View only'}
                    onPress={() => navigation.navigate('DocsHome', { personId: active.id })}
                  />
                )}
                {perms.activity?.view && (
                  <QuickTile
                    icon={IActivity}
                    label="Activity"
                    sub={activity.length > 0 ? `${activity.length} recent` : 'No activity'}
                    onPress={() => navigation.navigate('ActivityFeed', { personId: active.id })}
                  />
                )}
                <QuickTile
                  icon={ITeam}
                  label="Care team"
                  sub="Doctors & contacts"
                  onPress={() => navigation.navigate('CareTeam', { personId: active.id, personName: active.name })}
                />
                {perms.activity?.contribute && (
                  <QuickTile
                    icon={({ color }) => (
                      <Svg width={18} height={18} viewBox="0 0 18 22" fill="none">
                        <Path d="M2 1h10l5 5v15H2V1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
                        <Path d="M12 1v5h5M6 11h6M6 15h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
                      </Svg>
                    )}
                    label="Visit note"
                    sub="Add note"
                    onPress={() => navigation.navigate('CaregiverVisitNote', { personId: active.id })}
                  />
                )}
              </View>

              {/* Vitals at-a-glance */}
              {perms.vitals?.view && vitals.length > 0 && (
                <>
                  <SectionHead
                    title="Vitals"
                    count={vitals.length}
                    action={perms.vitals.contribute ? '+ Log' : 'View all →'}
                    onAction={() => perms.vitals.contribute
                      ? navigation.navigate('CaregiverVitalsLog', { personId: active.id })
                      : navigation.navigate('VitalsHistory', { personId: active.id, personName: active.name })}
                  />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {vitals.slice(0, 4).map((v, i) => (
                      <VitalChip key={i} vital={v} />
                    ))}
                  </View>
                </>
              )}

              {/* Interaction watch */}
              {perms.medications?.view && interactions.length > 0 && (
                <>
                  <SectionHead title="Interaction watch" count={interactions.length} />
                  <View style={st.card}>
                    {interactions.map((ix, i) => (
                      <InteractionRow key={ix.id || i} ix={ix} isLast={i === interactions.length - 1} />
                    ))}
                  </View>
                </>
              )}

              {/* Active medications */}
              {perms.medications?.view && meds.length > 0 && (
                <>
                  <SectionHead
                    title="Medications"
                    count={meds.length}
                    action="All meds →"
                    onAction={() => navigation.navigate('Medications', { personId: active.id })}
                  />
                  <View style={st.card}>
                    {meds.slice(0, 5).map((m, i) => (
                      <MedRow key={m.id || i} med={m} isLast={i === Math.min(meds.length, 5) - 1} />
                    ))}
                  </View>
                </>
              )}

              {/* Upcoming appointments */}
              {perms.appointments?.view && appointments.length > 0 && (
                <>
                  <SectionHead
                    title="Appointments"
                    count={appointments.length}
                    action="All →"
                    onAction={() => navigation.navigate('AppointmentsScreen', { personId: active.id, personName: active.name })}
                  />
                  <View style={st.card}>
                    {appointments.slice(0, 3).map((a, i) => (
                      <ApptRow key={a.id || i} a={a} isLast={i === Math.min(appointments.length, 3) - 1} />
                    ))}
                  </View>
                </>
              )}

              {/* Allergies reminder */}
              {allergies.length > 0 && (
                <>
                  <SectionHead title="Allergy alert" />
                  <View style={st.allergyCard}>
                    <View style={st.allergyIcon}>
                      <IWarn />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.allergyLabel}>KNOWN ALLERGIES</Text>
                      <Text style={st.allergyText}>{allergies.join(' · ')}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <CaregiverTabBar active={1} navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── Profile card styles ─────────────────────────────────────
const CARD_W = Math.min(SCREEN_W - 80, 230);
const CARD_H = CARD_W * 1.44;

const ph = StyleSheet.create({
  cardWrap: {
    position: 'absolute',
    width: CARD_W, height: CARD_H,
    left: '50%',
    marginLeft: -CARD_W / 2,
  },
  card: {
    width: CARD_W, height: CARD_H,
    borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E8E0D2',
    padding: 12,
    shadowColor: '#1F3D38',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },
  counter: { fontSize: 9.5, color: '#9A968F', letterSpacing: 0.5, fontFamily: 'monospace' },
  portrait: {
    flex: 1, marginTop: 8, borderRadius: 12,
    overflow: 'hidden', justifyContent: 'flex-end', padding: 10, minHeight: 80,
    backgroundColor: '#3F5D54',
  },
  portraitInitials: {},
  portraitInitialsText: { fontFamily: 'Georgia', fontSize: 30, color: '#fff', fontWeight: '400', letterSpacing: -1, lineHeight: 34, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  name: { fontFamily: 'Georgia', fontSize: 15.5, color: '#15302C', fontWeight: '500', letterSpacing: -0.3, marginTop: 2 },
  stat: { fontSize: 9.5, color: '#9A968F', letterSpacing: 0.2 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 3, minHeight: 18 },
  chipLabel: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: '#9A968F', width: 24, fontFamily: 'monospace' },
  chip: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, flexShrink: 0, maxWidth: 80 },
  chipText: { fontSize: 9.5, fontWeight: '600', letterSpacing: 0.1 },
  chipMore: { fontSize: 9.5, fontWeight: '600', color: '#9A968F', paddingHorizontal: 4 },
});

// ─── Detail card styles ──────────────────────────────────────
const vc = StyleSheet.create({
  vitalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E8E0D2', overflow: 'hidden', position: 'relative' },
  vitalRail: { position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, borderRadius: 99 },
  vitalLabel: { fontSize: 10.5, color: '#6B6862', letterSpacing: 0.4, textTransform: 'uppercase' },
  vitalBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  vitalBadgeText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 },
  vitalValue: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '500', color: '#15302C', letterSpacing: -0.4, lineHeight: 26, marginTop: 4 },
  vitalUnit: { fontSize: 10, color: '#9A968F', marginTop: 1 },
  vitalDetail: { fontSize: 10.5, color: '#9A968F', marginTop: 3 },

  tile: { width: '31%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E8E0D2', padding: 13, minHeight: 90, justifyContent: 'space-between' },
  tileIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileLabel: { fontSize: 13, fontWeight: '600', color: '#1A1F1D' },
  tileSub: { fontSize: 10, color: '#6B6862', marginTop: 2 },
  tileDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#C66E4E' },

  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: '#15302C', fontWeight: '500', letterSpacing: -0.3 },
  sectionCount: { fontSize: 11, color: '#9A968F', letterSpacing: 0.4, fontFamily: 'monospace' },
  sectionAction: { fontSize: 12, color: '#1F3D38', fontWeight: '500' },

  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E8E0D2', overflow: 'hidden' },
  row: { padding: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#EFE8DA' },

  interactIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  interactDrug: { fontSize: 13.5, fontWeight: '600', color: '#1A1F1D', letterSpacing: -0.1 },
  interactWhy: { fontSize: 12, color: '#6B6862', lineHeight: 17, marginTop: 4 },
  severityTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  severityTagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  apptDate: { width: 46, alignItems: 'center', paddingVertical: 4, borderRadius: 10, backgroundColor: '#F6F1EA', borderWidth: 1, borderColor: '#EFE8DA', flexShrink: 0 },
  apptDay: { fontSize: 9.5, color: '#9A968F', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '600' },
  apptNum: { fontFamily: 'Georgia', fontSize: 15, color: '#15302C', fontWeight: '500', lineHeight: 18, marginTop: 1 },
  apptMonth: { fontSize: 8.5, color: '#9A968F', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 1 },
  apptTitle: { fontSize: 13.5, fontWeight: '600', color: '#1A1F1D', letterSpacing: -0.1 },
  apptMeta: { fontSize: 11.5, color: '#6B6862', marginTop: 4, lineHeight: 15 },

  medIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  medIconText: { fontFamily: 'Georgia', fontSize: 13, color: '#fff', fontWeight: '500' },
  medName: { fontSize: 14, fontWeight: '600', color: '#1A1F1D', letterSpacing: -0.1 },
  medDose: { fontSize: 11.5, color: '#6B6862' },
  medFreq: { fontSize: 11.5, color: '#9A968F', marginTop: 1 },
});

// ─── Screen styles ───────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  modeStrip: { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14 },
  modeTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTagText: { fontSize: 10, color: C.terracotta, letterSpacing: 0.6, fontWeight: '700' },
  title: { fontFamily: 'Georgia', fontSize: 26, color: C.forestDeep, fontWeight: '400', marginTop: 4 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, fontWeight: '500', textAlign: 'center' },
  emptySub: { marginTop: 8, fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 20, height: 44, paddingHorizontal: 22, borderRadius: 14, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  emptyBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '600' },

  chip: { height: 40, paddingHorizontal: 12, paddingLeft: 4, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  chipInit: { width: 30, height: 30, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  chipInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 12, fontWeight: '500' },
  chipName: { fontSize: 13, fontWeight: '500', color: C.ink },
  chipRel: { fontSize: 9.5, color: C.mutedSoft, letterSpacing: 0.2, marginTop: 1 },

  cardDeck: {
    height: CARD_H + 30, position: 'relative',
    marginTop: 16, marginHorizontal: 20,
  },

  alertBanner: {
    backgroundColor: C.forestDeep, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4,
  },
  alertIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertText: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },

  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },

  allergyCard: { backgroundColor: C.terracottaSoft, borderRadius: 14, borderWidth: 1, borderColor: C.terracottaBorder, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  allergyIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  allergyLabel: { fontSize: 9.5, color: '#7A3F2A', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' },
  allergyText: { fontSize: 13, color: '#5C2A1F', fontWeight: '600', marginTop: 2, lineHeight: 18 },
});
