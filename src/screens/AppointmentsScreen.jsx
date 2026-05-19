import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── Design tokens ────────────────────────────────────────
const C = {
  cream: '#F6F1EA',
  ink: '#1A1F1D',
  forest: '#1F3D38',
  forestDeep: '#15302C',
  terracotta: '#C66E4E',
  terracottaSoft: '#E9CFC1',
  sageSoft: '#DDE4D6',
  sage: '#A8B5A0',
  muted: '#6B6862',
  mutedSoft: '#9A968F',
  line: '#E8E0D2',
  lineSoft: '#EFE8DA',
};

// ─── Type config (inferred from title keywords — no DB column needed) ────────
const KIND_MAP = {
  lab:       { label: 'Lab test',   color: '#B07A2A', bg: '#F5E4C9' },
  imaging:   { label: 'Imaging',    color: '#7A5A3F', bg: '#EDE4DA' },
  tele:      { label: 'Telehealth', color: '#3A6B9A', bg: '#D8E5F0' },
  telehealth:{ label: 'Telehealth', color: '#3A6B9A', bg: '#D8E5F0' },
  rx:        { label: 'Pharmacy',   color: C.forestDeep, bg: C.sageSoft },
  pharmacy:  { label: 'Pharmacy',   color: C.forestDeep, bg: C.sageSoft },
  visit:     { label: 'In-person',  color: C.forest,  bg: C.sageSoft },
  in_person: { label: 'In-person',  color: C.forest,  bg: C.sageSoft },
};
// Infer kind from title keywords when no kind field stored
function inferKind(appt) {
  const text = ((appt.kind ?? appt.appointment_type ?? '')).toLowerCase();
  if (text && KIND_MAP[text]) return KIND_MAP[text];
  const t = (appt.title ?? '').toLowerCase();
  if (/\blab\b|blood|urine|panel|inr|lipid/.test(t)) return KIND_MAP.lab;
  if (/\bimag|x-ray|xray|mri|ct scan|ultrasound/.test(t)) return KIND_MAP.imaging;
  if (/\btele|video|virtual|call\b/.test(t)) return KIND_MAP.tele;
  if (/\bpharmacy|pickup|prescription\b/.test(t)) return KIND_MAP.rx;
  return { label: 'Visit', color: C.forest, bg: C.sageSoft };
}

// ─── Date helpers ─────────────────────────────────────────
function daysUntil(iso) {
  if (!iso) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const appt = new Date(iso); appt.setHours(0, 0, 0, 0);
  return Math.round((appt - today) / 86400000);
}
function formatFull(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}
function formatDay(iso) {
  if (!iso) return { day: '', date: '' };
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}
function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (d.getHours() === 0 && d.getMinutes() === 0) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function daysUntilLabel(n) {
  if (n === null) return '';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 0) return `${Math.abs(n)}d ago`;
  return `In ${n}d`;
}

// ─── SVG icons ────────────────────────────────────────────
function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.forestDeep} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IPlus() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ICalendar() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path d="M10 20h24M15 10v3M29 10v3M11 13h22a2 2 0 012 2v16a2 2 0 01-2 2H11a2 2 0 01-2-2V15a2 2 0 012-2z"
        stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M18 28l2 2 6-6" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Appointment row ──────────────────────────────────────
