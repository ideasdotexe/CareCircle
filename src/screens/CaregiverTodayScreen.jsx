import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Animated, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import CaregiverTabBar from '../components/CaregiverTabBar';
import { supabase } from '../lib/supabase';

// ─── Design tokens ─────────────────────────────────────────
const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ─── Icons ──────────────────────────────────────────────────
function IBell() {
  return (
    <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
      <Path d="M9 1a6 6 0 016 6v4l2 3H1l2-3V7a6 6 0 016-6z" stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M7 17a2 2 0 004 0" stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
function IShield() {
  return (
    <Svg width={12} height={13} viewBox="0 0 12 13" fill="none">
      <Path d="M6 1L1 3.5v3C1 9.5 3.5 12 6 13c2.5-1 5-3.5 5-6.5v-3L6 1z" stroke={C.terracotta} strokeWidth={1.3} fill="none" />
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
function IClose({ color = C.muted }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Path d="M1 1l8 8M9 1L1 9" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function IClock() {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      <Circle cx={5.5} cy={5.5} r={4.5} stroke={C.mutedSoft} strokeWidth={1.2} />
      <Path d="M5.5 3v2.5L7 7" stroke={C.mutedSoft} strokeWidth={1.2} strokeLinecap="round" />
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
function IPulse({ color = C.forest }) {
  return (
    <Svg width={18} height={14} viewBox="0 0 22 20" fill="none">
      <Path d="M1 10h4l2-7 4 14 3-9 2 3h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function INote({ color = C.forest }) {
  return (
    <Svg width={16} height={18} viewBox="0 0 18 22" fill="none">
      <Path d="M2 1h10l5 5v15H2V1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 1v5h5M6 11h6M6 15h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
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
function IVisit({ color = C.forest }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={13} cy={7} r={1.5} stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0]; }
function fmtTime(t) {
  if (!t) return null;
  const h = parseInt(t.split(':')[0], 10);
  const m = t.split(':')[1] ?? '00';
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}
function slotKey(s) { return `${s.name}_${s.time ?? 'anytime'}`; }
function isDue(t) {
  if (!t) return false;
  const [h] = t.split(':').map(Number);
  const due = new Date(); due.setHours(h, 0, 0, 0);
  return new Date() > due;
}
function daysUntil(iso) {
  if (!iso) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
function apptDay(iso) {
  const d = daysUntil(iso);
  if (d === null) return '';
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d < 7) return `In ${d} days`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Log Modal ──────────────────────────────────────────────
function LogModal({ slot, onClose, onSave }) {
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState('choose');
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const slide = useRef(new Animated.Value(320)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, []);

  const dismiss = () => {
    Animated.timing(slide, { toValue: 400, duration: 180, useNativeDriver: true }).start(onClose);
  };
  const pick = (s) => { setPending(s); setPhase('note'); };
  const save = async () => {
    setSaving(true);
    await onSave(pending, note.trim());
    setSaving(false);
  };

  if (!slot) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <View style={lm.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={dismiss} activeOpacity={1} />
        <Animated.View style={[lm.sheet, { transform: [{ translateY: slide }] }]}>
          <View style={lm.handle} />
          <View style={lm.head}>
            <View style={{ flex: 1 }}>
              <Text style={lm.medName}>{slot.name}</Text>
              {!!slot.dose && <Text style={lm.dose}>{slot.dose}</Text>}
              {!!slot.time && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <IClock />
                  <Text style={lm.time}>{fmtTime(slot.time)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={lm.closeBtn} onPress={dismiss}>
              <IClose />
            </TouchableOpacity>
          </View>

          {phase === 'choose' ? (
            <View style={lm.btns}>
              <TouchableOpacity style={lm.takenBtn} onPress={() => pick('taken')} activeOpacity={0.85}>
                <ICheck />
                <Text style={lm.takenText}>Mark as taken</Text>
              </TouchableOpacity>
              <TouchableOpacity style={lm.skipBtn} onPress={() => pick('skipped')} activeOpacity={0.85}>
                <Text style={lm.skipText}>Skip this dose</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={lm.noteWrap}>
              <Text style={lm.noteLabel}>
                {pending === 'taken' ? 'Add a note' : 'Reason for skipping'}
                <Text style={{ color: C.mutedSoft, fontStyle: 'italic' }}> — optional</Text>
              </Text>
              <View style={lm.noteBox}>
                <TextInput
                  style={lm.noteInput}
                  placeholder={pending === 'taken' ? 'e.g. taken with breakfast…' : 'e.g. felt nauseous…'}
                  placeholderTextColor={C.mutedSoft}
                  value={note} onChangeText={setNote}
                  multiline autoFocus autoCapitalize="sentences"
                />
              </View>
              <TouchableOpacity
                style={[lm.takenBtn, pending === 'skipped' && { backgroundColor: C.terracotta }, { marginTop: 12 }]}
                onPress={save} disabled={saving} activeOpacity={0.85}
              >
                {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                  <Text style={lm.takenText}>
                    {pending === 'taken' ? 'Save — marked taken' : 'Save — dose skipped'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhase('choose')} style={{ alignItems: 'center', paddingTop: 10 }}>
                <Text style={{ fontSize: 13, color: C.muted }}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Med Row ────────────────────────────────────────────────
function MedRow({ slot, log, isLast, onPress }) {
  const status = log?.status ?? 'pending';
  const done = status === 'taken';
  const skipped = status === 'skipped';
  const due = isDue(slot.time);
  const circleBg = done ? C.forest : 'transparent';
  const circleBorder = done ? C.forest : skipped ? C.terracotta : due ? C.terracotta : C.line;
  return (
    <TouchableOpacity
      style={[mr.row, !isLast && mr.rowBorder, due && !done && !skipped && { backgroundColor: '#FFF8F2' }]}
      onPress={onPress} activeOpacity={0.8}
    >
      <View style={[mr.circle, { backgroundColor: circleBg, borderColor: circleBorder }]}>
        {done && <ICheck />}
        {skipped && <IClose color={C.terracotta} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[mr.name, (done || skipped) && { color: C.mutedSoft }]}>{slot.name}</Text>
        {!!slot.dose && <Text style={mr.dose}>{slot.dose}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {slot.time && <Text style={[mr.time, due && !done && !skipped && { color: C.terracotta, fontWeight: '600' }]}>{fmtTime(slot.time)}</Text>}
        {done && <Text style={[mr.statusTag, { color: C.forest }]}>Taken</Text>}
        {skipped && <Text style={[mr.statusTag, { color: C.terracotta }]}>Skipped</Text>}
        {!done && !skipped && due && <Text style={[mr.statusTag, { color: C.terracotta }]}>Due</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Section header ─────────────────────────────────────────
function SectionHead({ label, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 22 }}>
      <Text style={sc.sectionLabel}>{label}</Text>
      {!!action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={sc.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Quick action tile ──────────────────────────────────────
function ActionTile({ icon: Icon, label, sub, tint = C.sageSoft, onPress }) {
  return (
    <TouchableOpacity style={sc.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={[sc.tileIcon, { backgroundColor: tint }]}>
        <Icon color={C.forestDeep} />
      </View>
      <Text style={sc.tileLabel}>{label}</Text>
      <Text style={sc.tileSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ─── Parse permissions ───────────────────────────────────────
const PERM_KEYS = ['vitals', 'medications', 'reports', 'profile', 'appointments', 'activity'];

function parsePerms(raw) {
  // Default: full access (so old records without permissions still work)
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

// ─── Main screen ────────────────────────────────────────────
export default function CaregiverTodayScreen({ navigation }) {
  const [profile, setProfile]         = useState(null);
  const [persons, setPersons]         = useState([]);
  const [activeIdx, setActiveIdx]     = useState(0);
  const [permMap, setPermMap]         = useState({}); // person_id → parsed perms
  const [meds, setMeds]               = useState([]);
  const [schedules, setSchedules]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity]       = useState([]);
  const [logMap, setLogMap]           = useState({});
  const [logTarget, setLogTarget]     = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading]         = useState(true);

  // ── Load assigned persons ──────────────────────────────
  const loadPersons = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      setProfile({ ...p, _user: user });

      const userEmail = (user.email || '').toLowerCase();
      let personIds = [];
      const pm = {};

      // Primary: caregiver_relationships (written by owner on assign)
      const { data: rels } = await supabase
        .from('caregiver_relationships')
        .select('person_id, permissions')
        .eq('caregiver_id', user.id)
        .neq('access_revoked', true);
      (rels || []).forEach(r => {
        if (r.person_id) {
          personIds.push(r.person_id);
          pm[r.person_id] = parsePerms(r.permissions);
        }
      });
      personIds = [...new Set(personIds)];

      // Fallback: accepted caregiver_requests
      if (!personIds.length) {
        const [{ data: byId }, { data: byEmail }] = await Promise.all([
          supabase.from('caregiver_requests').select('person_id, permissions').eq('caregiver_id', user.id).eq('status', 'accepted'),
          supabase.from('caregiver_requests').select('person_id, permissions').eq('caregiver_email', userEmail).eq('status', 'accepted'),
        ]);
        [...(byId || []), ...(byEmail || [])].forEach(r => {
          if (r.person_id && !pm[r.person_id]) {
            personIds.push(r.person_id);
            pm[r.person_id] = parsePerms(r.permissions);
          }
        });
        personIds = [...new Set(personIds)];
      }

      setPermMap(pm);

      if (personIds.length) {
        const { data: ps } = await supabase.from('persons').select('*').in('id', personIds);
        setPersons(ps || []);
      } else {
        setPersons([]);
      }

      // Badge
      const [{ count: c1 }, { count: c2 }] = await Promise.all([
        supabase.from('caregiver_requests').select('id', { count: 'exact', head: true }).eq('caregiver_id', user.id).eq('status', 'pending'),
        supabase.from('caregiver_requests').select('id', { count: 'exact', head: true }).eq('caregiver_email', userEmail).eq('status', 'pending'),
      ]);
      setPendingCount((c1 || 0) + (c2 || 0));
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadPersons(); }, [loadPersons]));

  // ── Load per-person data when active person changes ────
  useEffect(() => {
    const person = persons[activeIdx];
    if (!person) { setMeds([]); setSchedules([]); setAppointments([]); setActivity([]); setLogMap({}); return; }
    (async () => {
      const today = todayStr();
      await Promise.allSettled([
        supabase.from('medications').select('*').eq('person_id', person.id).eq('active', true)
          .then(({ data }) => setMeds(data || [])),
        supabase.from('medication_schedules').select('medication_name, times, frequency_type, food_instruction').eq('person_id', person.id).eq('active', true)
          .then(({ data }) => setSchedules(data || [])).catch(() => {}),
        supabase.from('appointments').select('*').eq('person_id', person.id).gte('appointment_date', today).order('appointment_date').limit(5)
          .then(({ data }) => setAppointments(data || [])),
        supabase.from('activity_log').select('*').eq('person_id', person.id).order('created_at', { ascending: false }).limit(8)
          .then(({ data }) => setActivity(data || [])),
        supabase.from('medication_logs').select('*').eq('person_id', person.id).eq('log_date', today)
          .then(({ data }) => {
            const map = {};
            for (const l of data ?? []) map[`${l.medication_name}_${l.scheduled_time ?? 'anytime'}`] = { status: l.status, note: l.note ?? '' };
            setLogMap(map);
          }),
      ]);
    })();
  }, [persons, activeIdx]);

  // ── Build dose slots ───────────────────────────────────
  const scMap = {};
  for (const sc of schedules) scMap[sc.medication_name] = sc;

  const slots = [];
  for (const med of meds) {
    const sc = scMap[med.name];
    if (sc?.times?.length) {
      for (const t of sc.times) slots.push({ id: `${med.id}_${t}`, name: med.name, dose: med.dose, time: t });
    } else {
      slots.push({ id: med.id, name: med.name, dose: med.dose, time: null });
    }
  }
  slots.sort((a, b) => (!a.time ? 1 : !b.time ? -1 : a.time.localeCompare(b.time)));

  const takenCount   = slots.filter(s => logMap[slotKey(s)]?.status === 'taken').length;
  const pendingMeds  = slots.filter(s => !logMap[slotKey(s)]).length;

  // ── Log handler ────────────────────────────────────────
  const handleLog = async (status, note) => {
    if (!logTarget || !persons[activeIdx]) return;
    const key = slotKey(logTarget);
    setLogMap(prev => ({ ...prev, [key]: { status, note } }));
    setLogTarget(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('medication_logs').upsert({
        person_id: persons[activeIdx].id,
        medication_name: logTarget.name,
        scheduled_time: logTarget.time ?? null,
        log_date: todayStr(),
        status,
        note: note || null,
        logged_by: user?.id,
        logged_at: new Date().toISOString(),
      }, { onConflict: 'person_id,medication_name,log_date,scheduled_time' });
    } catch (_) {}
  };

  const person     = persons[activeIdx];
  const perms      = person ? (permMap[person.id] || parsePerms(null)) : parsePerms(null);
  const dateStr    = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const name       = profile?.full_name?.split(' ')[0] || 'there';
  const todayAppts = appointments.filter(a => daysUntil(a.appointment_date) === 0);
  const upcomingAppts = appointments.filter(a => { const d = daysUntil(a.appointment_date); return d !== null && d > 0; }).slice(0, 2);

  return (
    <SafeAreaView style={sc.container} edges={['top']}>
      <View style={sc.modeStrip} />

      {/* ── Top bar ── */}
      <View style={sc.topBar}>
        <View>
          <View style={sc.modeTag}>
            <IShield />
            <Text style={sc.modeTagText}>CAREGIVER MODE</Text>
          </View>
          <Text style={sc.greeting}>Today, {name}</Text>
          <Text style={sc.dateStr}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={sc.bellBtn} onPress={() => navigation.navigate('CaregiverNotifications')}>
          <IBell />
          {pendingCount > 0 && (
            <View style={sc.badge}>
              <Text style={sc.badgeText}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : persons.length === 0 ? (
        <View style={sc.emptyWrap}>
          <Text style={sc.emptyTitle}>No people assigned yet</Text>
          <Text style={sc.emptySub}>When a family accepts your request, their loved one will appear here.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Person chips ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 0 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, gap: 8, flexDirection: 'row' }}>
            {persons.map((p, i) => {
              const active = i === activeIdx;
              const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
              return (
                <TouchableOpacity key={p.id} onPress={() => setActiveIdx(i)}
                  style={[sc.chip, active && sc.chipActive]}>
                  <View style={[sc.chipInit, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : tint }]}>
                    <Text style={sc.chipInitText}>{(p.name || '?')[0]}</Text>
                  </View>
                  <Text style={[sc.chipName, active && { color: '#fff' }]}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {person && (
            <View style={{ paddingHorizontal: 20 }}>

              {/* ── Person header card ── */}
              <View style={sc.personCard}>
                <View style={sc.personAvatar}>
                  <Text style={sc.personAvatarText}>{(person.name || '?')[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sc.personRel}>{(person.relationship || 'Person').toUpperCase()}</Text>
                  <Text style={sc.personName}>{person.name}</Text>
                  {!!person.date_of_birth && (
                    <Text style={sc.personSub}>
                      DOB: {person.date_of_birth}
                      {person.sex ? ` · ${person.sex}` : ''}
                      {person.weight_kg ? ` · ${person.weight_kg}kg` : ''}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={sc.profileBtn}
                  onPress={() => navigation.navigate('CaregiverVisit', { personId: person.id, personName: person.name })}
                >
                  <Text style={sc.profileBtnText}>Visit</Text>
                </TouchableOpacity>
              </View>

              {/* ── Quick actions (permission-gated) ── */}
              <SectionHead label="QUICK ACTIONS" />
              <View style={sc.tileGrid}>
                <ActionTile icon={IVisit} label="Visit" sub="Start session" tint={C.sageSoft}
                  onPress={() => navigation.navigate('CaregiverVisit', { personId: person.id, personName: person.name })} />
                {perms.vitals?.view && (
                  <ActionTile icon={IPulse} label="Vitals"
                    sub={perms.vitals.contribute ? 'Log reading' : 'View only'}
                    tint="#EBF0E8"
                    onPress={() => perms.vitals.contribute
                      ? navigation.navigate('CaregiverVitalsLog', { personId: person.id })
                      : navigation.navigate('VitalsHistory', { personId: person.id, personName: person.name })} />
                )}
                {perms.activity?.contribute && (
                  <ActionTile icon={INote} label="Note" sub="Add visit note" tint={C.terracottaSoft}
                    onPress={() => navigation.navigate('CaregiverVisitNote', { personId: person.id })} />
                )}
                {perms.medications?.view && (
                  <ActionTile icon={IPill} label="Meds" sub="Full schedule" tint="#EBF0E8"
                    onPress={() => navigation.navigate('Medications', { personId: person.id })} />
                )}
                {perms.reports?.view && (
                  <ActionTile icon={IDoc} label="Reports"
                    sub={perms.reports.contribute ? 'View & upload' : 'View only'}
                    tint="#FBF5E8"
                    onPress={() => navigation.navigate('DocsHome', { personId: person.id })} />
                )}
                {perms.appointments?.view && (
                  <ActionTile icon={ICal} label="Appts" sub="Calendar" tint={C.sageSoft}
                    onPress={() => navigation.navigate('AppointmentsScreen', { personId: person.id, personName: person.name })} />
                )}
              </View>

              {/* ── Today's appointments ── */}
              {perms.appointments?.view && (todayAppts.length > 0 || upcomingAppts.length > 0) && (
                <>
                  <SectionHead label="APPOINTMENTS" action="All"
                    onAction={() => navigation.navigate('AppointmentsScreen', { personId: person.id, personName: person.name })} />
                  <View style={sc.card}>
                    {[...todayAppts, ...upcomingAppts].map((a, i, arr) => (
                      <View key={a.id} style={[sc.apptRow, i < arr.length - 1 && sc.rowBorder]}>
                        <View style={[sc.apptDot, daysUntil(a.appointment_date) === 0 && { backgroundColor: C.terracottaSoft }]}>
                          <ICal color={daysUntil(a.appointment_date) === 0 ? C.terracotta : C.forest} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={sc.apptTitle}>{a.title || 'Appointment'}</Text>
                          <Text style={sc.apptMeta}>
                            {apptDay(a.appointment_date)}
                            {a.time ? ` · ${fmtTime(a.time)}` : ''}
                            {a.location ? ` · ${a.location}` : ''}
                          </Text>
                        </View>
                        {daysUntil(a.appointment_date) === 0 && (
                          <View style={sc.todayTag}><Text style={sc.todayTagText}>TODAY</Text></View>
                        )}
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* ── Today's medications ── */}
              {perms.medications?.view && (
                <>
                  <SectionHead
                    label={`MEDICATIONS TODAY${slots.length > 0 ? ` · ${takenCount}/${slots.length}` : ''}`}
                    action={slots.length > 0 ? 'All meds' : undefined}
                    onAction={() => navigation.navigate('Medications', { personId: person.id })}
                  />
                  {slots.length === 0 ? (
                    <View style={sc.emptyCard}>
                      <Text style={sc.emptyCardText}>No medications on schedule</Text>
                    </View>
                  ) : (
                    <>
                      <View style={sc.progressWrap}>
                        <View style={sc.progressBg}>
                          <View style={[sc.progressFill, { width: `${(takenCount / slots.length) * 100}%` }]} />
                        </View>
                        <Text style={sc.progressLabel}>{takenCount} taken · {pendingMeds} pending</Text>
                      </View>
                      <View style={sc.card}>
                        {slots.map((slot, i) => (
                          <MedRow
                            key={slot.id}
                            slot={slot}
                            log={logMap[slotKey(slot)]}
                            isLast={i === slots.length - 1}
                            onPress={() => {
                              if (!perms.medications.contribute) return;
                              const s = logMap[slotKey(slot)]?.status;
                              if (s === 'taken' || s === 'skipped') return;
                              setLogTarget(slot);
                            }}
                          />
                        ))}
                      </View>
                      {!perms.medications.contribute && (
                        <Text style={sc.readOnlyNote}>Read only · You can view but not log medications</Text>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ── Recent activity ── */}
              {perms.activity?.view && activity.length > 0 && (
                <>
                  <SectionHead label="RECENT ACTIVITY" />
                  <View style={sc.card}>
                    {activity.map((item, i) => (
                      <View key={item.id || i} style={[sc.actRow, i < activity.length - 1 && sc.rowBorder]}>
                        <View style={[sc.actDot, item.flagged && { backgroundColor: '#FBE3D9' }]}>
                          <Text style={{ fontSize: 13 }}>
                            {item.activity_type === 'medication' ? '💊'
                              : item.activity_type === 'vital' ? '📊'
                              : item.activity_type === 'appointment' ? '📅'
                              : item.activity_type === 'document' ? '📄' : '📝'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={sc.actTitle}>{item.title || item.activity_type}</Text>
                          {!!item.note && <Text style={sc.actNote} numberOfLines={1}>{item.note}</Text>}
                        </View>
                        <Text style={sc.actTime}>
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

            </View>
          )}
        </ScrollView>
      )}

      {logTarget && (
        <LogModal
          slot={logTarget}
          onClose={() => setLogTarget(null)}
          onSave={handleLog}
        />
      )}

      <CaregiverTabBar active={0} navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const sc = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.cream },
  modeStrip:      { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar:         { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modeTag:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTagText:    { fontSize: 10, color: C.terracotta, letterSpacing: 0.7, fontWeight: '700' },
  greeting:       { fontFamily: 'Georgia', fontSize: 24, color: C.forestDeep, fontWeight: '400', marginTop: 4, letterSpacing: -0.4 },
  dateStr:        { fontSize: 12, color: C.muted, marginTop: 2 },
  bellBtn:        { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  badge:          { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:      { fontSize: 9, color: '#fff', fontWeight: '700' },

  // Empty state
  emptyWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:     { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500', textAlign: 'center' },
  emptySub:       { marginTop: 8, fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19 },

  // Person chips
  chip:           { height: 36, paddingHorizontal: 12, paddingLeft: 4, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive:     { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  chipInit:       { width: 27, height: 27, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  chipInitText:   { color: '#fff', fontFamily: 'Georgia', fontSize: 11, fontWeight: '500' },
  chipName:       { fontSize: 13, fontWeight: '500', color: C.ink },

  // Person header card
  personCard:     { backgroundColor: C.forestDeep, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  personAvatar:   { width: 50, height: 50, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  personAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 20, fontWeight: '500' },
  personRel:      { fontSize: 9.5, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  personName:     { fontFamily: 'Georgia', fontSize: 18, color: '#fff', fontWeight: '400', marginTop: 1 },
  personSub:      { fontSize: 10.5, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  profileBtn:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  profileBtnText: { fontSize: 12.5, color: '#fff', fontWeight: '600' },

  // Sections
  sectionLabel:   { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  sectionAction:  { fontSize: 12, color: C.forest, fontWeight: '600' },

  // Quick action tiles
  tileGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile:           { width: '31%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 13, minHeight: 90 },
  tileIcon:       { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileLabel:      { fontSize: 13, fontWeight: '600', color: C.ink },
  tileSub:        { fontSize: 10, color: C.muted, marginTop: 2 },

  // Card container
  card:           { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  emptyCard:      { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 20, alignItems: 'center' },
  emptyCardText:  { fontSize: 13, color: C.mutedSoft },

  // Appointments
  apptRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  apptDot:        { width: 36, height: 36, borderRadius: 10, backgroundColor: C.sageSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  apptTitle:      { fontSize: 13.5, fontWeight: '500', color: C.ink },
  apptMeta:       { fontSize: 11, color: C.muted, marginTop: 2 },
  todayTag:       { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: C.terracottaSoft },
  todayTagText:   { fontSize: 9, fontWeight: '700', color: C.terracotta, letterSpacing: 0.4 },

  // Medication progress
  progressWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progressBg:     { flex: 1, height: 5, borderRadius: 99, backgroundColor: C.line, overflow: 'hidden' },
  progressFill:   { height: 5, borderRadius: 99, backgroundColor: C.forest },
  progressLabel:  { fontSize: 11, color: C.muted, flexShrink: 0 },

  readOnlyNote:   { fontSize: 11, color: C.mutedSoft, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  // Activity
  actRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14 },
  actDot:         { width: 32, height: 32, borderRadius: 9, backgroundColor: C.sageSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actTitle:       { fontSize: 13, fontWeight: '500', color: C.ink },
  actNote:        { fontSize: 11, color: C.muted, marginTop: 1 },
  actTime:        { fontSize: 10.5, color: C.mutedSoft, flexShrink: 0 },
});

// ─── Med row styles ──────────────────────────────────────────
const mr = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  circle:   { width: 28, height: 28, borderRadius: 99, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  name:     { fontSize: 13.5, fontWeight: '500', color: C.ink },
  dose:     { fontSize: 11, color: C.muted, marginTop: 1 },
  time:     { fontSize: 11.5, color: C.muted },
  statusTag: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.3 },
});

// ─── Log modal styles ────────────────────────────────────────
const lm = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  handle:    { width: 36, height: 4, borderRadius: 99, backgroundColor: C.line, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  head:      { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  medName:   { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500' },
  dose:      { fontSize: 13, color: C.muted, marginTop: 2 },
  time:      { fontSize: 12, color: C.mutedSoft },
  closeBtn:  { width: 32, height: 32, borderRadius: 10, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  btns:      { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  takenBtn:  { height: 52, borderRadius: 14, backgroundColor: C.forestDeep, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  takenText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  skipBtn:   { height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  skipText:  { fontSize: 15, fontWeight: '500', color: C.muted },
  noteWrap:  { paddingHorizontal: 20, paddingTop: 20 },
  noteLabel: { fontSize: 13.5, fontWeight: '600', color: C.ink, marginBottom: 10 },
  noteBox:   { borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.cream, padding: 14, minHeight: 80 },
  noteInput: { fontSize: 14, color: C.ink, lineHeight: 20 },
});
