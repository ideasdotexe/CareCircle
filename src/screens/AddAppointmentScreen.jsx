import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, useWindowDimensions, Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

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

// ─── Appointment kinds (matches design exactly) ───────────
const APPT_KINDS = [
  { k: 'visit',   l: 'In-person',  tone: '#C66E4E', Icon: IconSteth },
  { k: 'lab',     l: 'Lab test',   tone: '#C7973A', Icon: IconFlask },
  { k: 'imaging', l: 'Imaging',    tone: '#7A5A3F', Icon: IconImaging },
  { k: 'tele',    l: 'Telehealth', tone: '#3F5D54', Icon: IconVideo },
  { k: 'rx',      l: 'Pharmacy',   tone: '#1F3D38', Icon: IconRx },
];

// ─── Time options (exact from design) ────────────────────
const TIME_OPTIONS = [
  '7:30 AM', '8:00 AM', '9:00 AM', '10:30 AM', '11:00 AM',
  '12:00 PM', '1:30 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:30 PM',
];

// ─── Duration options ─────────────────────────────────────
const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '1 hr', '2 hr'];

// ─── Reminder options ─────────────────────────────────────
const REMIND_OPTIONS = [
  { k: '15m',  l: '15 min before' },
  { k: '1h',   l: '1 hour before' },
  { k: '1d',   l: '1 day before' },
  { k: '2d',   l: '2 days before' },
  { k: 'none', l: 'No reminder' },
];

// ─── Per-kind placeholder text ────────────────────────────
const PLACEHOLDERS = {
  title: {
    visit:   'Cardiology follow-up',
    lab:     'INR + lipid panel',
    imaging: 'Chest X-ray',
    tele:    'Family physician check-in',
    rx:      'Prescription pickup',
  },
  who: {
    visit:   'Dr. Mei Chen',
    lab:     'LifeLabs',
    imaging: 'Sunnybrook · Imaging',
    tele:    'Dr. Patel',
    rx:      'Shoppers Drug Mart',
  },
  where: {
    visit:   "St. Michael's · Rm 412",
    lab:     'Yonge & Eglinton · fasting',
    imaging: '2075 Bayview Ave',
    tele:    'Telehealth call',
    rx:      'Yonge & Bloor',
  },
  whoLabel: {
    visit:   'Doctor or clinic',
    lab:     'Provider',
    imaging: 'Provider',
    tele:    'Doctor or clinic',
    rx:      'Provider',
  },
};

// ─── Helpers ──────────────────────────────────────────────
function buildISO(dateKey, timeStr) {
  // dateKey = 'YYYY-MM-DD', timeStr = '7:30 AM' etc.
  if (!dateKey) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
      date.setHours(h, min, 0, 0);
    }
  }
  return date.toISOString();
}
function parseEditDate(iso) {
  // Returns YYYY-MM-DD from an ISO string
  if (!iso) return null;
  return new Date(iso).toISOString().split('T')[0];
}
function parseEditTime(iso) {
  // Returns e.g. '2:00 PM' from an ISO string
  if (!iso) return null;
  const d = new Date(iso);
  if (d.getHours() === 0 && d.getMinutes() === 0) return null;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayObj() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}

