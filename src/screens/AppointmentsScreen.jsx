import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Modal, TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
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

// ─── Type config ──────────────────────────────────────────
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
function ICheck() {
  return (
    <Svg width={11} height={9} viewBox="0 0 11 9" fill="none">
      <Path d="M1 4.5l3 3 6-7" stroke={C.forest} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Visit note sheet ─────────────────────────────────────
function VisitNoteSheet({ visible, appt, onClose, onConfirm, loading }) {
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [testsOrdered, setTestsOrdered] = useState('');

  useEffect(() => {
    if (visible) {
      // Pre-fill from existing visit notes if re-logging
      setDoctorNotes(appt?.visit_notes ?? '');
      setPrescriptions(appt?.prescriptions_noted ?? '');
      setTestsOrdered(appt?.tests_ordered ?? '');
    }
  }, [visible, appt]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.40)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
          <View style={{ backgroundColor: C.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            {/* Drag handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.line, alignSelf: 'center', marginBottom: 20 }} />

            <Text style={{ fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, marginBottom: 4 }}>Log this visit</Text>
            {appt ? (
              <Text style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{appt.title}</Text>
            ) : null}

            {/* Doctor's notes */}
            <Text style={vs.fieldLabel}>DOCTOR'S NOTES</Text>
            <View style={vs.inputBox}>
              <TextInput
                style={vs.input}
                placeholder="What did the doctor say…"
                placeholderTextColor={C.mutedSoft}
                value={doctorNotes}
                onChangeText={setDoctorNotes}
                multiline
                autoCapitalize="sentences"
                scrollEnabled={false}
              />
            </View>

            {/* Prescriptions */}
            <Text style={vs.fieldLabel}>PRESCRIPTIONS GIVEN</Text>
            <View style={vs.inputBox}>
              <TextInput
                style={vs.input}
                placeholder="e.g. Amoxicillin 500mg for 7 days…"
                placeholderTextColor={C.mutedSoft}
                value={prescriptions}
                onChangeText={setPrescriptions}
                multiline
                autoCapitalize="sentences"
                scrollEnabled={false}
              />
            </View>

            {/* Tests ordered */}
            <Text style={vs.fieldLabel}>TESTS ORDERED</Text>
            <View style={[vs.inputBox, { marginBottom: 22 }]}>
              <TextInput
                style={vs.input}
                placeholder="e.g. CBC, blood sugar, chest X-ray…"
                placeholderTextColor={C.mutedSoft}
                value={testsOrdered}
                onChangeText={setTestsOrdered}
                multiline
                autoCapitalize="sentences"
                scrollEnabled={false}
              />
            </View>

            <TouchableOpacity
              style={{ height: 52, borderRadius: 14, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
              onPress={() => onConfirm({ doctorNotes: doctorNotes.trim(), prescriptions: prescriptions.trim(), testsOrdered: testsOrdered.trim() })}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Confirm visit</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={{ fontSize: 15, color: C.muted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const vs = StyleSheet.create({
  fieldLabel: { fontSize: 10.5, fontWeight: '700', color: C.muted, letterSpacing: 0.6, marginBottom: 7, textTransform: 'uppercase' },
  inputBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: C.line, padding: 12, marginBottom: 14 },
  input: { fontSize: 14, color: C.ink, minHeight: 44, lineHeight: 20 },
});

// ─── Appointment row ──────────────────────────────────────
function ApptRow({ appt, isLast, onEdit, onDelete, onMarkVisited, dim }) {
  const { day, date } = formatDay(appt.appointment_date);
  const time = formatTime(appt.appointment_date);
  const until = daysUntil(appt.appointment_date);
  const t = inferKind(appt);
  const isToday = until === 0;
  const isSoon = until !== null && until >= 0 && until <= 7;
  const isVisited = !!appt.visited_at;
  const isPast = dim; // dim prop is set for past appointments

  const hasVisitNotes = isVisited && (appt.visit_notes || appt.prescriptions_noted || appt.tests_ordered);

  return (
    <View style={[s.apptRowWrap, !isLast && s.apptRowBorder, dim && !isVisited && { opacity: 0.65 }]}>
      {/* Main row */}
      <View style={s.apptRow}>
        {/* Date chip */}
        <View style={[
          s.dateChip,
          isToday && !isVisited && { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
          isVisited && { backgroundColor: C.sageSoft, borderColor: C.sage },
        ]}>
          {isVisited ? (
            <View style={{ alignItems: 'center', paddingVertical: 4 }}>
              <ICheck />
              <Text style={{ fontSize: 8, fontWeight: '700', color: C.forest, letterSpacing: 0.3, marginTop: 2 }}>DONE</Text>
            </View>
          ) : (
            <>
              <Text style={[s.dateChipDay, isToday && { color: 'rgba(255,255,255,0.7)' }]}>{day}</Text>
              <Text style={[s.dateChipDate, isToday && { color: '#fff' }]}>{date}</Text>
            </>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.apptTitleRow}>
            <View style={[s.typeChip, { backgroundColor: t.bg }]}>
              <Text style={[s.typeChipText, { color: t.color }]}>{t.label.toUpperCase()}</Text>
            </View>
            {isVisited && (
              <View style={[s.typeChip, { backgroundColor: C.sageSoft }]}>
                <Text style={[s.typeChipText, { color: C.forest }]}>VISITED</Text>
              </View>
            )}
            {!isVisited && isSoon && !isToday && (
              <View style={[s.typeChip, { backgroundColor: C.terracottaSoft }]}>
                <Text style={[s.typeChipText, { color: C.terracotta }]}>{daysUntilLabel(until)}</Text>
              </View>
            )}
            {!isVisited && isToday && (
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
          {appt.notes && !isVisited ? (
            <Text style={s.apptNotes} numberOfLines={1}>{appt.notes}</Text>
          ) : null}
        </View>
      </View>

      {/* Visit notes preview */}
      {hasVisitNotes && (
        <View style={s.visitNotesCard}>
          {appt.visit_notes ? (
            <View style={s.visitNoteRow}>
              <Text style={s.visitNoteLabel}>Notes</Text>
              <Text style={s.visitNoteText} numberOfLines={2}>{appt.visit_notes}</Text>
            </View>
          ) : null}
          {appt.prescriptions_noted ? (
            <View style={[s.visitNoteRow, appt.visit_notes && s.visitNoteRowBorder]}>
              <Text style={s.visitNoteLabel}>Rx</Text>
              <Text style={s.visitNoteText} numberOfLines={2}>{appt.prescriptions_noted}</Text>
            </View>
          ) : null}
          {appt.tests_ordered ? (
            <View style={[s.visitNoteRow, (appt.visit_notes || appt.prescriptions_noted) && s.visitNoteRowBorder]}>
              <Text style={s.visitNoteLabel}>Tests</Text>
              <Text style={s.visitNoteText} numberOfLines={2}>{appt.tests_ordered}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Action links */}
      <View style={s.apptActions}>
        <TouchableOpacity onPress={() => onEdit(appt)}>
          <Text style={[s.apptAction, { color: C.forest }]}>Edit</Text>
        </TouchableOpacity>

        {/* Mark visited button — upcoming not yet visited, or past without notes */}
        {!isVisited && (
          <TouchableOpacity
            style={s.visitBtn}
            onPress={() => onMarkVisited(appt)}
          >
            <Text style={s.visitBtnText}>{isToday ? 'Mark visited' : isPast ? 'Add visit notes' : 'Mark visited'}</Text>
          </TouchableOpacity>
        )}

        {/* Re-log visit notes if visited */}
        {isVisited && (
          <TouchableOpacity onPress={() => onMarkVisited(appt)}>
            <Text style={[s.apptAction, { color: C.muted }]}>Edit visit notes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => onDelete(appt)}>
          <Text style={[s.apptAction, { color: '#C0392B' }]}>
            {dim ? 'Delete' : 'Cancel'}
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
  const [visitTarget, setVisitTarget] = useState(null);
  const [visitLoading, setVisitLoading] = useState(false);

  const load = useCallback(async () => {
    if (!personId) { setLoading(false); return; }
    try {
      const [personRes, apptRes] = await Promise.all([
        supabase.from('persons').select('name').eq('id', personId).maybeSingle(),
        supabase.from('appointments').select('*').eq('person_id', personId).order('appointment_date'),
      ]);
      if (personRes.data && !personName) setPersonName(personRes.data.name ?? null);
      setAppts(apptRes.data ?? []);
    } catch (_) { setAppts([]); }
    finally { setLoading(false); }
  }, [personId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const now = new Date();
  const upcoming = appts.filter(a => !a.appointment_date || new Date(a.appointment_date) >= now);
  const past = appts.filter(a => a.appointment_date && new Date(a.appointment_date) < now);
  const next = upcoming[0] ?? null;

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

  const handleConfirmVisit = async ({ doctorNotes, prescriptions, testsOrdered }) => {
    if (!visitTarget) return;
    setVisitLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('appointments').update({
        visited_at: new Date().toISOString(),
        visit_notes: doctorNotes || null,
        prescriptions_noted: prescriptions || null,
        tests_ordered: testsOrdered || null,
      }).eq('id', visitTarget.id);
      if (error) throw error;

      // Log to activity feed
      await supabase.from('activity_log').insert({
        actor_id: user.id,
        actor_name: user.user_metadata?.full_name || '',
        action_type: 'appointment',
        person_id: personId,
        payload: {
          appointment_title: visitTarget.title,
          visit_notes: doctorNotes || null,
          prescriptions_noted: prescriptions || null,
          tests_ordered: testsOrdered || null,
          visited_at: new Date().toISOString(),
        },
      });

      setVisitTarget(null);
      await load();
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    } finally {
      setVisitLoading(false);
    }
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
                    <Text style={s.heroMeta}>{[next.provider, next.location].filter(Boolean).join(' · ')}</Text>
                  ) : null}
                  {(() => {
                    const d = daysUntil(next.appointment_date);
                    if (d === null) return null;
                    const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d} days away`;
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
                        <View style={s.heroBadge}>
                          <Text style={s.heroBadgeText}>{label}</Text>
                        </View>
                        {d <= 1 && !next.visited_at && (
                          <TouchableOpacity
                            style={s.heroVisitBtn}
                            onPress={() => setVisitTarget(next)}
                          >
                            <Text style={s.heroVisitBtnText}>Mark visited →</Text>
                          </TouchableOpacity>
                        )}
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
                    <Text style={s.sectionCount}>{String(upcoming.length).padStart(2, '0')}</Text>
                  </View>
                  <View style={s.listCard}>
                    {upcoming.map((a, i) => (
                      <ApptRow
                        key={a.id}
                        appt={a}
                        isLast={i === upcoming.length - 1}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMarkVisited={setVisitTarget}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* ── No upcoming ── */}
              {upcoming.length === 0 && (
                <View style={s.noUpcomingCard}>
                  <Text style={s.noUpcomingText}>No upcoming appointments.</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AddAppointment', { personId, personName })}>
                    <Text style={s.noUpcomingAction}>Schedule one →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Past section ── */}
              {past.length > 0 && (
                <View style={s.section}>
                  <View style={s.sectionHead}>
                    <Text style={[s.sectionTitle, { color: C.muted }]}>Past</Text>
                    <Text style={s.sectionCount}>{String(past.length).padStart(2, '0')}</Text>
                  </View>
                  <View style={[s.listCard, { opacity: 0.88 }]}>
                    {past.slice(0, 20).map((a, i) => (
                      <ApptRow
                        key={a.id}
                        appt={a}
                        isLast={i === Math.min(past.length, 20) - 1}
                        dim
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMarkVisited={setVisitTarget}
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

      {/* ── Visit note sheet ── */}
      <VisitNoteSheet
        visible={!!visitTarget}
        appt={visitTarget}
        loading={visitLoading}
        onClose={() => !visitLoading && setVisitTarget(null)}
        onConfirm={handleConfirmVisit}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },

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

  heroCard: {
    backgroundColor: C.forestDeep, borderRadius: 22, padding: 20,
    marginBottom: 14, overflow: 'hidden',
  },
  heroDecor: { position: 'absolute', right: -4, bottom: -4, opacity: 0.6 },
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
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 11.5, color: '#fff', fontWeight: '600' },
  heroVisitBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroVisitBtnText: { fontSize: 11.5, color: '#fff', fontWeight: '600' },

  statsStrip: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1, borderColor: C.line,
    marginBottom: 16, padding: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Georgia', fontSize: 22, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2, fontWeight: '500', letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: C.lineSoft, marginVertical: 4 },

  section: { marginBottom: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  sectionCount: { fontSize: 11, color: C.muted, letterSpacing: 0.4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  listCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },

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

  // Visit notes preview inside row
  visitNotesCard: {
    marginHorizontal: 14, marginBottom: 10,
    backgroundColor: C.sageSoft, borderRadius: 10, overflow: 'hidden',
  },
  visitNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10 },
  visitNoteRowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  visitNoteLabel: { fontSize: 10, fontWeight: '700', color: C.forest, letterSpacing: 0.4, width: 32, paddingTop: 1 },
  visitNoteText: { flex: 1, fontSize: 12, color: C.ink, lineHeight: 17 },

  // Action row
  apptActions: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingBottom: 12 },
  apptAction: { fontSize: 12, fontWeight: '500' },
  visitBtn: {
    backgroundColor: C.forestDeep, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  visitBtnText: { fontSize: 11.5, fontWeight: '600', color: '#fff' },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: C.line,
    padding: 28, alignItems: 'center', marginTop: 20,
  },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, letterSpacing: -0.4, marginBottom: 8 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19, maxWidth: 260 },
  emptyBtn: { marginTop: 18, backgroundColor: C.forestDeep, borderRadius: 99, paddingHorizontal: 22, paddingVertical: 11 },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  noUpcomingCard: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line,
    padding: 18, alignItems: 'center', marginBottom: 16,
  },
  noUpcomingText: { fontSize: 13, color: C.muted },
  noUpcomingAction: { fontSize: 13, color: C.forest, fontWeight: '600', marginTop: 6 },

  moreLabel: { fontSize: 11.5, color: C.mutedSoft, textAlign: 'center', marginTop: 10 },
});