function ApptRow({ appt, isLast, onEdit, onDelete, dim }) {
  const { day, date } = formatDay(appt.appointment_date);
  const time = formatTime(appt.appointment_date);
  const until = daysUntil(appt.appointment_date);
  const t = inferKind(appt);
  const isToday = until === 0;
  const isSoon = until !== null && until >= 0 && until <= 7;

  return (
    <View style={[s.apptRowWrap, !isLast && s.apptRowBorder, dim && { opacity: 0.65 }]}>
      {/* Main row */}
      <View style={s.apptRow}>
        {/* Date chip */}
        <View style={[s.dateChip, isToday && { backgroundColor: C.forestDeep, borderColor: C.forestDeep }]}>
          <Text style={[s.dateChipDay, isToday && { color: 'rgba(255,255,255,0.7)' }]}>{day}</Text>
          <Text style={[s.dateChipDate, isToday && { color: '#fff' }]}>{date}</Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.apptTitleRow}>
            <View style={[s.typeChip, { backgroundColor: t.bg }]}>
              <Text style={[s.typeChipText, { color: t.color }]}>{t.label.toUpperCase()}</Text>
            </View>
            {isSoon && !isToday && (
              <View style={[s.typeChip, { backgroundColor: C.terracottaSoft }]}>
                <Text style={[s.typeChipText, { color: C.terracotta }]}>{daysUntilLabel(until)}</Text>
              </View>
            )}
            {isToday && (
              <View style={[s.typeChip, { backgroundColor: C.sageSoft }]}>
                <Text style={[s.typeChipText, { color: C.forest }]}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={s.apptTitle} numberOfLines={1}>{appt.title || appt.type || 'Appointment'}</Text>
          {(appt.provider || appt.location || time) ? (
            <Text style={s.apptMeta} numberOfLines={1}>
              {[appt.provider, appt.location, time].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          {appt.notes ? (
            <Text style={s.apptNotes} numberOfLines={1}>{appt.notes}</Text>
          ) : null}
        </View>
      </View>

      {/* Action links */}
      <View style={s.apptActions}>
        <TouchableOpacity onPress={() => onEdit(appt)}>
          <Text style={[s.apptAction, { color: C.forest }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(appt)}>
          <Text style={[s.apptAction, { color: '#C0392B' }]}>
            {dim ? 'Delete' : 'Cancel appointment'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function AppointmentsScreen({ navigation, route }) {
  const personId = route?.params?.personId;
  const [personName, setPersonName] = useState(route?.params?.personName ?? null);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!personId) { setLoading(false); return; }
    try {
      const [personRes, apptRes] = await Promise.all([
        supabase.from('persons').select('name, first_name').eq('id', personId).maybeSingle(),
        supabase.from('appointments').select('*').eq('person_id', personId).order('appointment_date'),
      ]);
      if (personRes.data && !personName) {
        setPersonName(personRes.data.name ?? personRes.data.first_name ?? null);
      }
      setAppts(apptRes.data ?? []);
    } catch (_) { setAppts([]); }
    finally { setLoading(false); }
  }, [personId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const now = new Date();
  const upcoming = appts.filter(a => !a.appointment_date || new Date(a.appointment_date) >= now);
  const past = appts.filter(a => a.appointment_date && new Date(a.appointment_date) < now);
  const next = upcoming[0] ?? null;

  // Count helpers
  const todayCount = upcoming.filter(a => daysUntil(a.appointment_date) === 0).length;
  const weekCount = upcoming.filter(a => { const d = daysUntil(a.appointment_date); return d !== null && d <= 7; }).length;

  const handleEdit = (appt) => {
    navigation.navigate('AddAppointment', { personId, personName, appointment: appt });
  };

  const handleDelete = (appt) => {
    Alert.alert(
      'Cancel appointment',
      `Remove "${appt.title || 'this appointment'}"?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            const { error } = await supabase.from('appointments').delete().eq('id', appt.id);
            if (error) { Alert.alert('Error', error.message); return; }
            setAppts(prev => prev.filter(a => a.id !== appt.id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.topTitle}>Appointments</Text>
          {personName ? <Text style={s.topSub}>{personName}</Text> : null}
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AddAppointment', { personId, personName })}
        >
          <IPlus />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={C.forest} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {appts.length === 0 ? (
            /* ── Empty state ── */
            <View style={s.emptyCard}>
              <View style={s.emptyIconWrap}>
                <ICalendar />
              </View>
              <Text style={s.emptyTitle}>No appointments yet</Text>
              <Text style={s.emptySub}>
                Track doctor visits, lab work, and telehealth appointments in one place.
              </Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('AddAppointment', { personId, personName })}
              >
                <Text style={s.emptyBtnText}>Schedule first visit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ── Hero card ── */}
              {next && (
                <View style={s.heroCard}>
                  <View style={s.heroDecor} pointerEvents="none">
                    <ICalendar />
                  </View>
                  <Text style={s.heroEyebrow}>NEXT VISIT</Text>
                  <Text style={s.heroTitle} numberOfLines={2}>{next.title || next.type || 'Appointment'}</Text>
                  <Text style={s.heroDate}>{formatFull(next.appointment_date)}</Text>
                  {(next.provider || next.location) ? (
                    <Text style={s.heroMeta}>
                      {[next.provider, next.location].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}

                  {/* Days-until badge */}
                  {(() => {
                    const d = daysUntil(next.appointment_date);
                    if (d === null) return null;
                    const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d} days away`;
                    return (
                      <View style={s.heroBadge}>
                        <Text style={s.heroBadgeText}>{label}</Text>
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* ── Stats strip ── */}
              {upcoming.length > 0 && (
                <View style={s.statsStrip}>
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{upcoming.length}</Text>
                    <Text style={s.statLabel}>upcoming</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{todayCount}</Text>
                    <Text style={s.statLabel}>today</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{weekCount}</Text>
                    <Text style={s.statLabel}>this week</Text>
                  </View>
                </View>
              )}

              {/* ── Upcoming section ── */}
              {upcoming.length > 0 && (
                <View style={s.section}>
                  <View style={s.sectionHead}>
                    <Text style={s.sectionTitle}>Upcoming</Text>
                    <Text style={s.sectionCount}>
                      {String(upcoming.length).padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={s.listCard}>
                    {upcoming.map((a, i) => (
                      <ApptRow
                        key={a.id}
                        appt={a}
                        isLast={i === upcoming.length - 1}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* ── No upcoming ── */}
              {upcoming.length === 0 && (
                <View style={s.noUpcomingCard}>
                  <Text style={s.noUpcomingText}>No upcoming appointments.</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddAppointment', { personId, personName })}
                  >
                    <Text style={s.noUpcomingAction}>Schedule one →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Past section ── */}
              {past.length > 0 && (
                <View style={s.section}>
                  <View style={s.sectionHead}>
                    <Text style={[s.sectionTitle, { color: C.muted }]}>Past</Text>
                    <Text style={s.sectionCount}>
                      {String(past.length).padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={[s.listCard, { opacity: 0.8 }]}>
                    {past.slice(0, 20).map((a, i) => (
                      <ApptRow
                        key={a.id}
                        appt={a}
                        isLast={i === Math.min(past.length, 20) - 1}
                        dim
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </View>
                  {past.length > 20 && (
                    <Text style={s.moreLabel}>Showing 20 of {past.length} past appointments</Text>
                  )}
                </View>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  topTitle: {
    fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep,
    fontWeight: '500', letterSpacing: -0.2,
  },
  topSub: { fontSize: 10.5, color: C.muted, letterSpacing: 0.3, marginTop: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.forestDeep, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 48 },

  // Hero card
  heroCard: {
    backgroundColor: C.forestDeep, borderRadius: 22, padding: 20,
    marginBottom: 14, overflow: 'hidden',
  },
  heroDecor: {
    position: 'absolute', right: -4, bottom: -4, opacity: 0.6,
  },
  heroEyebrow: {
    fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1,
    fontWeight: '600', marginBottom: 6,
  },
  heroTitle: {
    fontFamily: 'Georgia', fontSize: 24, color: '#fff',
    fontWeight: '400', letterSpacing: -0.4, lineHeight: 28, marginBottom: 8,
  },
  heroDate: { fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 17 },
  heroMeta: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  heroBadge: {
    alignSelf: 'flex-start', marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 11.5, color: '#fff', fontWeight: '600' },

  // Stats strip
  statsStrip: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1, borderColor: C.line,
    marginBottom: 16, padding: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: {
    fontFamily: 'Georgia', fontSize: 22, color: C.forestDeep,
    fontWeight: '400', letterSpacing: -0.3,
  },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2, fontWeight: '500', letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: C.lineSoft, marginVertical: 4 },

  // Section
  section: { marginBottom: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  sectionTitle: {
    fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep,
    fontWeight: '500', letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 11, color: C.muted, letterSpacing: 0.4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // List card
  listCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden',
  },

  // Appointment row
  apptRowWrap: {},
  apptRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  apptRow: {
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  dateChip: {
    width: 50, paddingVertical: 6, borderRadius: 11,
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.lineSoft,
    alignItems: 'center', flexShrink: 0,
  },
  dateChipDay: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  dateChipDate: { fontFamily: 'Georgia', fontSize: 13, color: C.forestDeep, fontWeight: '500', marginTop: 1 },
  apptTitleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 5 },
  typeChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  typeChipText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  apptTitle: { fontSize: 14, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  apptMeta: { fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 16 },
  apptNotes: { fontSize: 11, color: C.mutedSoft, marginTop: 2, fontStyle: 'italic' },
  apptActions: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: 14, paddingBottom: 12,
  },
  apptAction: { fontSize: 12, fontWeight: '500' },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: C.line,
    padding: 28, alignItems: 'center', marginTop: 20,
  },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep,
    letterSpacing: -0.4, marginBottom: 8,
  },
  emptySub: {
    fontSize: 13, color: C.muted, textAlign: 'center',
    lineHeight: 19, maxWidth: 260,
  },
  emptyBtn: {
    marginTop: 18, backgroundColor: C.forestDeep,
    borderRadius: 99, paddingHorizontal: 22, paddingVertical: 11,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  noUpcomingCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: C.line,
    padding: 18, alignItems: 'center', marginBottom: 16,
  },
  noUpcomingText: { fontSize: 13, color: C.muted },
  noUpcomingAction: { fontSize: 13, color: C.forest, fontWeight: '600', marginTop: 6 },

  moreLabel: { fontSize: 11.5, color: C.mutedSoft, textAlign: 'center', marginTop: 10 },
});
