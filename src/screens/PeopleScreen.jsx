import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path, Rect, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme';
import TabBar from '../components/TabBar';
import { supabase } from '../lib/supabase';
import { detectInteractions, detectConditionInteractions, mergeInteractions } from '../lib/interactions';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconPlus({ color = colors.muted }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 14 14">
      <Path d="M7 1v12M1 7h12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
function IconDots({ color = colors.ink }) {
  return (
    <Svg width="22" height="6" viewBox="0 0 22 6">
      <Circle cx="3" cy="3" r="2" fill={color} />
      <Circle cx="11" cy="3" r="2" fill={color} />
      <Circle cx="19" cy="3" r="2" fill={color} />
    </Svg>
  );
}
function IconWarn({ color = '#fff' }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 14 14">
      <Path d="M7 1l6 11H1L7 1z" fill={colors.terracotta} />
      <Rect x="6.4" y="5" width="1.2" height="4" fill={color} />
      <Circle cx="7" cy="10.5" r="0.7" fill={color} />
    </Svg>
  );
}
function IconPulse({ color = colors.forest }) {
  return (
    <Svg width="22" height="20" viewBox="0 0 22 20" fill="none">
      <Path d="M1 10h4l2-7 4 14 3-9 2 3h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconPill({ color = colors.forest }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <Rect x="1" y="7" width="20" height="8" rx="4" stroke={color} strokeWidth="1.8" />
      <Path d="M11 7v8" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}
function IconCal({ color = colors.forest }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Rect x="1" y="3.5" width="18" height="15" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M1 8h18M6 1v3M14 1v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
function IconDoc({ color = colors.forest }) {
  return (
    <Svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <Path d="M2 1h10l5 5v15H2V1z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <Path d="M12 1v5h5" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}
function IconClock({ color = colors.forest }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="9" stroke={color} strokeWidth="1.8" />
      <Path d="M11 5v6l4 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
function IconPeople({ color = colors.forest }) {
  return (
    <Svg width="22" height="18" viewBox="0 0 22 18" fill="none">
      <Circle cx="7" cy="6" r="3.5" stroke={color} strokeWidth="1.7" />
      <Path d="M1 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <Circle cx="16" cy="7" r="3" stroke={color} strokeWidth="1.7" />
      <Path d="M13 17c0-2.5 1.5-4 3-4s3 1.5 3 4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Flag helpers ─────────────────────────────────────────────────────────────

const VITAL_RANGES = {
  bp:    { highSys: 140, highDia: 90, lowSys: 90, lowDia: 60 },
  sugar: { low: 4, high: 7.8 },
  hr:    { low: 50, high: 100 },
  spo2:  { low: 94, high: 100 },
  temp:  { low: 36, high: 37.5 },
};

function getVitalFlag(type, value) {
  const ranges = VITAL_RANGES[type];
  if (!ranges) return 'normal';
  if (type === 'bp') {
    if (!value || !value.includes('/')) return 'normal';
    const [s, d] = value.split('/').map(parseFloat);
    if (isNaN(s) || isNaN(d)) return 'normal';
    if (s >= ranges.highSys || d >= ranges.highDia) return 'high';
    if (s < ranges.lowSys || d < ranges.lowDia) return 'low';
    return 'normal';
  }
  const n = parseFloat(value);
  if (isNaN(n)) return 'normal';
  if (n > ranges.high) return 'high';
  if (n < ranges.low) return 'low';
  return 'normal';
}

const VITAL_META = {
  bp:     { label: 'Blood pressure', unit: 'mmHg',   tone: '#C66E4E' },
  sugar:  { label: 'Blood sugar',    unit: 'mmol/L', tone: '#3F5D54' },
  hr:     { label: 'Heart rate',     unit: 'bpm',    tone: '#7A5A3F' },
  weight: { label: 'Weight',         unit: 'kg',     tone: '#A8B5A0' },
  spo2:   { label: 'SpO₂',           unit: '%',      tone: '#3F5D54' },
  temp:   { label: 'Temperature',    unit: '°C',     tone: '#C66E4E' },
};

// ─── Components ───────────────────────────────────────────────────────────────

function VitalChip({ vital }) {
  const flag = getVitalFlag(vital.type, vital.value);
  const tone =
    flag === 'high' ? { bg: '#FBE3D9', rail: colors.terracotta, label: 'HIGH',   labelFg: colors.terracotta } :
    flag === 'low'  ? { bg: '#FBE7D0', rail: '#D49542',          label: 'LOW',    labelFg: '#D49542' } :
                      { bg: colors.sageSoft, rail: colors.sage,  label: 'OK',     labelFg: colors.forest };
  const meta = VITAL_META[vital.type] || {};
  const timeAgo = vital.recorded_at ? relativeTime(vital.recorded_at) : '';

  return (
    <View style={styles.vitalChip}>
      <View style={[styles.vitalChipRail, { backgroundColor: tone.rail }]} />
      <View style={{ paddingLeft: 10, flex: 1 }}>
        <View style={styles.vitalChipTop}>
          <Text style={styles.vitalChipLabel}>{meta.label || vital.type}</Text>
          {flag !== 'normal' && (
            <View style={[styles.flagPill, { backgroundColor: tone.bg }]}>
              <Text style={[styles.flagPillText, { color: tone.labelFg }]}>{tone.label}</Text>
            </View>
          )}
        </View>
        <View style={styles.vitalValueRow}>
          <Text style={styles.vitalValue}>{vital.value}</Text>
          <Text style={styles.vitalUnit}> {meta.unit}</Text>
        </View>
        <Text style={styles.vitalTime}>{timeAgo}</Text>
      </View>
    </View>
  );
}

function QuickTile({ label, sub, onPress, icon: Icon, accent, badge }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.tileIcon, accent && { backgroundColor: '#FBE3D9' }]}>
        {Icon ? <Icon color={accent ? colors.terracotta : colors.forest} /> : null}
      </View>
      <View>
        <View style={styles.tileLabelRow}>
          <Text style={styles.tileLabel}>{label}</Text>
          {badge && <View style={styles.tileBadge} />}
        </View>
        <Text style={styles.tileSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Icon helpers inside card ─────────────────────────────
function ICardPill() {
  return (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Rect x="1" y="4" width="12" height="6" rx="3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
      <Path d="M7 4v6" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
    </Svg>
  );
}
function ICardHeart() {
  return (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M7 12S2 9 2 5a2.8 2.8 0 015-1.7A2.8 2.8 0 0112 5c0 4-5 7-5 7z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  );
}
function ICardWarn({ hasAllergies }) {
  const c = hasAllergies ? '#fff' : 'rgba(255,255,255,0.85)';
  return (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M7 1l6 11H1L7 1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      <Rect x="6.4" y="5" width="1.2" height="4" fill={c} />
      <Circle cx="7" cy="10.5" r="0.7" fill={c} />
    </Svg>
  );
}

function RecipientCard({ person, meds, conditions, allergies, onPress }) {
  const age = person.date_of_birth
    ? Math.floor((Date.now() - new Date(person.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  const isTerra = (person.tone === 'terra') || (person.relationship || '').toLowerCase().includes('mother') || (person.relationship || '').toLowerCase().includes('wife') || (person.relationship || '').toLowerCase().includes('spouse');
  const stripeLight = isTerra ? '#C66E4E' : '#A8B5A0';
  const stripeDark  = isTerra ? '#B05E40' : '#94A38D';
  const displayName = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
  const portrait = person.relationship || displayName.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <TouchableOpacity style={rc.card} onPress={onPress} activeOpacity={0.85}>
      {/* Faint ring decoration */}
      <Svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', right: -50, top: -50, opacity: 0.08 }}>
        <Circle cx="90" cy="90" r="85" stroke="#fff" strokeWidth="1" fill="none" />
        <Circle cx="90" cy="90" r="55" stroke="#fff" strokeWidth="1" fill="none" />
        <Circle cx="90" cy="90" r="25" stroke="#fff" strokeWidth="1" fill="none" />
      </Svg>

      {/* Top row: portrait square + name */}
      <View style={rc.topRow}>
        {/* 56×56 striped portrait */}
        <View style={[rc.portrait, { backgroundColor: stripeLight }]}>
          {/* SVG diagonal stripe overlay */}
          <Svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute', top: 0, left: 0 }}>
            {[...Array(10)].map((_, i) => (
              <Path
                key={i}
                d={`M${i * 12 - 28} 0 L${i * 12 - 16} 56`}
                stroke={stripeDark}
                strokeWidth="6"
                opacity="0.5"
              />
            ))}
          </Svg>
          <Text style={rc.portraitLabel}>{portrait.toLowerCase()}</Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={rc.relLabel}>
            {person.relationship ? person.relationship.toUpperCase() : 'PERSON'}
            {age != null ? `  ·  ${age}` : ''}
          </Text>
          <Text style={rc.name} numberOfLines={2}>{displayName}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={rc.divider} />

      {/* Medications row */}
      <View style={rc.row}>
        <View style={[rc.iconBadge]}>
          <ICardPill />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rc.rowLabel}>MEDICATIONS</Text>
          <Text style={rc.rowValue}>
            {meds.length === 0 ? 'None recorded' : `${meds.length} active`}
          </Text>
        </View>
      </View>

      {/* Conditions row */}
      <View style={rc.row}>
        <View style={[rc.iconBadge, { marginTop: 2 }]}>
          <ICardHeart />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rc.rowLabel}>CONDITIONS</Text>
          {conditions.length > 0 ? (
            <View style={rc.chipsRow}>
              {conditions.slice(0, 4).map((c, i) => (
                <View key={i} style={rc.chip}>
                  <Text style={rc.chipText}>{c.name || c.condition_name || c.title}</Text>
                </View>
              ))}
              {conditions.length > 4 && (
                <View style={rc.chip}>
                  <Text style={rc.chipText}>+{conditions.length - 4}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={rc.rowNone}>None recorded</Text>
          )}
        </View>
      </View>

      {/* Allergies row */}
      <View style={rc.row}>
        <View style={[rc.iconBadge, allergies.length > 0 && { backgroundColor: 'rgba(198,110,78,0.35)' }, { marginTop: 2 }]}>
          <ICardWarn hasAllergies={allergies.length > 0} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rc.rowLabel}>ALLERGIES</Text>
          {allergies.length > 0 ? (
            <View style={rc.chipsRow}>
              {allergies.slice(0, 4).map((a, i) => (
                <View key={i} style={rc.chip}>
                  <Text style={rc.chipText}>{a.name || a.allergen}</Text>
                </View>
              ))}
              {allergies.length > 4 && (
                <View style={rc.chip}>
                  <Text style={rc.chipText}>+{allergies.length - 4}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={rc.rowNone}>None recorded</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PeopleScreen({ navigation }) {
  const [persons, setPersons] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [meds, setMeds] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vitals, setVitals] = useState([]);  // most recent per vital type (for alert banner)
  const [interactions, setInteractions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [careTeamCount, setCareTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: pp, error } = await supabase.from('persons').select('*').eq('user_id', user.id).order('created_at');
      if (error) console.error('[PeopleScreen] persons query error:', error);
      setPersons(pp || []);
    } catch (e) {
      console.error('[PeopleScreen] load error:', e);
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const active = persons[activeIdx];
    if (!active) return;
    (async () => {
      let fetchedMeds = [], fetchedConds = [];
      try { const { data } = await supabase.from('medications').select('*').eq('person_id', active.id); fetchedMeds = data || []; setMeds(fetchedMeds); } catch (_) { setMeds([]); }
      try { const { data } = await supabase.from('conditions').select('*').eq('person_id', active.id); fetchedConds = data || []; setConditions(fetchedConds); } catch (_) { setConditions([]); }
      try { const { data } = await supabase.from('allergies').select('*').eq('person_id', active.id); setAllergies(data || []); } catch (_) { setAllergies([]); }
      // Static interaction check (no API cost — used only for alert banner count)
      try {
        const ddIx = detectInteractions(fetchedMeds);
        const dcIx = detectConditionInteractions(fetchedMeds, fetchedConds);
        setInteractions(mergeInteractions(ddIx, dcIx));
      } catch (_) { setInteractions([]); }
      try {
        const now = new Date().toISOString();
        const { data } = await supabase.from('appointments').select('id, appointment_date').eq('person_id', active.id).gte('appointment_date', now);
        setAppointments(data || []);
      } catch (_) { setAppointments([]); }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count } = await supabase.from('caregiver_relationships').select('id', { count: 'exact', head: true }).eq('owner_id', user.id);
          setCareTeamCount(count ?? 0);
        }
      } catch (_) { setCareTeamCount(0); }
      try {
        // Get most recent reading per vital type
        const { data } = await supabase
          .from('vitals')
          .select('id, type, value, recorded_at')
          .eq('person_id', active.id)
          .order('recorded_at', { ascending: false })
          .limit(40);
        if (data) {
          const seen = new Set();
          const latest = data.filter(r => { if (seen.has(r.type)) return false; seen.add(r.type); return true; });
          setVitals(latest);
        }
      } catch (_) { setVitals([]); }
    })();
  }, [persons, activeIdx]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.forest} />
        </View>
      </SafeAreaView>
    );
  }

  const active = persons[activeIdx];
  const flaggedVitals = vitals.filter(v => getVitalFlag(v.type, v.value) !== 'normal');
  const majorInteractions = interactions.filter(ix => ix.sev === 'major');
  const hasAlert = flaggedVitals.length > 0 || majorInteractions.length > 0;
  const displayName = active ? (active.name || active.first_name || '') : '';

  // Build specific alert lines
  function buildAlertLines() {
    const lines = [];
    // Vitals
    for (const v of flaggedVitals) {
      const meta = VITAL_META[v.type];
      const flag = getVitalFlag(v.type, v.value);
      const label = meta?.label ?? v.type;
      lines.push(`${label} is ${flag} (${v.value}${meta?.unit ? ' ' + meta.unit : ''})`);
    }
    // Major drug interactions
    for (const ix of majorInteractions) {
      lines.push(`${ix.a} + ${ix.b} — ${ix.label}`);
    }
    // Moderate interactions (if no major ones and no vital flags, show these)
    if (lines.length === 0) {
      const mod = interactions.filter(ix => ix.sev === 'moderate');
      for (const ix of mod.slice(0, 2)) {
        lines.push(`${ix.a} + ${ix.b} — ${ix.label}`);
      }
    }
    return lines;
  }
  const alertLines = buildAlertLines();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.topTitle}>Dear Ones</Text>
        <TouchableOpacity style={styles.topBtn}>
          <IconDots />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Person chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personRow}>
          {persons.map((p, i) => {
            const isActive = i === activeIdx;
            const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
            const pName = p.name || p.first_name || '?';
            return (
              <TouchableOpacity key={p.id} onPress={() => setActiveIdx(i)} style={[styles.personChip, isActive && styles.personChipActive]}>
                <View style={[styles.personInit, { backgroundColor: tint }]}>
                  <Text style={styles.personInitText}>{pName[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[styles.personChipName, isActive && { color: '#fff' }]}>{pName}</Text>
                  <Text style={[styles.personChipRel, isActive && { color: 'rgba(255,255,255,0.65)' }]}>{p.relationship || ''}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addChip} onPress={() => navigation.navigate('AddPerson')}>
            <IconPlus color={colors.muted} />
          </TouchableOpacity>
        </ScrollView>

        {active && (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <RecipientCard
              person={active}
              meds={meds}
              conditions={conditions}
              allergies={allergies}
              onPress={() => navigation.navigate('Profile', { personId: active.id })}
            />
          </View>
        )}

        {/* Alert banner */}
        {active && hasAlert && (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <View style={styles.alertBanner}>
              <View style={styles.alertIcon}>
                <IconWarn color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertText, { fontWeight: '600', color: 'rgba(255,255,255,0.95)', marginBottom: 4 }]}>
                  {displayName} needs attention
                </Text>
                {alertLines.map((line, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: i === 0 ? 0 : 3 }}>
                    <Text style={{ color: majorInteractions.length > 0 || (flaggedVitals[i] && getVitalFlag(flaggedVitals[i]?.type, flaggedVitals[i]?.value) === 'high') ? '#F4A48A' : '#F0CC80', fontSize: 10, marginTop: 2 }}>●</Text>
                    <Text style={[styles.alertText, { color: 'rgba(255,255,255,0.75)', flex: 1 }]}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Care details */}
        {active && (
          <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
            <Text style={styles.sectionTitle}>Care details</Text>
            <View style={styles.grid}>
              <QuickTile
                label="Vitals"
                sub={flaggedVitals.length > 0
                  ? flaggedVitals.length === 1
                    ? `${(VITAL_META[flaggedVitals[0].type]?.label ?? flaggedVitals[0].type)} ${getVitalFlag(flaggedVitals[0].type, flaggedVitals[0].value)}`
                    : `${flaggedVitals.length} readings flagged`
                  : 'All normal'}
                onPress={() => navigation.navigate('VitalsHistory', { personId: active.id, personName: displayName })}
                icon={IconPulse}
                accent={flaggedVitals.length > 0}
                badge={flaggedVitals.length > 0}
              />
              <QuickTile
                label="Medications"
                sub={meds.length === 0 ? 'None added' : interactions.length > 0 ? `${meds.filter(m=>m.active).length} active · ${interactions.length} risk${interactions.length > 1 ? 's' : ''}` : `${meds.filter(m=>m.active).length} active`}
                onPress={() => navigation.navigate('Medications', { personId: active.id })}
                icon={IconPill}
                accent={majorInteractions.length > 0}
                badge={majorInteractions.length > 0}
              />
              <QuickTile
                label="Appointments"
                sub={appointments.length === 0 ? 'No upcoming' : `${appointments.length} upcoming`}
                onPress={() => navigation.navigate('AppointmentsScreen', { personId: active.id })}
                icon={IconCal}
              />
              <QuickTile
                label="Documents"
                sub="Filed records"
                onPress={() => navigation.navigate('DocsHome', { personId: active.id })}
                icon={IconDoc}
              />
              <QuickTile
                label="Activity"
                sub="Today's log"
                onPress={() => navigation.navigate('ActivityFeed', { personId: active.id })}
                icon={IconClock}
              />
              <QuickTile
                label="Care team"
                sub={careTeamCount > 0 ? `${careTeamCount} contact${careTeamCount !== 1 ? 's' : ''}` : 'Manage'}
                onPress={() => navigation.navigate('CareTeam', { personId: active.id })}
                icon={IconPeople}
              />
            </View>
          </View>
        )}

        {!active && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={styles.emptyText}>No people yet. Add someone you care for to get started.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('AddPerson')}>
              <Text style={styles.primaryBtnText}>Add a person</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TabBar active={1} navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── RecipientCard styles ─────────────────────────────────
const rc = StyleSheet.create({
  card: {
    backgroundColor: colors.forestDeep, borderRadius: 24, padding: 20,
    overflow: 'hidden', position: 'relative',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  portrait: {
    width: 56, height: 56, borderRadius: 18, flexShrink: 0,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  portraitLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 8, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.3,
    textAlign: 'center', zIndex: 1,
  },
  relLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4, textTransform: 'uppercase' },
  name: {
    fontFamily: 'Georgia', fontSize: 22, lineHeight: 26,
    letterSpacing: -0.4, fontWeight: '400', marginTop: 2, color: '#fff',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  iconBadge: {
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' },
  rowValue: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '400', color: '#fff', marginTop: 1, lineHeight: 18 },
  rowNone: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontStyle: 'italic' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  chip: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  chipText: { fontSize: 10.5, color: '#fff', letterSpacing: 0.1, fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },

  // Top bar
  topBar: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontFamily: 'Georgia', fontSize: 17, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.2 },
  topBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },

  // Person chips
  personRow: { paddingHorizontal: 20, paddingTop: 18, gap: 8, flexDirection: 'row', paddingRight: 24 },
  personChip: { height: 40, paddingHorizontal: 14, paddingLeft: 4, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 8 },
  personChipActive: { borderColor: colors.forestDeep, backgroundColor: colors.forestDeep },
  personInit: { width: 30, height: 30, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  personInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  personChipName: { fontSize: 13, fontWeight: '500', color: colors.ink, lineHeight: 14 },
  personChipRel: { fontSize: 9.5, color: colors.muted, marginTop: 2, letterSpacing: 0.2 },
  addChip: { width: 40, height: 40, borderRadius: 99, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.mutedSoft, alignItems: 'center', justifyContent: 'center' },


  // Alert banner
  alertBanner: { backgroundColor: colors.forestDeep, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.terracotta, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertText: { flex: 1, fontSize: 12.5, lineHeight: 17 },

  // Vital chips
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vitalChip: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, flexDirection: 'row', overflow: 'hidden' },
  vitalChipRail: { position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, borderRadius: 99 },
  vitalChipTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  vitalChipLabel: { fontSize: 10.5, color: colors.muted, letterSpacing: 0.3, textTransform: 'uppercase' },
  flagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  flagPillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  vitalValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  vitalValue: { fontFamily: 'Georgia', fontSize: 22, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.4, lineHeight: 26 },
  vitalUnit: { fontSize: 10.5, color: colors.muted },
  vitalTime: { fontSize: 10.5, color: colors.mutedSoft, marginTop: 2 },

  // Section
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.3, marginBottom: 10 },
  sectionAction: { fontSize: 12, color: colors.forest, fontWeight: '500' },

  // Care details grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, minHeight: 96, justifyContent: 'space-between' },
  tileIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tileLabel: { fontSize: 13, fontWeight: '600', color: colors.ink, letterSpacing: -0.1 },
  tileBadge: { width: 6, height: 6, borderRadius: 99, backgroundColor: colors.terracotta },
  tileSub: { fontSize: 10.5, color: colors.muted, marginTop: 2, letterSpacing: 0.1 },

  // Empty
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  primaryBtn: { marginTop: 20, paddingHorizontal: 24, height: 48, borderRadius: 14, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
