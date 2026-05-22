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
  terracotta: '#C66E4E', terracottaSoft: '#FBE3D9', terracottaBorder: '#F2C9B8',
  sageSoft: '#DDE4D6', sage: '#A8B5A0',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ─── Icons ──────────────────────────────────────────────────
function IBell() {
  return (
    <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
      <Path d="M8 1.5v1.5M3 7a5 5 0 1110 0v3l1 2.5H2L3 10V7z" stroke={C.ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IShield() {
  return (
    <Svg width={11} height={13} viewBox="0 0 12 13" fill="none">
      <Path d="M6 1L1 3.5v3C1 9.5 3.5 12 6 13c2.5-1 5-3.5 5-6.5v-3L6 1z" stroke={C.terracotta} strokeWidth={1.3} fill="none" />
    </Svg>
  );
}
function IWarn() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="#fff">
      <Path d="M6 1l5 10H1L6 1z" />
    </Svg>
  );
}
function IPill({ color = C.forest }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Rect x={1} y={4.5} width={12} height={5} rx={2.5} stroke={color} strokeWidth={1.3} />
      <Path d="M7 4.5v5" stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}
function IPulse({ color = C.forest }) {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <Path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function INote({ color = C.forest }) {
  return (
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M1.5 1h7l3.5 3.5V13h-10.5V1z" stroke={color} strokeWidth={1.3} strokeLinejoin="round" />
      <Path d="M4 7h5M4 10h4" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
function IClock({ color = C.mutedSoft }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Circle cx={6} cy={6} r={5} stroke={color} strokeWidth={1.3} />
      <Path d="M6 3v3.2L8 7.5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
function IPin({ color = C.mutedSoft }) {
  return (
    <Svg width={11} height={13} viewBox="0 0 11 13" fill="none">
      <Path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={color} strokeWidth={1.3} />
      <Circle cx={5.5} cy={5} r={1.5} stroke={color} strokeWidth={1.3} />
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
function IDots({ color = C.muted }) {
  return (
    <Svg width={22} height={6} viewBox="0 0 22 6">
      <Circle cx={3} cy={3} r={2} fill={color} />
      <Circle cx={11} cy={3} r={2} fill={color} />
      <Circle cx={19} cy={3} r={2} fill={color} />
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

// ─── Person Avatar ───────────────────────────────────────────
function PersonAvatar({ name, tint, size = 46 }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: 99, flexShrink: 0,
      backgroundColor: tint, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: size * 0.38, color: '#fff', fontWeight: '500' }}>
        {(name || '?')[0].toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Sub-section header ──────────────────────────────────────
function SubHead({ icon: Icon, label, count, color = C.forest }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: C.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon color={color} />
      </View>
      <Text style={{ fontSize: 10.5, fontWeight: '700', color: C.forestDeep, letterSpacing: 0.3, textTransform: 'uppercase' }}>
        {label}
      </Text>
      {count != null && (
        <Text style={{ fontSize: 10.5, color: C.mutedSoft }}>· {count}</Text>
      )}
    </View>
  );
}

// ─── Med Row (visit card) ────────────────────────────────────
function MedSlotRow({ slot, log, isLast, onPress }) {
  const status = log?.status ?? 'pending';
  const done = status === 'taken';
  const skipped = status === 'skipped';
  const due = isDue(slot.time);
  return (
    <TouchableOpacity
      style={[vc.medRow, !isLast && vc.rowBorder, due && !done && !skipped && { backgroundColor: '#FFF8F2' }]}
      onPress={onPress} activeOpacity={0.8}
    >
      <View style={[vc.medCircle, {
        backgroundColor: done ? C.forest : 'transparent',
        borderColor: done ? C.forest : skipped ? C.terracotta : due ? C.terracotta : C.line,
      }]}>
        {done && <ICheck />}
        {skipped && <IClose color={C.terracotta} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={[vc.medName, (done || skipped) && { color: C.mutedSoft }]}>{slot.name}</Text>
          {!!slot.dose && <Text style={vc.medDose}>{slot.dose}</Text>}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {slot.time && (
          <View style={vc.timeTag}>
            <Text style={vc.timeTagText}>{fmtTime(slot.time)}</Text>
          </View>
        )}
        {done && <Text style={[vc.statusTag, { color: C.forest }]}>Taken</Text>}
        {skipped && <Text style={[vc.statusTag, { color: C.terracotta }]}>Skipped</Text>}
        {!done && !skipped && due && <Text style={[vc.statusTag, { color: C.terracotta }]}>Due</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Visit Card ──────────────────────────────────────────────
function VisitCard({ person, perms, slots, logMap, appointments, activity, onLogPress, onVisitPress, navigation }) {
  const isNext = true; // first person is always "next" for simplicity
  const takenCount = slots.filter(s => logMap[slotKey(s)]?.status === 'taken').length;
  const pendingMeds = slots.filter(s => !logMap[slotKey(s)]).length;
  const tint = '#3F5D54';
  const todayAppts = appointments.filter(a => daysUntil(a.appointment_date) === 0);
  const allergies = person.allergies ? (typeof person.allergies === 'string' ? person.allergies.split(',').map(s => s.trim()) : person.allergies) : [];
  const conditions = person.conditions ? (typeof person.conditions === 'string' ? person.conditions.split(',').map(s => s.trim()) : person.conditions) : [];
  const recentNotes = activity.filter(a => a.activity_type === 'note' || a.activity_type === 'visit_note').slice(0, 2);

  return (
    <View style={vc.card}>
      {/* Status ribbon */}
      <View style={{ height: 5, backgroundColor: isNext ? C.forestDeep : C.lineSoft }} />

      {/* Visit header */}
      <View style={{ padding: 14, paddingBottom: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <PersonAvatar name={person.name} tint={tint} size={46} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={vc.personName}>{person.name}</Text>
            {!!person.date_of_birth && (
              <Text style={vc.personAge}>
                · {new Date().getFullYear() - new Date(person.date_of_birth).getFullYear()}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IClock />
              <Text style={vc.metaText}>Today's visit</Text>
            </View>
            {!!person.address && (
              <>
                <Text style={{ color: C.line }}>·</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <IPin />
                  <Text style={vc.metaText} numberOfLines={1}>
                    {person.address.split(',')[0] || person.address}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        <View style={vc.nextBadge}>
          <Text style={vc.nextBadgeText}>UP NEXT</Text>
        </View>
      </View>

      {/* Allergies — always visible, safety-critical */}
      {allergies.length > 0 && (
        <View style={{ padding: 14, paddingBottom: 0 }}>
          <View style={vc.allergyBox}>
            <View style={vc.allergyIcon}>
              <IWarn />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={vc.allergyLabel}>ALLERGIES</Text>
              <Text style={vc.allergyText}>{allergies.join(' · ')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Conditions chips */}
      {conditions.length > 0 && (
        <View style={{ paddingHorizontal: 14, paddingTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {conditions.map((c, i) => (
            <View key={i} style={vc.condChip}>
              <Text style={vc.condChipText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Today appointments */}
      {perms.appointments?.view && todayAppts.length > 0 && (
        <View style={{ padding: 14, paddingBottom: 0 }}>
          <SubHead icon={({ color }) => (
            <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
              <Rect x={0.5} y={2} width={12} height={10} rx={1.5} stroke={color} strokeWidth={1.3} />
              <Path d="M0.5 5.5h12M4 0.5v2M9 0.5v2" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
            </Svg>
          )} label="Today's appointments" count={todayAppts.length} />
          <View style={vc.innerCard}>
            {todayAppts.map((a, i) => (
              <View key={a.id} style={[{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }, i < todayAppts.length - 1 && vc.rowBorder]}>
                <View style={[vc.apptDot, { backgroundColor: C.terracottaSoft }]}>
                  <Text style={{ fontSize: 11 }}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: C.ink }}>{a.title || 'Appointment'}</Text>
                  <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                    {a.time ? fmtTime(a.time) : 'Today'}
                    {a.location ? ` · ${a.location}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Medications */}
      {perms.medications?.view && (
        <View style={{ padding: 14, paddingBottom: 0 }}>
          <SubHead
            icon={IPill}
            label="Medications"
            count={slots.length > 0 ? `${takenCount}/${slots.length} given` : undefined}
          />
          {slots.length === 0 ? (
            <View style={[vc.innerCard, { padding: 12 }]}>
              <Text style={{ fontSize: 12, color: C.mutedSoft, textAlign: 'center' }}>No medications on schedule</Text>
            </View>
          ) : (
            <View style={vc.innerCard}>
              {slots.map((slot, i) => (
                <MedSlotRow
                  key={slot.id}
                  slot={slot}
                  log={logMap[slotKey(slot)]}
                  isLast={i === slots.length - 1}
                  onPress={() => {
                    if (!perms.medications.contribute) return;
                    const s = logMap[slotKey(slot)]?.status;
                    if (s === 'taken' || s === 'skipped') return;
                    onLogPress(slot);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Notes from family */}
      {recentNotes.length > 0 && (
        <View style={{ padding: 14, paddingBottom: 0 }}>
          <SubHead icon={INote} label="Notes from family" count={recentNotes.length} />
          {recentNotes.map((n, i) => (
            <View key={n.id || i} style={vc.noteRow}>
              <Text style={vc.noteFrom}>{n.actor_name || 'Family'}</Text>
              <Text style={vc.noteBody} numberOfLines={3}>{n.note || n.title || ''}</Text>
            </View>
          ))}
        </View>
      )}

      {/* CTA buttons */}
      <View style={{ padding: 14, flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={[vc.ctaBtn, { backgroundColor: C.forestDeep, flex: 1 }]}
          onPress={onVisitPress}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Start visit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={vc.dotsBtn} activeOpacity={0.8}>
          <IDots />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ────────────────────────────────────────────
export default function CaregiverTodayScreen({ navigation }) {
  const [profile, setProfile]           = useState(null);
  const [persons, setPersons]           = useState([]);
  const [activeIdx, setActiveIdx]       = useState(0);
  const [permMap, setPermMap]           = useState({});
  const [meds, setMeds]                 = useState([]);
  const [schedules, setSchedules]       = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity]         = useState([]);
  const [logMap, setLogMap]             = useState({});
  const [logTarget, setLogTarget]       = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const activePersonIdRef               = useRef(null);

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

      // Fallback: accepted caregiver_requests (when caregiver_relationships insert failed or not yet created)
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

      setPermMap(pm);

      if (personIds.length) {
        const { data: ps } = await supabase.from('persons').select('*').in('id', personIds);
        setPersons(ps || []);
      } else {
        setPersons([]);
      }

      // Badge count
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
    if (!person) {
      setMeds([]); setSchedules([]); setAppointments([]); setActivity([]); setLogMap({});
      activePersonIdRef.current = null;
      return;
    }

    const personChanged = activePersonIdRef.current !== person.id;
    activePersonIdRef.current = person.id;

    (async () => {
      const today = todayStr();
      const queries = [
        supabase.from('medications').select('*').eq('person_id', person.id).eq('active', true)
          .then(({ data }) => setMeds(data || [])),
        supabase.from('medication_schedules').select('medication_name, times, frequency_type, food_instruction').eq('person_id', person.id).eq('active', true)
          .then(({ data }) => setSchedules(data || [])).catch(() => {}),
        supabase.from('appointments').select('*').eq('person_id', person.id).gte('appointment_date', today).order('appointment_date').limit(5)
          .then(({ data }) => setAppointments(data || [])),
        supabase.from('activity_log').select('*').eq('person_id', person.id).order('created_at', { ascending: false }).limit(8)
          .then(({ data }) => setActivity(data || [])),
      ];

      // Only reload logMap when switching to a different person.
      // Reads from activity_log — no constraint issues, already has correct RLS.
      if (personChanged) {
        queries.push(
          supabase
            .from('activity_log')
            .select('payload')
            .eq('person_id', person.id)
            .eq('action_type', 'medication')
            .gte('created_at', today + 'T00:00:00Z')
            .lte('created_at', today + 'T23:59:59Z')
            .then(({ data }) => {
              const map = {};
              for (const row of data ?? []) {
                const p = row.payload || {};
                if (p.log_date === today && p.medication_name) {
                  const k = `${p.medication_name}_${p.scheduled_time ?? 'anytime'}`;
                  // Keep most recent status if same med logged twice
                  map[k] = { status: p.status, note: p.note ?? '' };
                }
              }
              setLogMap(map);
            })
        );
      }

      await Promise.allSettled(queries);
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

  const takenCount = slots.filter(s => logMap[slotKey(s)]?.status === 'taken').length;

  // ── Log handler — writes to activity_log (no constraint issues) ──────
  const handleLog = async (status, note) => {
    if (!logTarget || !persons[activeIdx]) return;
    const key      = slotKey(logTarget);
    const personId = persons[activeIdx].id;
    const target   = { ...logTarget };

    // Optimistic update first so UI feels instant
    setLogMap(prev => ({ ...prev, [key]: { status, note } }));
    setLogTarget(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const cgName = profile?.full_name || '';

      const { error } = await supabase.from('activity_log').insert({
        actor_id:    user.id,
        actor_name:  cgName,
        action_type: 'medication',
        person_id:   personId,
        payload: {
          medication_name: target.name,
          scheduled_time:  target.time || null,
          log_date:        todayStr(),
          status,
          note:            note || null,
        },
      });

      if (error) {
        setLogMap(prev => { const n = { ...prev }; delete n[key]; return n; });
        console.error('activity_log save failed:', error.message);
      }
    } catch (e) {
      setLogMap(prev => { const n = { ...prev }; delete n[key]; return n; });
      console.error('activity_log save error:', e.message || e);
    }
  };

  const person  = persons[activeIdx];
  const perms   = person ? (permMap[person.id] || parsePerms(null)) : parsePerms(null);
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const name    = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={sc.container} edges={['top']}>
      {/* Mode strip */}
      <View style={sc.modeStrip} />

      {/* Top bar */}
      <View style={sc.topBar}>
        <View>
          <View style={sc.modeTag}>
            <IShield />
            <Text style={sc.modeTagText}>CAREGIVER PORTAL</Text>
          </View>
          <Text style={sc.greeting}>Hello, {name}</Text>
          <Text style={sc.dateStr}>
            {dateStr} · {persons.length} {persons.length === 1 ? 'visit' : 'visits'} scheduled
          </Text>
        </View>
        <TouchableOpacity
          style={sc.bellBtn}
          onPress={() => navigation.navigate('CaregiverNotifications')}
        >
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
          <Text style={sc.emptyTitle}>No visits today</Text>
          <Text style={sc.emptySub}>
            When a family assigns you to a person, they'll appear here.{'\n'}
            Check Notifications for any pending requests.
          </Text>
          <TouchableOpacity
            style={sc.emptyBtn}
            onPress={() => navigation.navigate('CaregiverNotifications')}
          >
            <Text style={sc.emptyBtnText}>View notifications</Text>
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
            style={{ flexShrink: 0 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, gap: 8, flexDirection: 'row' }}
          >
            {persons.map((p, i) => {
              const active = i === activeIdx;
              const tint = i % 2 === 0 ? '#3F5D54' : '#C66E4E';
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setActiveIdx(i)}
                  style={[sc.chip, active && sc.chipActive]}
                >
                  <View style={[sc.chipInit, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : tint }]}>
                    <Text style={sc.chipInitText}>{(p.name || '?')[0].toUpperCase()}</Text>
                  </View>
                  <Text style={[sc.chipName, active && { color: '#fff' }]}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Next visit summary strip */}
          {person && (
            <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
              <View style={sc.summaryCard}>
                <View style={[sc.summaryIcon]}>
                  <IClock color={C.forest} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sc.summaryText}>
                    Current visit · <Text style={{ color: C.ink, fontWeight: '600' }}>{person.name}</Text>
                  </Text>
                  <Text style={sc.summarySub}>
                    {slots.length > 0
                      ? `${takenCount} of ${slots.length} meds given`
                      : 'No medications on schedule'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={sc.startBtn}
                  onPress={() => navigation.navigate('CaregiverVisit', { personId: person.id, personName: person.name })}
                >
                  <Text style={sc.startBtnText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Visit cards */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            {persons.map((p, i) => {
              const pPerms = permMap[p.id] || parsePerms(null);
              const isActive = i === activeIdx;
              const pSlots = isActive ? slots : [];
              const pLogMap = isActive ? logMap : {};
              const pAppts = isActive ? appointments : [];
              const pActivity = isActive ? activity : [];
              return (
                <VisitCard
                  key={p.id}
                  person={p}
                  perms={pPerms}
                  slots={pSlots}
                  logMap={pLogMap}
                  appointments={pAppts}
                  activity={pActivity}
                  onLogPress={(slot) => { setActiveIdx(i); setLogTarget(slot); }}
                  onVisitPress={() => navigation.navigate('CaregiverVisit', { personId: p.id, personName: p.name })}
                  navigation={navigation}
                />
              );
            })}

            <Text style={sc.footNote}>
              Allergies, conditions and notes are shared by the family. Tap Start visit to begin.
            </Text>
          </View>
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

// ─── Screen styles ───────────────────────────────────────────
const sc = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.cream },
  modeStrip:    { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar:       { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modeTag:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTagText:  { fontSize: 10, color: C.terracotta, letterSpacing: 0.7, fontWeight: '700' },
  greeting:     { fontFamily: 'Georgia', fontSize: 26, color: C.forestDeep, fontWeight: '400', marginTop: 4, letterSpacing: -0.5 },
  dateStr:      { fontSize: 12.5, color: C.muted, marginTop: 4 },
  bellBtn:      { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  badge:        { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:    { fontSize: 9, color: '#fff', fontWeight: '700' },

  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:   { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, fontWeight: '500', textAlign: 'center' },
  emptySub:     { marginTop: 8, fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { marginTop: 20, height: 44, paddingHorizontal: 22, borderRadius: 14, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  emptyBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '600' },

  chip:         { height: 36, paddingHorizontal: 12, paddingLeft: 4, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive:   { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  chipInit:     { width: 27, height: 27, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  chipInitText: { color: '#fff', fontFamily: 'Georgia', fontSize: 11, fontWeight: '500' },
  chipName:     { fontSize: 13, fontWeight: '500', color: C.ink },

  summaryCard:  { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon:  { width: 30, height: 30, borderRadius: 9, backgroundColor: C.sageSoft, alignItems: 'center', justifyContent: 'center' },
  summaryText:  { fontSize: 12, color: C.muted, lineHeight: 15 },
  summarySub:   { fontSize: 10.5, color: C.mutedSoft, marginTop: 1 },
  startBtn:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: C.forestDeep },
  startBtnText: { color: '#fff', fontSize: 11.5, fontWeight: '600' },

  footNote:     { marginTop: 14, paddingHorizontal: 4, fontSize: 11, color: C.mutedSoft, lineHeight: 16 },
});

// ─── Visit card styles ───────────────────────────────────────
const vc = StyleSheet.create({
  card:          { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: C.line, marginBottom: 14, overflow: 'hidden' },
  personName:    { fontFamily: 'Georgia', fontSize: 19, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  personAge:     { fontSize: 11.5, color: C.muted },
  metaText:      { fontSize: 11.5, color: C.muted },
  nextBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: C.terracottaSoft },
  nextBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#7A3F2A', letterSpacing: 0.4 },

  allergyBox:    { backgroundColor: C.terracottaSoft, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: C.terracottaBorder },
  allergyIcon:   { width: 24, height: 24, borderRadius: 7, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  allergyLabel:  { fontSize: 9.5, color: '#7A3F2A', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' },
  allergyText:   { fontSize: 13, color: '#5C2A1F', fontWeight: '600', marginTop: 2, lineHeight: 17, letterSpacing: -0.1 },

  condChip:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: C.cream, borderWidth: 1, borderColor: C.lineSoft },
  condChipText:  { fontSize: 10.5, color: C.muted, fontWeight: '500' },

  innerCard:     { backgroundColor: C.cream, borderRadius: 12, overflow: 'hidden' },
  apptDot:       { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: C.lineSoft },

  medRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 9 },
  medCircle:     { width: 22, height: 22, borderRadius: 99, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  medName:       { fontSize: 13, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  medDose:       { fontSize: 11, color: C.muted },
  timeTag:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: C.lineSoft },
  timeTagText:   { fontFamily: 'Georgia', fontSize: 10, color: C.muted, letterSpacing: 0.2 },
  statusTag:     { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.3 },

  noteRow:       { backgroundColor: '#FBF7F1', borderLeftWidth: 2.5, borderLeftColor: C.forest, borderRadius: 4, borderTopRightRadius: 11, borderBottomRightRadius: 11, padding: 9, paddingLeft: 11, marginBottom: 6 },
  noteFrom:      { fontSize: 11.5, fontWeight: '600', color: C.forestDeep },
  noteBody:      { fontSize: 12.5, color: C.ink, lineHeight: 17, marginTop: 3 },

  ctaBtn:        { height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dotsBtn:       { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
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
