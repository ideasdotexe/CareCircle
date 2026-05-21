import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Platform, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { IconBell, IconPlus, IconArrow, IconPill, IconPulse, IconDoc } from '../components/Icons';
import TabBar from '../components/TabBar';
import { supabase } from '../lib/supabase';

// ─── Design tokens (local aliases) ───────────────────────
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

// ─── SVG icons ────────────────────────────────────────────
function ICheck({ color = '#fff' }) {
  return (
    <Svg width={12} height={10} viewBox="0 0 12 10" fill="none">
      <Path d="M1 5l3 3 7-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IClose({ color = '#fff' }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Path d="M1 1l8 8M9 1L1 9" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function IClock({ color = C.mutedSoft }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      <Circle cx={5.5} cy={5.5} r={4.5} stroke={color} strokeWidth={1.2} />
      <Path d="M5.5 3v2.5L7 7" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}
function IArrowRight({ color = C.forest }) {
  return (
    <Svg width={12} height={10} viewBox="0 0 14 12" fill="none">
      <Path d="M1 6h12m0 0L8 1m5 5L8 11" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IFlask({ color = '#C7973A' }) {
  return (
    <Svg width={12} height={14} viewBox="0 0 14 16" fill="none">
      <Path d="M5 1v5L1 14a1 1 0 001 1h10a1 1 0 001-1L9 6V1" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 1h6" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function ISteth({ color = C.terracotta }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
      <Path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={13} cy={7} r={1.5} stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}
function IVideo({ color = C.forest }) {
  return (
    <Svg width={14} height={11} viewBox="0 0 16 12" fill="none">
      <Rect x={1} y={1} width={10} height={10} rx={2} stroke={color} strokeWidth={1.4} />
      <Path d="M11 4l4-2v8l-4-2" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────
function formatSlotTime(t) {
  if (!t) return null;
  const h = parseInt(t.split(':')[0], 10);
  const m = t.split(':')[1] ?? '00';
  const ampm = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${m} ${ampm}`;
}
function isSlotDue(slot) {
  if (!slot.time) return false;
  const now = new Date();
  const [h] = slot.time.split(':').map(Number);
  const due = new Date(); due.setHours(h, 0, 0, 0);
  return now > due;
}
function apptDaysUntil(iso) {
  if (!iso) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
function apptKindConfig(appt) {
  const text = ((appt.kind ?? appt.appointment_type ?? '')).toLowerCase();
  const map = {
    lab:        { iconBg: '#F5E4C9', iconColor: '#C7973A', Icon: IFlask },
    tele:       { iconBg: C.sageSoft, iconColor: C.forest,     Icon: IVideo },
    telehealth: { iconBg: C.sageSoft, iconColor: C.forest,     Icon: IVideo },
    visit:      { iconBg: C.terracottaSoft, iconColor: C.terracotta, Icon: ISteth },
    in_person:  { iconBg: C.terracottaSoft, iconColor: C.terracotta, Icon: ISteth },
  };
  if (text && map[text]) return map[text];
  const t = (appt.title ?? '').toLowerCase();
  if (/\blab\b|blood|panel|inr/.test(t)) return map.lab;
  if (/\btele|video|virtual/.test(t)) return map.tele;
  return { iconBg: C.terracottaSoft, iconColor: C.terracotta, Icon: ISteth };
}
function slotKey(slot) {
  return `${slot.name}_${slot.time ?? 'anytime'}`;
}
function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

// ─── Log modal (bottom sheet) ─────────────────────────────
function LogModal({ slot, onClose, onSave }) {
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState('choose'); // 'choose' | 'note'
  const [pendingStatus, setPendingStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, []);

  if (!slot) return null;
  const timeLabel = formatSlotTime(slot.time);

  const handleAction = (status) => {
    setPendingStatus(status);
    setPhase('note');
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(pendingStatus, note.trim());
    setSaving(false);
  };

  const handleBackdrop = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(onClose);
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleBackdrop}>
      <View style={ms.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={handleBackdrop} activeOpacity={1} />
        <Animated.View style={[ms.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={ms.handle} />

          {/* Header */}
          <View style={ms.sheetHead}>
            <View style={{ flex: 1 }}>
              <Text style={ms.sheetMedName}>{slot.name}</Text>
              {slot.dose ? <Text style={ms.sheetDose}>{slot.dose}</Text> : null}
              {timeLabel ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <IClock color={C.mutedSoft} />
                  <Text style={ms.sheetTime}>{timeLabel}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={ms.closeBtn} onPress={handleBackdrop}>
              <IClose color={C.muted} />
            </TouchableOpacity>
          </View>

          {phase === 'choose' ? (
            <View style={ms.chooseWrap}>
              <TouchableOpacity style={ms.takenBtn} onPress={() => handleAction('taken')} activeOpacity={0.85}>
                <ICheck color="#fff" />
                <Text style={ms.takenBtnText}>Mark as taken</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ms.skipBtn} onPress={() => handleAction('skipped')} activeOpacity={0.85}>
                <Text style={ms.skipBtnText}>Skip this dose</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={ms.noteWrap}>
              <Text style={ms.noteLabel}>
                {pendingStatus === 'taken' ? 'Add a note' : 'Reason for skipping'}
                <Text style={{ fontStyle: 'italic', color: C.mutedSoft }}> — optional</Text>
              </Text>
              <View style={ms.noteInput}>
                <TextInput
                  style={ms.noteInputText}
                  placeholder={pendingStatus === 'taken' ? 'e.g. taken with breakfast…' : 'e.g. felt nauseous, will take later…'}
                  placeholderTextColor={C.mutedSoft}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  autoFocus
                  autoCapitalize="sentences"
                />
              </View>
              <TouchableOpacity
                style={[ms.takenBtn, pendingStatus === 'skipped' && { backgroundColor: C.terracotta }, { marginTop: 14 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={ms.takenBtnText}>
                      {pendingStatus === 'taken' ? 'Save — marked taken' : 'Save — dose skipped'}
                    </Text>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhase('choose')} style={{ alignItems: 'center', paddingTop: 12 }}>
                <Text style={{ fontSize: 13, color: C.muted }}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Med reminder row ─────────────────────────────────────
function MedReminderRow({ slot, logEntry, isLast, isDue, onPress }) {
  const status = logEntry?.status ?? 'pending';
  const done = status === 'taken';
  const skipped = status === 'skipped';
  const timeLabel = formatSlotTime(slot.time);

  const circleBorder = done ? C.forest : skipped ? C.terracotta : isDue ? C.terracotta : C.line;
  const circleBg = done ? C.forest : 'transparent';

  return (
    <TouchableOpacity
      style={[ms2.row, !isLast && ms2.rowBorder, isDue && !done && !skipped && { backgroundColor: '#FFF8F2' }]}
      onPress={() => onPress(slot)}
      activeOpacity={0.72}
    >
      {/* Circle toggle */}
      <View style={[ms2.circle, { borderColor: circleBorder, backgroundColor: circleBg }]}>
        {done && <ICheck color="#fff" />}
        {skipped && <IClose color={C.terracotta} />}
      </View>

      {/* Name + dose + time */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
          <Text style={[ms2.name, (done || skipped) && { textDecorationLine: 'line-through', opacity: 0.55 }]}>
            {slot.name}
          </Text>
          {slot.dose ? (
            <Text style={[ms2.dose, (done || skipped) && { opacity: 0.55 }]}>{slot.dose}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {timeLabel ? (
            <>
              <IClock color={C.mutedSoft} />
              <Text style={ms2.time}>{timeLabel}</Text>
            </>
          ) : null}
          {/* By badge when logged */}
          {(done || skipped) && logEntry?.loggedAt ? (
            <>
              {timeLabel ? <Text style={{ color: C.mutedSoft, fontSize: 10 }}>·</Text> : null}
              <View style={[ms2.byDot, { backgroundColor: C.forestDeep }]}>
                <Text style={ms2.byDotText}>Y</Text>
              </View>
              <Text style={{ fontSize: 10.5, color: C.ink, fontWeight: '500' }}>
                {new Date(logEntry.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </>
          ) : null}
        </View>
        {/* Note preview */}
        {logEntry?.note ? (
          <Text style={ms2.notePreview} numberOfLines={1}>{logEntry.note}</Text>
        ) : null}
      </View>

      {/* Right side: Log → or badge */}
      {done ? null : skipped ? (
        <View style={ms2.skipBadge}>
          <Text style={ms2.skipBadgeText}>SKIP</Text>
        </View>
      ) : isDue ? (
        <View style={ms2.dueBadge}>
          <Text style={ms2.dueBadgeText}>DUE</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={ms2.logLink}>Log</Text>
          <IArrowRight color={C.forest} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Window group (Morning / Afternoon / Evening) ─────────
function WindowGroup({ label, slots, logMap, onPressSlot }) {
  const doneCount = slots.filter(s => logMap[slotKey(s)]?.status === 'taken').length;
  return (
    <View style={ms2.group}>
      <View style={ms2.groupHead}>
        <Text style={ms2.groupLabel}>{label.toUpperCase()}</Text>
        <Text style={ms2.groupCount}>{doneCount}/{slots.length}</Text>
      </View>
      <View style={ms2.card}>
        {slots.map((slot, i) => (
          <MedReminderRow
            key={slot.id || i}
            slot={slot}
            logEntry={logMap[slotKey(slot)] ?? null}
            isLast={i === slots.length - 1}
            isDue={isSlotDue(slot) && !logMap[slotKey(slot)]}
            onPress={onPressSlot}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Appointment card (matches design exactly) ────────────
function AppointmentCard({ a, soon }) {
  const date = a.appointment_date ? new Date(a.appointment_date) : null;
  const dayShort = date
    ? date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    : '';
  const dateStr = date
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const time = date && (date.getHours() !== 0 || date.getMinutes() !== 0)
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
  const { iconBg, iconColor, Icon } = apptKindConfig(a);

  return (
    <View style={[ac.card, soon && { backgroundColor: C.forestDeep, borderWidth: 0 }]}>
      {/* Header row: date label + kind icon */}
      <View style={ac.top}>
        <View style={[ac.dayChip, soon && { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <Text style={[ac.dayText, soon && { color: 'rgba(255,255,255,0.85)' }]}>
            {dayShort}{dateStr ? `, ${dateStr}` : ''}
          </Text>
        </View>
        <View style={[ac.iconBadge, { backgroundColor: soon ? 'rgba(255,255,255,0.12)' : iconBg }]}>
          <Icon color={soon ? '#fff' : iconColor} />
        </View>
      </View>

      {/* Title */}
      <Text style={[ac.title, soon && { color: '#fff' }]} numberOfLines={2}>
        {a.title || 'Appointment'}
      </Text>

      <View style={{ flex: 1 }} />

      {/* Footer: time + provider/location */}
      <Text style={[ac.meta, soon && { color: 'rgba(255,255,255,0.75)' }]} numberOfLines={2}>
        {time ? <Text style={{ fontWeight: '600' }}>{time}</Text> : null}
        {time && (a.provider || a.location) ? ' · ' : null}
        {a.provider || a.location || ''}
      </Text>
    </View>
  );
}

// ─── Activity row ─────────────────────────────────────────
function ActivityRow({ item, isLast }) {
  const flagged = item.flagged;
  const kind = item.activity_type || item.type || 'note';
  const Ico = kind === 'medication' || kind === 'med' ? IconPill
    : kind === 'vital' ? IconPulse : IconDoc;
  return (
    <View style={[st.actRow, !isLast && st.actRowBorder]}>
      <View style={[st.actIcon, { backgroundColor: flagged ? '#FBE3D9' : C.sageSoft }]}>
        <Ico color={flagged ? C.terracotta : C.forest} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={st.actTitle}>{item.title || item.description || 'Activity'}</Text>
          <Text style={st.actTime}>
            {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
          </Text>
        </View>
        {!!item.note && <Text style={[st.actNote, flagged && { color: C.terracotta }]}>{item.note}</Text>}
        {!!item.actor_name && (
          <Text style={st.actAuthor}>
            <Text style={{ color: C.ink, fontWeight: '600' }}>{item.actor_name}</Text>
            {' · '}{item.actor_role || 'family'}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [persons, setPersons] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [meds, setMeds] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [logMap, setLogMap] = useState({}); // { slotKey: { status, note, loggedAt } }
  const [logTarget, setLogTarget] = useState(null); // slot being logged
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(p);
      const { data: pp } = await supabase.from('persons').select('*').eq('user_id', user.id).order('created_at');
      setPersons(pp || []);
      // Backfill owner_name on old caregiver_requests that are missing it
      const ownerName = p?.full_name || '';
      if (ownerName) {
        supabase
          .from('caregiver_requests')
          .update({ owner_name: ownerName })
          .eq('owner_id', user.id)
          .then(() => {}).catch(() => {});
      }
    } catch (e) {
      console.error('[Dashboard] loadData:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  useEffect(() => {
    const active = persons[activeIdx];
    if (!active) {
      setMeds([]); setSchedules([]); setAppointments([]); setActivity([]); setLogMap({});
      return;
    }
    (async () => {
      // Medications
      try {
        const { data: m } = await supabase.from('medications').select('*').eq('person_id', active.id).eq('active', true);
        setMeds(m || []);
      } catch (_) { setMeds([]); }
      // Schedules
      try {
        const { data: sc } = await supabase.from('medication_schedules').select('medication_name, times, frequency_type, food_instruction').eq('person_id', active.id).eq('active', true);
        setSchedules(sc || []);
      } catch (_) { setSchedules([]); }
      // Appointments
      try {
        const { data: a } = await supabase.from('appointments').select('*').eq('person_id', active.id).order('appointment_date');
        setAppointments(a || []);
      } catch (_) { setAppointments([]); }
      // Activity
      try {
        const { data: act } = await supabase.from('activity_log').select('*').eq('person_id', active.id).order('created_at', { ascending: false }).limit(5);
        setActivity(act || []);
      } catch (_) { setActivity([]); }
      // Today's medication logs
      try {
        const today = todayDateStr();
        const { data: logs } = await supabase.from('medication_logs').select('*').eq('person_id', active.id).eq('log_date', today);
        const map = {};
        for (const l of logs ?? []) {
          const key = `${l.medication_name}_${l.scheduled_time ?? 'anytime'}`;
          map[key] = { status: l.status, note: l.note ?? '', loggedAt: l.logged_at };
        }
        setLogMap(map);
      } catch (_) { setLogMap({}); }
    })();
  }, [persons, activeIdx]);

  // ── Build dose slots ──────────────────────────────────
  const scheduleMap = {};
  for (const sc of schedules) scheduleMap[sc.medication_name] = sc;

  const todayDoseSlots = [];
  for (const med of meds) {
    const sc = scheduleMap[med.name];
    if (sc && sc.times && sc.times.length > 0) {
      for (const t of sc.times) {
        todayDoseSlots.push({ id: `${med.id}_${t}`, medId: med.id, name: med.name, dose: med.dose, time: t, food: sc.food_instruction });
      }
    } else {
      todayDoseSlots.push({ id: med.id, medId: med.id, name: med.name, dose: med.dose, time: null, food: null });
    }
  }
  todayDoseSlots.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const takenCount = todayDoseSlots.filter(s => logMap[slotKey(s)]?.status === 'taken').length;
  const pendingCount = todayDoseSlots.filter(s => !logMap[slotKey(s)]).length;
  const dueCount = todayDoseSlots.filter(s => !logMap[slotKey(s)] && isSlotDue(s)).length;

  function slotWindow(t) {
    if (!t) return 'anytime';
    const h = parseInt(t.split(':')[0], 10);
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
  const morningSlots    = todayDoseSlots.filter(s => slotWindow(s.time) === 'morning');
  const afternoonSlots  = todayDoseSlots.filter(s => slotWindow(s.time) === 'afternoon');
  const eveningSlots    = todayDoseSlots.filter(s => slotWindow(s.time) === 'evening');
  const anytimeSlots    = todayDoseSlots.filter(s => slotWindow(s.time) === 'anytime');

  const now2 = new Date();
  const upcomingAppts = appointments.filter(a => a.appointment_date && new Date(a.appointment_date) >= now2);
  const nextAppt = upcomingAppts[0] ?? null;

  const greeting = profile?.first_name ? `Hello, ${profile.first_name}` : 'Hello';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const profileIncomplete = persons[activeIdx] && (!persons[activeIdx].date_of_birth || !persons[activeIdx].address);
  const active = persons[activeIdx];

  // ── Log handler ───────────────────────────────────────
  const handleLog = async (status, note) => {
    if (!logTarget || !active) return;
    const key = slotKey(logTarget);
    const loggedAt = new Date().toISOString();

    // Optimistic update
    setLogMap(prev => ({ ...prev, [key]: { status, note, loggedAt } }));
    setLogTarget(null);

    // Supabase write
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const today = todayDateStr();
      const hasTime = logTarget.time != null && logTarget.time !== '';
      // Only include columns that are confirmed to exist in medication_logs
      const payload = {
        person_id: active.id,
        medication_name: logTarget.name,
        scheduled_time: hasTime ? logTarget.time : null,
        log_date: today,
        status,
        note: note || null,
      };

      // Find existing log — must use .is() for NULL scheduled_time (not .eq())
      let checkQuery = supabase
        .from('medication_logs')
        .select('id')
        .eq('person_id', active.id)
        .eq('medication_name', logTarget.name)
        .eq('log_date', today);
      checkQuery = hasTime
        ? checkQuery.eq('scheduled_time', logTarget.time)
        : checkQuery.is('scheduled_time', null);
      const { data: existing, error: checkErr } = await checkQuery.maybeSingle();

      let writeError;
      if (existing?.id) {
        const { error } = await supabase
          .from('medication_logs')
          .update({ status, note: note || null })
          .eq('id', existing.id);
        writeError = error;
      } else {
        const { error } = await supabase.from('medication_logs').insert(payload);
        writeError = error;
      }

      if (writeError) {
        console.error('medication_logs write failed:', writeError.message);
        // Revert optimistic update so user knows it didn't save
        setLogMap(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        Alert.alert('Could not save', 'The log could not be saved. Please try again.');
        return;
      }

      // Log to activity_log (best-effort)
      try {
        await supabase.from('activity_log').insert({
          person_id: active.id,
          user_id: user?.id,
          activity_type: 'medication',
          title: status === 'taken' ? `${logTarget.name} taken` : `${logTarget.name} skipped`,
          note: note || null,
        });
      } catch (_) {}
    } catch (e) {
      console.error('handleLog error:', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={st.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={C.forest} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* ── Top bar ── */}
      <View style={st.topBar}>
        <View>
          <Text style={st.dateStr}>{dateStr}</Text>
          <Text style={st.greeting}>{greeting}</Text>
        </View>
        <TouchableOpacity style={st.bellPill} onPress={() => navigation.navigate('OwnerNotifications')}>
          <IconBell />
          {dueCount > 0 && <View style={st.bellDot} />}
        </TouchableOpacity>
      </View>

      {/* ── Status line ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Text style={st.statusLine}>
          {dueCount > 0 ? (
            <Text>
              <Text style={{ color: C.terracotta, fontWeight: '600' }}>
                {dueCount} medication{dueCount > 1 ? 's' : ''} due
              </Text>
              {nextAppt ? ` · next visit ${nextAppt.title || 'soon'}` : ''}
            </Text>
          ) : nextAppt ? (
            <Text>
              All caught up on doses.{' '}
              {apptDaysUntil(nextAppt.appointment_date) === 0
                ? <Text style={{ color: C.terracotta, fontWeight: '600' }}>Appointment today.</Text>
                : <Text>Next: <Text style={{ color: C.ink, fontWeight: '600' }}>{nextAppt.title || 'visit'}</Text>.</Text>
              }
            </Text>
          ) : 'All caught up. Nothing scheduled.'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── Person chips ── */}
        {persons.length > 0 && (
          <View style={st.personRow}>
            {persons.map((p, i) => {
              const isActive = i === activeIdx;
              const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
              return (
                <TouchableOpacity key={p.id} onPress={() => setActiveIdx(i)}
                  style={[st.personChip, isActive && st.personChipActive]}>
                  <View style={[st.personInit, { backgroundColor: tint }]}>
                    <Text style={st.personInitText}>{(p.name || p.first_name || '?')[0]}</Text>
                  </View>
                  <View>
                    <Text style={[st.personChipName, isActive && { color: '#fff' }]}>
                      {p.name || p.first_name}
                    </Text>
                    <Text style={[st.personChipRel, isActive && { color: 'rgba(255,255,255,0.65)' }]}>
                      {p.relationship || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={st.addPersonChip} onPress={() => navigation.navigate('AddPerson')}>
              <IconPlus color={C.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Profile banner ── */}
        {active && profileIncomplete && (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <TouchableOpacity style={st.banner} onPress={() => navigation.navigate('Profile', { personId: active.id })}>
              <View style={st.bannerIcon}><Text style={st.bannerPct}>50%</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={st.bannerTitle}>Complete {active.name || active.first_name}'s profile</Text>
                <Text style={st.bannerSub}>Add date of birth, address, conditions</Text>
              </View>
              <IconArrow color={C.forestDeep} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Coming up ── */}
        <View style={{ paddingTop: 24, paddingHorizontal: 20 }}>
          <View style={st.sectionHead}>
            <Text style={st.sectionTitle}>Coming up</Text>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              {active && (
                <TouchableOpacity onPress={() => navigation.navigate('AddAppointment', { personId: active.id, personName: active.name || active.first_name })}>
                  <Text style={[st.sectionAction, { color: C.terracotta }]}>+ Schedule</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => active && navigation.navigate('AppointmentsScreen', { personId: active.id })}>
                <Text style={st.sectionAction}>Calendar →</Text>
              </TouchableOpacity>
            </View>
          </View>
          {upcomingAppts.length === 0 ? (
            <TouchableOpacity
              style={st.emptyCard}
              onPress={() => active && navigation.navigate('AddAppointment', { personId: active.id, personName: active.name || active.first_name })}
              activeOpacity={0.75}
            >
              <Text style={st.emptyText}>No upcoming appointments.</Text>
              <Text style={st.emptyAction}>Schedule a visit →</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 2 }}>
              {upcomingAppts.slice(0, 5).map((a, i) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => active && navigation.navigate('AppointmentsScreen', { personId: active.id })}
                  activeOpacity={0.82}
                >
                  <AppointmentCard a={a} soon={i === 0} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Today's medications ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={st.sectionHead}>
            <Text style={st.sectionTitle}>Today's medications</Text>
            <TouchableOpacity onPress={() => active && navigation.navigate('Medications', { personId: active.id })}>
              <Text style={st.sectionAction}>All meds →</Text>
            </TouchableOpacity>
          </View>

          {todayDoseSlots.length === 0 ? (
            <View style={st.emptyCard}>
              <Text style={st.emptyText}>No medications scheduled today.</Text>
              {active && (
                <TouchableOpacity onPress={() => navigation.navigate('Medications', { personId: active.id })}>
                  <Text style={st.emptyAction}>Add a medication</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              {/* Progress strip */}
              <View style={st.progressCard}>
                <View style={{ flex: 1 }}>
                  <Text style={st.progressTitle}>{takenCount} of {todayDoseSlots.length} taken</Text>
                  <View style={st.progressBar}>
                    <View style={[st.progressFill, { width: `${(takenCount / Math.max(1, todayDoseSlots.length)) * 100}%` }]} />
                  </View>
                </View>
                {dueCount > 0 ? (
                  <View style={[st.statusChip, { backgroundColor: C.terracottaSoft }]}>
                    <Text style={[st.statusChipText, { color: C.terracotta }]}>{dueCount} DUE</Text>
                  </View>
                ) : (
                  <View style={[st.statusChip, { backgroundColor: C.sageSoft }]}>
                    <Text style={[st.statusChipText, { color: C.forest }]}>ON TRACK</Text>
                  </View>
                )}
              </View>

              {/* Grouped windows */}
              {morningSlots.length > 0 && (
                <WindowGroup label="Morning" slots={morningSlots} logMap={logMap} onPressSlot={setLogTarget} />
              )}
              {afternoonSlots.length > 0 && (
                <WindowGroup label="Afternoon" slots={afternoonSlots} logMap={logMap} onPressSlot={setLogTarget} />
              )}
              {eveningSlots.length > 0 && (
                <WindowGroup label="Evening" slots={eveningSlots} logMap={logMap} onPressSlot={setLogTarget} />
              )}
              {anytimeSlots.length > 0 && (
                <WindowGroup
                  label={(morningSlots.length + afternoonSlots.length + eveningSlots.length) === 0 ? 'Today' : 'As needed'}
                  slots={anytimeSlots} logMap={logMap} onPressSlot={setLogTarget}
                />
              )}
            </View>
          )}
        </View>

        {/* ── Recent activity ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={st.sectionHead}>
            <Text style={st.sectionTitle}>Recent activity</Text>
            <TouchableOpacity onPress={() => active && navigation.navigate('ActivityFeed', { personId: active.id })}>
              <Text style={st.sectionAction}>Full feed →</Text>
            </TouchableOpacity>
          </View>
          <View style={st.listCard}>
            {activity.length === 0 ? (
              <View style={{ padding: 22 }}>
                <Text style={{ fontSize: 12.5, color: C.muted, textAlign: 'center' }}>Nothing logged recently.</Text>
              </View>
            ) : activity.map((it, i) => (
              <ActivityRow key={it.id || i} item={it} isLast={i === activity.length - 1} />
            ))}
          </View>
        </View>

        {/* Footer divider */}
        <View style={{ paddingHorizontal: 24, paddingTop: 22, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
          <Text style={{ fontSize: 10.5, color: C.mutedSoft, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            That's everything for now
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        </View>

      </ScrollView>

      <TabBar active={0} navigation={navigation} />

      {/* ── Log modal ── */}
      {logTarget && (
        <LogModal
          slot={logTarget}
          onClose={() => setLogTarget(null)}
          onSave={handleLog}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Appointment card styles ──────────────────────────────
const ac = StyleSheet.create({
  card: {
    width: 236, backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: C.line,
    padding: 14, minHeight: 132,
    flexDirection: 'column', gap: 10,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    backgroundColor: C.cream,
  },
  dayText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.5, color: C.muted },
  iconBadge: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: {
    fontFamily: 'Georgia', fontSize: 16.5, lineHeight: 20,
    fontWeight: '500', letterSpacing: -0.3, color: C.forestDeep,
  },
  meta: { fontSize: 11.5, lineHeight: 15, color: C.muted },
});

// ─── Med row styles ───────────────────────────────────────
const ms2 = StyleSheet.create({
  group: { marginBottom: 10 },
  groupHead: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
    paddingHorizontal: 4, paddingBottom: 8,
  },
  groupLabel: { fontSize: 10.5, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  groupCount: {
    fontSize: 10, color: C.mutedSoft, fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  circle: {
    width: 28, height: 28, borderRadius: 99, flexShrink: 0,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 14, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  dose: { fontSize: 11.5, color: C.muted },
  time: { fontSize: 11, color: C.muted },
  byDot: {
    width: 14, height: 14, borderRadius: 99,
    alignItems: 'center', justifyContent: 'center',
  },
  byDotText: { fontFamily: 'Georgia', fontSize: 8, color: '#fff', fontWeight: '500' },
  notePreview: { fontSize: 10.5, color: C.mutedSoft, marginTop: 2, fontStyle: 'italic' },
  logLink: { fontSize: 12.5, color: C.forest, fontWeight: '600' },
  skipBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    backgroundColor: C.terracottaSoft,
  },
  skipBadgeText: { fontSize: 9.5, fontWeight: '700', color: C.terracotta, letterSpacing: 0.4 },
  dueBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    backgroundColor: C.terracotta,
  },
  dueBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
});

// ─── Log modal styles ─────────────────────────────────────
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,25,22,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 99, backgroundColor: C.line,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHead: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: C.lineSoft,
    marginBottom: 18,
  },
  sheetMedName: { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, fontWeight: '500' },
  sheetDose: { fontSize: 13, color: C.muted, marginTop: 2 },
  sheetTime: { fontSize: 11.5, color: C.muted },
  closeBtn: {
    width: 32, height: 32, borderRadius: 99,
    backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center',
  },
  chooseWrap: { gap: 10, paddingBottom: 4 },
  takenBtn: {
    height: 52, backgroundColor: C.forestDeep, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  takenBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  skipBtn: {
    height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.terracotta,
    alignItems: 'center', justifyContent: 'center',
  },
  skipBtnText: { fontSize: 15, fontWeight: '600', color: C.terracotta },
  noteWrap: { paddingBottom: 4 },
  noteLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  noteInput: {
    backgroundColor: C.cream, borderRadius: 12,
    borderWidth: 1, borderColor: C.line,
    padding: 12, minHeight: 72,
  },
  noteInputText: { fontSize: 14, color: C.ink, lineHeight: 20 },
});

// ─── Main styles ──────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 14,
  },
  dateStr: { fontSize: 12.5, color: C.muted },
  greeting: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 30, color: C.forestDeep, fontWeight: '400', marginTop: 2 },
  bellPill: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center',
  },
  bellDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 99, backgroundColor: C.terracotta },
  statusLine: { fontSize: 13.5, color: C.muted, lineHeight: 18 },

  personRow: { paddingHorizontal: 20, paddingTop: 18, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  personChip: { height: 40, paddingHorizontal: 14, paddingLeft: 4, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8 },
  personChipActive: { borderColor: C.forestDeep, backgroundColor: C.forestDeep },
  personInit: { width: 30, height: 30, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  personInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  personChipName: { fontSize: 13, fontWeight: '500', color: C.ink, lineHeight: 14 },
  personChipRel: { fontSize: 9.5, color: C.muted, marginTop: 2 },
  addPersonChip: { width: 40, height: 40, borderRadius: 99, borderWidth: 1, borderColor: C.mutedSoft, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },

  banner: { backgroundColor: C.terracottaSoft, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center' },
  bannerPct: { fontFamily: 'Georgia', fontSize: 12, color: '#fff', fontWeight: '600' },
  bannerTitle: { fontSize: 13.5, fontWeight: '600', color: C.forestDeep },
  bannerSub: { fontSize: 11.5, color: '#5d3a2c', marginTop: 2 },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 19, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  sectionAction: { fontSize: 12, color: C.forest, fontWeight: '500' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 22, alignItems: 'center' },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center' },
  emptyAction: { marginTop: 8, fontSize: 13, color: C.forest, fontWeight: '600' },

  progressCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  progressBar: { marginTop: 6, height: 5, backgroundColor: C.line, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.forest, borderRadius: 99 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  statusChipText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.4 },

  listCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },

  actRow: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  actRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  actIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 13, fontWeight: '600', color: C.ink, flex: 1 },
  actTime: { fontSize: 10.5, color: C.mutedSoft, marginLeft: 8 },
  actNote: { marginTop: 2, fontSize: 11.5, color: C.muted, lineHeight: 15 },
  actAuthor: { marginTop: 5, fontSize: 10.5, color: C.muted },
});