// ─── SVG icons (exact paths from design) ──────────────────
function IconBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconCaretDown({ color = C.muted }) {
  return (
    <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
      <Path d="M1 1l4 4 4-4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconChevLeft() {
  return (
    <Svg width={6} height={10} viewBox="0 0 6 10" fill="none">
      <Path d="M5 1L1 5l4 4" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconChevRight() {
  return (
    <Svg width={6} height={10} viewBox="0 0 6 10" fill="none">
      <Path d="M1 1l4 4-4 4" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconSteth({ color = '#fff' }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={13} cy={7} r={1.5} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
function IconFlask({ color = '#fff' }) {
  return (
    <Svg width={13} height={16} viewBox="0 0 14 16" fill="none">
      <Path d="M5 1v5L1 14a1 1 0 001 1h10a1 1 0 001-1L9 6V1" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 1h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
function IconImaging({ color = '#fff' }) {
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14" fill="none">
      <Rect x={1} y={1} width={14} height={12} rx={2} stroke={color} strokeWidth={1.4} />
      <Path d="M1 9l3-3 3 3 2-2 6 6" stroke={color} strokeWidth={1.4} strokeLinejoin="round" fill="none" />
      <Circle cx={11} cy={4} r={1.2} fill={color} />
    </Svg>
  );
}
function IconVideo({ color = '#fff' }) {
  return (
    <Svg width={16} height={12} viewBox="0 0 16 12" fill="none">
      <Rect x={1} y={1} width={10} height={10} rx={2} stroke={color} strokeWidth={1.5} />
      <Path d="M11 4l4-2v8l-4-2" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}
function IconRx({ color = '#fff' }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M3 1h4a3 3 0 010 6H3v6m0-6h3l4 6M3 1v6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconPin({ color = C.muted }) {
  return (
    <Svg width={11} height={13} viewBox="0 0 11 13" fill="none">
      <Path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={color} strokeWidth={1.3} />
      <Circle cx={5.5} cy={5} r={1.5} stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}
function IconClock({ color = C.muted }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Circle cx={7} cy={7} r={5.5} stroke={color} strokeWidth={1.4} />
      <Path d="M7 4v3.2L9 9" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function IconBell({ color = C.muted }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M7 2v1M3 6.5a4 4 0 018 0V9l1 2H2l1-2V6.5z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.5 12a1.5 1.5 0 003 0" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function IconShare({ color = C.forest }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Circle cx={3} cy={7} r={2} stroke={color} strokeWidth={1.4} />
      <Circle cx={11} cy={3} r={2} stroke={color} strokeWidth={1.4} />
      <Circle cx={11} cy={11} r={2} stroke={color} strokeWidth={1.4} />
      <Path d="M5 6l5-2.5M5 8l5 2.5" stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}

// ─── Mini calendar ────────────────────────────────────────
function MiniCalendar({ value, onChange, calWidth }) {
  const cellSize = Math.floor(calWidth / 7);
  const today = todayObj();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const first = new Date(view.y, view.m, 1);
  const last = new Date(view.y, view.m + 1, 0).getDate();
  // Monday-first: Sun=0 → position 6, Mon=1 → position 0
  const leading = (first.getDay() + 6) % 7;
  const monthLabel = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (delta) => {
    let m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
  };

  const makeKey = (d) =>
    `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <View style={cal.wrap}>
      {/* Month nav header */}
      <View style={cal.header}>
        <TouchableOpacity style={cal.navBtn} onPress={() => shift(-1)}>
          <IconChevLeft />
        </TouchableOpacity>
        <Text style={cal.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity style={cal.navBtn} onPress={() => shift(1)}>
          <IconChevRight />
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers (Mon-first) */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} style={{ width: cellSize, alignItems: 'center' }}>
            <Text style={cal.dayHeader}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={{ width: cellSize, height: 36 }} />;
          const thisDate = new Date(view.y, view.m, d);
          thisDate.setHours(0, 0, 0, 0);
          const isPast = thisDate < today;
          const isToday = thisDate.getTime() === today.getTime();
          const key = makeKey(d);
          const isSel = value === key;
          return (
            <TouchableOpacity
              key={i}
              style={{ width: cellSize, height: 36, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => !isPast && onChange(key)}
              disabled={isPast}
              activeOpacity={0.7}
            >
              <View style={[
                cal.dayCell,
                isSel && { backgroundColor: C.forestDeep },
                isToday && !isSel && { backgroundColor: C.terracottaSoft },
                isPast && { opacity: 0.35 },
              ]}>
                <Text style={[
                  cal.dayNum,
                  isSel && { color: '#fff', fontWeight: '700' },
                  isToday && !isSel && { color: C.ink },
                ]}>
                  {d}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: C.line, padding: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  navBtn: {
    width: 28, height: 28, borderRadius: 99,
    backgroundColor: C.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: 'Georgia', fontSize: 15, color: C.forestDeep,
    fontWeight: '500', letterSpacing: -0.2,
  },
  dayHeader: {
    fontSize: 10, fontWeight: '700', color: C.mutedSoft,
    letterSpacing: 0.4, textTransform: 'uppercase',
  },
  dayCell: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNum: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13, fontWeight: '500', color: C.ink,
  },
});

// ─── Field label row ──────────────────────────────────────
function FieldLabel({ label, optional }) {
  return (
    <View style={s.fieldLabelRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      {optional && <Text style={s.fieldOpt}>Optional</Text>}
    </View>
  );
}

// ─── Text input row ───────────────────────────────────────
function FieldInput({ value, onChange, placeholder, leading }) {
  return (
    <View style={s.inputRow}>
      {leading ? <View style={s.inputLeading}>{leading}</View> : null}
      <TextInput
        style={[s.inputText, leading && { flex: 1 }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.mutedSoft}
        autoCapitalize="sentences"
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function AddAppointmentScreen({ navigation, route }) {
  const personId = route?.params?.personId;
  const personName = route?.params?.personName ?? null;
  const editing = route?.params?.appointment ?? null;

  const { width } = useWindowDimensions();
  // calendar content width = screen - outer padding 40 - calendar inner padding 28
  const calWidth = width - 68;

  // Form state
  const [kind, setKind] = useState('visit');
  const [title, setTitle] = useState('');
  const [who, setWho] = useState('');
  const [where, setWhere] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [duration, setDuration] = useState('30 min');
  const [remind, setRemind] = useState('1d');
  const [notes, setNotes] = useState('');
  const [shareTeam, setShareTeam] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Pre-fill when editing
  useEffect(() => {
    if (!editing) return;
    setKind(editing.kind ?? editing.type ?? 'visit');
    setTitle(editing.title ?? '');
    setWho(editing.provider ?? '');
    setWhere(editing.location ?? '');
    setNotes(editing.notes ?? '');
    const dk = parseEditDate(editing.appointment_date);
    if (dk) setDate(dk);
    const tm = parseEditTime(editing.appointment_date);
    if (tm) setTime(tm);
  }, []);

  const kindMeta = APPT_KINDS.find(k => k.k === kind) ?? APPT_KINDS[0];
  const canSave = (title.trim() || PLACEHOLDERS.title[kind]) && date && time;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const resolvedTime = showCustomTime ? customTime : time;
      const payload = {
        person_id: personId,
        title: (title.trim() || PLACEHOLDERS.title[kind]),
        appointment_date: buildISO(date, resolvedTime),
        provider: who.trim() || null,
        location: where.trim() || null,
        notes: notes.trim() || null,
      };
      if (user?.id) payload.user_id = user.id;

      if (editing) {
        const { error } = await supabase.from('appointments').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('appointments').insert(payload);
        if (error) {
          // Retry without user_id if that column doesn't exist
          if (error.message?.includes('user_id')) {
            delete payload.user_id;
            const { error: e2 } = await supabase.from('appointments').insert(payload);
            if (e2) throw e2;
          } else throw error;
        }
      }
      navigation.goBack();
    } catch (e) {
      setSaveError(e.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IconBack />
        </TouchableOpacity>
        <Text style={s.topTitle}>{editing ? 'Edit appointment' : 'Add appointment'}</Text>
        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* ── Hero ── */}
      <View style={s.hero}>
        {personName ? (
          <Text style={s.heroEyebrow}>For {personName}</Text>
        ) : null}
        <Text style={s.heroTitle}>Plan the next visit.</Text>
      </View>

      {/* ── Kind picker ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 18 }}
        contentContainerStyle={s.kindRow}
      >
        {APPT_KINDS.map(k => {
          const active = kind === k.k;
          const KIcon = k.Icon;
          return (
            <TouchableOpacity
              key={k.k}
              style={[s.kindBtn, active && s.kindBtnActive]}
              onPress={() => setKind(k.k)}
              activeOpacity={0.8}
            >
              <View style={[s.kindIcon, { backgroundColor: k.tone }]}>
                <KIcon color="#fff" />
              </View>
              <Text style={[s.kindLabel, active && s.kindLabelActive]}>{k.l}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Scrollable body ── */}
      <ScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* What */}
        <View style={s.field}>
          <FieldLabel label="What" />
          <FieldInput
            value={title}
            onChange={setTitle}
            placeholder={PLACEHOLDERS.title[kind]}
          />
        </View>

        {/* Doctor / Provider — clinic name autocomplete */}
        <View style={[s.field, { zIndex: 20 }]}>
          <FieldLabel label={PLACEHOLDERS.whoLabel[kind]} />
          <PlaceAutocomplete
            type="clinic"
            value={who}
            onChangeText={setWho}
            onSelect={item => {
              setWho(item.name || item.label);
              if (!where) setWhere(item.address || '');
            }}
            placeholder={PLACEHOLDERS.who[kind]}
          />
        </View>

        {/* Location — address autocomplete */}
        <View style={[s.field, { zIndex: 10 }]}>
          <FieldLabel label="Location" optional={kind === 'tele'} />
          <PlaceAutocomplete
            type="address"
            value={where}
            onChangeText={setWhere}
            onSelect={item => setWhere(item.label)}
            placeholder={PLACEHOLDERS.where[kind]}
            leading={kind === 'tele'
              ? <IconVideo color={C.muted} />
              : <IconPin color={C.muted} />}
          />
        </View>

        {/* Date — mini calendar */}
        <View style={{ marginTop: 6 }}>
          <FieldLabel label="Date" />
          <MiniCalendar value={date} onChange={setDate} calWidth={calWidth} />
        </View>

        {/* Time chips */}
        <View style={{ marginTop: 22 }}>
          <FieldLabel label="Time" />
          <View style={s.chipWrap}>
            {TIME_OPTIONS.map(t => {
              const active = time === t && !showCustomTime;
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.timeChip, active && s.timeChipActive]}
                  onPress={() => { setTime(t); setShowCustomTime(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[s.timeChipText, active && s.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Custom time button */}
            <TouchableOpacity
              style={[s.timeChipCustom, showCustomTime && s.timeChipActive]}
              onPress={() => setShowCustomTime(p => !p)}
              activeOpacity={0.75}
            >
              <IconClock color={showCustomTime ? '#fff' : C.muted} />
              <Text style={[s.timeChipText, { color: showCustomTime ? '#fff' : C.muted }, { marginLeft: 5 }]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {showCustomTime && (
            <View style={[s.inputRow, { marginTop: 8 }]}>
              <TextInput
                style={s.inputText}
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="e.g. 3:45 PM"
                placeholderTextColor={C.mutedSoft}
                autoCapitalize="characters"
              />
            </View>
          )}
        </View>

        {/* Duration */}
        <View style={{ marginTop: 22 }}>
          <FieldLabel label="Duration" optional />
          <View style={s.chipRowWrap}>
            {DURATION_OPTIONS.map(d => {
              const active = duration === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[s.durationChip, active && s.durationChipActive]}
                  onPress={() => setDuration(d)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.durationChipText, active && s.durationChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reminder */}
        <View style={{ marginTop: 22 }}>
          <FieldLabel label="Reminder" />
          <View style={s.chipRowWrap}>
            {REMIND_OPTIONS.map(r => {
              const active = remind === r.k;
              return (
                <TouchableOpacity
                  key={r.k}
                  style={[s.remindChip, active && s.remindChipActive]}
                  onPress={() => setRemind(r.k)}
                  activeOpacity={0.75}
                >
                  <IconBell color={active ? '#fff' : C.muted} />
                  <Text style={[s.remindChipText, active && s.remindChipTextActive]}>{r.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={{ marginTop: 22 }}>
          <FieldLabel label="Notes" optional />
          <View style={s.notesInput}>
            <TextInput
              style={[s.inputText, { height: 72 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder={kind === 'lab' ? 'e.g. fasting — water only' : 'Anything to remember, prep, or bring…'}
              placeholderTextColor={C.mutedSoft}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          </View>
        </View>

        {/* Share with care team */}
        <View style={[s.shareRow, { marginTop: 22 }]}>
          <View style={s.shareIcon}>
            <IconShare color={C.forest} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.shareTitle}>Share with care team</Text>
            <Text style={s.shareSub}>Visible to all linked caregivers</Text>
          </View>
          <Switch
            value={shareTeam}
            onValueChange={setShareTeam}
            trackColor={{ false: C.line, true: C.forestDeep }}
            thumbColor="#fff"
          />
        </View>

        {/* Error */}
        {saveError ? (
          <View style={s.errBox}>
            <Text style={s.errText}>{saveError}</Text>
          </View>
        ) : null}

        {/* Bottom padding for sticky save button */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky save ── */}
      <View style={s.stickyBar}>
        <TouchableOpacity
          style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnText}>{editing ? 'Save changes' : 'Save appointment'}</Text>
          }
        </TouchableOpacity>
        {!canSave && (
          <Text style={s.saveHint}>Pick a date and time to save.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 0,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: {
    fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep,
    fontWeight: '500', letterSpacing: -0.2,
  },
  cancelBtn: {
    height: 36, paddingHorizontal: 12, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: 13, color: C.muted, fontWeight: '500' },

  hero: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 0 },
  heroEyebrow: {
    fontSize: 11, color: C.muted, letterSpacing: 0.4,
    textTransform: 'uppercase', fontWeight: '600', marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'Georgia', fontSize: 26, lineHeight: 30,
    letterSpacing: -0.6, color: C.forestDeep, fontWeight: '400',
  },

  // Kind picker
  kindRow: { paddingHorizontal: 20, gap: 7 },
  kindBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingLeft: 8, paddingRight: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: C.line,
    backgroundColor: '#fff', flexShrink: 0,
  },
  kindBtnActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  kindIcon: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  kindLabel: { fontSize: 13, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  kindLabelActive: { color: '#fff' },

  // Body
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },

  field: { marginBottom: 16 },
  fieldLabelRow: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'space-between', marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  fieldOpt: { fontSize: 10.5, color: C.mutedSoft },

  inputRow: {
    height: 50, borderRadius: 13, backgroundColor: '#fff',
    borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  inputLeading: { width: 20, alignItems: 'center' },
  inputText: { flex: 1, fontSize: 15, color: C.ink, letterSpacing: -0.15 },

  notesInput: {
    borderRadius: 13, backgroundColor: '#fff',
    borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12,
  },

  // Time chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  timeChip: {
    height: 38, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  timeChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  timeChipCustom: {
    height: 38, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: C.mutedSoft, borderStyle: 'dashed',
    backgroundColor: 'transparent',
    flexDirection: 'row', alignItems: 'center',
  },
  timeChipText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12.5, fontWeight: '600', letterSpacing: 0.2, color: C.ink,
  },
  timeChipTextActive: { color: '#fff' },

  // Duration chips
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  durationChip: {
    height: 36, paddingHorizontal: 14, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  durationChipActive: { backgroundColor: C.sageSoft, borderColor: C.sageSoft },
  durationChipText: { fontSize: 12.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  durationChipTextActive: { color: '#2E4942' },

  // Reminder chips
  remindChip: {
    height: 36, paddingHorizontal: 12, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  remindChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  remindChipText: { fontSize: 12.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  remindChipTextActive: { color: '#fff' },

  // Share row
  shareRow: {
    padding: 12, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  shareIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.sageSoft,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  shareTitle: { fontSize: 13, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  shareSub: { fontSize: 11, color: C.muted, marginTop: 2 },

  errBox: { marginTop: 12, backgroundColor: '#FBE3D9', borderRadius: 12, padding: 12 },
  errText: { fontSize: 13, color: C.terracotta },

  // Sticky save
  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28,
    backgroundColor: C.cream,
    // Gradient-like fade handled by a semi-transparent background layer
    borderTopWidth: 1, borderTopColor: C.lineSoft,
  },
  saveBtn: {
    height: 54, borderRadius: 16, backgroundColor: C.forestDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#CDC5B6' },
  saveBtnText: { fontSize: 15.5, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },
  saveHint: { marginTop: 8, textAlign: 'center', fontSize: 11, color: C.mutedSoft },
});
