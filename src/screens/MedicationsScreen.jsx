import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, TextInput, Switch, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { supabase } from '../lib/supabase';
import {
  detectInteractions,
  detectConditionInteractions,
  mergeInteractions,
  buildInteractionHash,
} from '../lib/interactions';

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

const MED_COLORS = [C.terracotta, C.forest, C.sage, '#7A5A3F', '#4A6B6A', '#9A6A8A', '#5B7FA6'];

// ─── Schedule constants ───────────────────────────────────
const FREQ_OPTIONS = [
  { key: 'once_daily',      label: 'Once daily',      defaultTimes: ['08:00'] },
  { key: 'twice_daily',     label: 'Twice daily',     defaultTimes: ['08:00', '20:00'] },
  { key: 'three_daily',     label: 'Three times',     defaultTimes: ['08:00', '13:00', '20:00'] },
  { key: 'every_other_day', label: 'Every other day', defaultTimes: ['08:00'] },
  { key: 'custom_days',     label: 'Custom days',     defaultTimes: ['08:00'] },
  { key: 'prn',             label: 'As needed (PRN)', defaultTimes: [] },
];
const FOOD_OPTIONS = [
  { key: 'none',         label: 'No instruction' },
  { key: 'with_food',    label: 'With food' },
  { key: 'without_food', label: 'Without food' },
  { key: 'with_water',   label: 'With water' },
];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Hour options starting at 6 AM
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = (i + 6) % 24;
  const ampm = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const val = `${String(h).padStart(2, '0')}:00`;
  return { value: val, label: `${display}:00 ${ampm}` };
});

// ─── Helpers ──────────────────────────────────────────────
function emptyForm() {
  return { name: '', brand: '', dose: '', frequency: '', prescriber: '', start_date: '', end_date: '' };
}
function emptySched() {
  return { enabled: false, freq: 'once_daily', times: ['08:00'], daysOfWeek: [], food: 'none', supply: '' };
}
function toTitleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
function freqToCount(freq) {
  if (!freq) return 1;
  const w = freq.toLowerCase().match(/^(\w+)/)?.[1] ?? '';
  return { once: 1, twice: 2, three: 3, four: 4, five: 5, six: 6 }[w] ?? 1;
}
function formatTime(val) {
  const [h] = val.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${ampm}`;
}

// ─── Drug search ─────────────────────────────────────────
// Primary: NLM Clinical Tables RxTerms — returns clean generic + brand names
// Fallback: openFDA drug label API
async function fetchDrugSuggestions(query) {
  if (query.length < 2) return [];
  const results = [];
  const seen = new Set();

  // 1. NLM Clinical Tables (best coverage — returns Metformin, Atorvastatin, etc.)
  try {
    const url = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(query)}&maxList=10&ef=STRENGTHS_AND_FORMS`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      // json = [totalCount, [displayNames], {extraFields}, [codes]]
      const displayNames = json[1] ?? [];
      const strengths = json[2]?.STRENGTHS_AND_FORMS ?? [];
      for (let i = 0; i < displayNames.length; i++) {
        // Name format: "metFORMIN (Oral Pill)" → normalise to "Metformin"
        const raw = displayNames[i] ?? '';
        const cleanName = toTitleCase(raw.replace(/\s*\(.*?\)\s*/g, '').trim());
        if (!cleanName || seen.has(cleanName)) continue;
        seen.add(cleanName);
        // Keep strengths as a hint shown in the suggestion list only — never auto-filled
        const strengthHints = strengths[i] ?? [];
        results.push({ name: cleanName, brand: '', strengthHint: strengthHints.slice(0, 3).join(' · ') });
      }
    }
  } catch { /* fall through to FDA */ }

  // 2. FDA label API fallback (fills brand-name gaps)
  if (results.length < 5) {
    try {
      const q = encodeURIComponent(query + '*');
      const [g, b] = await Promise.all([
        fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${q}&limit=6`),
        fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${q}&limit=6`),
      ]);
      const absorb = json => {
        for (const item of json.results ?? []) {
          const name = item.openfda?.generic_name?.[0] ? toTitleCase(item.openfda.generic_name[0]) : '';
          const brand = item.openfda?.brand_name?.[0] ? toTitleCase(item.openfda.brand_name[0]) : '';
          const key = name || brand;
          if (key && !seen.has(key)) { seen.add(key); results.push({ name, brand }); }
        }
      };
      if (g.ok) absorb(await g.json());
      if (b.ok) absorb(await b.json());
    } catch { /* ignore */ }
  }

  return results.slice(0, 10);
}

async function fetchBrandSuggestions(query) {
  if (query.length < 2) return [];
  try {
    const res = await fetch(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(query)}&maxList=8`);
    if (res.ok) {
      const json = await res.json();
      const names = (json[1] ?? []).map(n => toTitleCase(n.replace(/\s*\(.*?\)\s*/g, '').trim())).filter(Boolean);
      return [...new Set(names)].slice(0, 8);
    }
  } catch { /* ignore */ }
  // FDA fallback
  try {
    const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(query + '*')}&limit=10`);
    if (!res.ok) return [];
    const json = await res.json();
    const seen = new Set(); const out = [];
    for (const item of json.results ?? [])
      for (const b of item.openfda?.brand_name ?? []) {
        const l = toTitleCase(b);
        if (!seen.has(l)) { seen.add(l); out.push(l); }
      }
    return out.slice(0, 8);
  } catch { return []; }
}

// ─── Interaction DB (subset) ──────────────────────────────
// Interaction detection functions imported from ../lib/interactions

// ─── Inline SVG icons ────────────────────────────────────
function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.forestDeep} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IClose() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path d="M1 1l10 10M11 1L1 11" stroke={C.muted} strokeWidth={1.6} strokeLinecap="round" />
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
function IBell() {
  return (
    <Svg width={11} height={12} viewBox="0 0 12 13" fill="none">
      <Path d="M6 1a4 4 0 00-4 4v3l-1 1.5h10L10 8V5a4 4 0 00-4-4z" stroke={C.forest} strokeWidth={1.2} strokeLinejoin="round" />
      <Path d="M4.5 11.5a1.5 1.5 0 003 0" stroke={C.forest} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}
function ICheck() {
  return (
    <Svg width={10} height={8} viewBox="0 0 10 8" fill="none">
      <Path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── MedRow component ─────────────────────────────────────
function MedRow({ med, colorIndex, scheduleTimes, isStopped, onEdit, onMarkStopped, onMarkActive, onDelete }) {
  const bg = isStopped ? C.muted : MED_COLORS[colorIndex % MED_COLORS.length];
  const initial = med.name.trim()[0]?.toUpperCase() ?? '?';
  const count = freqToCount(med.frequency);
  const times = scheduleTimes ?? [];

  return (
    <View>
      <View style={s.medRow}>
        {/* Color dot with gradient */}
        <View style={[s.medDot, { backgroundColor: bg }]}>
          <View style={s.medDotGradient} />
          <Text style={s.medDotInitial}>{initial}</Text>
        </View>

        {/* Name / dose / freq */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.medNameRow}>
            <Text style={[s.medName, isStopped && { opacity: 0.55 }]} numberOfLines={1}>{med.name}</Text>
            {med.dose ? <Text style={s.medDose}>{med.dose}</Text> : null}
          </View>
          {med.frequency ? <Text style={s.medFreq}>{med.frequency}</Text> : null}
        </View>

        {/* Right: count + time chips */}
        <View style={s.medRight}>
          {times.length > 0 ? (
            <>
              <Text style={s.medCountText}>
                {times.length}×{' '}
                <Text style={s.medCountDay}>day</Text>
              </Text>
              <View style={s.medTimeChips}>
                {times.slice(0, 3).map((t, i) => (
                  <View key={i} style={s.medTimeChip}>
                    <Text style={s.medTimeChipText}>{formatTime(t)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : times.length === 0 && !isStopped ? (
            <View style={s.medReminderBadge}>
              <IBell />
              <Text style={s.medReminderText}>Set up</Text>
            </View>
          ) : isStopped ? (
            <View style={s.stoppedChip}>
              <Text style={s.stoppedChipText}>Stopped</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Action links */}
      <View style={s.medActions}>
        <TouchableOpacity onPress={() => onEdit(med)}>
          <Text style={[s.medAction, { color: C.forest }]}>Edit</Text>
        </TouchableOpacity>
        {!isStopped ? (
          <TouchableOpacity onPress={() => onMarkStopped(med)}>
            <Text style={[s.medAction, { color: C.terracotta }]}>Mark stopped</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => onMarkActive(med)}>
            <Text style={[s.medAction, { color: C.forest }]}>Mark active</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onDelete(med)}>
          <Text style={[s.medAction, { color: '#C0392B' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Interaction row ──────────────────────────────────────
function InteractionRow({ ix, isLast, onPress }) {
  const sev =
    ix.sev === 'major'    ? { dot: C.terracotta, bg: '#FBE3D9', color: C.terracotta, label: 'MAJOR' } :
    ix.sev === 'moderate' ? { dot: '#C7973A',    bg: '#F5E4C9', color: '#C7973A',    label: 'MODERATE' } :
                            { dot: C.sage,       bg: C.sageSoft, color: '#2E4942',   label: 'MINOR' };
  // For condition interactions: show condition with a soft pill background
  const bStyle = ix.isCondition
    ? [s.ixDrugName, { color: C.forest }]
    : s.ixDrugName;
  return (
    <TouchableOpacity
      style={[s.listRow, !isLast && s.listRowBorder]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={[s.ixDot, { backgroundColor: sev.dot }]}>
        <IWarn />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={s.ixTitleRow}>
          <Text style={s.ixDrugName}>{ix.a}</Text>
          <Text style={s.ixTimes}>{ix.isCondition ? '+' : '×'}</Text>
          <Text style={bStyle}>{ix.b}</Text>
          <View style={[s.sevBadge, { backgroundColor: sev.bg }]}>
            <Text style={[s.sevText, { color: sev.color }]}>{sev.label}</Text>
          </View>
        </View>
        <Text style={s.ixTapHint}>
          {ix.isCondition ? 'Drug + condition · tap for details →' : 'Tap for details →'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function MedicationsScreen({ navigation, route }) {
  // Support both { person: { id, name } } and { personId } param shapes
  const person = route?.params?.person;
  const personId = person?.id ?? route?.params?.personId ?? null;
  const personName = person?.name ?? null;

  // List state
  const [medications, setMedications] = useState([]);
  const [scheduleMap, setScheduleMap] = useState({});   // { medName: { times, freq, food, supply } }
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState([]);
  const [aiChecking, setAiChecking] = useState(false);
  const [selectedIx, setSelectedIx] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [existingSchedId, setExistingSchedId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [sched, setSched] = useState(emptySched());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Drug search
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [searchingDrug, setSearchingDrug] = useState(false);
  const [searchingBrand, setSearchingBrand] = useState(false);
  const drugTimer = useRef(null);
  const brandTimer = useRef(null);

  // Time picker
  const [timePickerIdx, setTimePickerIdx] = useState(null); // which time slot is being picked

  const load = useCallback(async () => {
    if (!personId) { setLoading(false); return; }
    const [medRes, schedRes, condRes] = await Promise.all([
      supabase.from('medications').select('*').eq('person_id', personId).order('created_at', { ascending: true }),
      supabase.from('medication_schedules').select('medication_name, times, frequency_type, food_instruction, supply_on_hand, id').eq('person_id', personId).eq('active', true),
      supabase.from('conditions').select('id, name').eq('person_id', personId).eq('cured', false),
    ]);
    const meds = medRes.data ?? [];
    const conds = condRes.data ?? [];
    setMedications(meds);
    setConditions(conds);
    const map = {};
    for (const s of schedRes.data ?? []) {
      map[s.medication_name] = {
        id: s.id,
        times: s.times ?? [],
        freq: s.frequency_type ?? 'once_daily',
        food: s.food_instruction ?? 'none',
        supply: s.supply_on_hand != null ? String(s.supply_on_hand) : '',
      };
    }
    setScheduleMap(map);

    // Static interaction checks (instant)
    const ddIx = detectInteractions(meds);
    const dcIx = detectConditionInteractions(meds, conds);
    setInteractions(mergeInteractions(ddIx, dcIx));
    setLoading(false);

    // AI interaction check — only fires when med/condition combo has changed
    const activeMedNames = meds.filter(m => m.active).map(m => m.name);
    const condNames = conds.map(c => c.name);
    if (activeMedNames.length >= 2) {
      const currentHash = buildInteractionHash(activeMedNames, condNames);
      const cacheKey = `@cc_ix_v1_${personId}`;
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { hash, results } = JSON.parse(cached);
          if (hash === currentHash) {
            // Same combo — use cached AI results, skip API call
            setInteractions(mergeInteractions(ddIx, dcIx, results));
            return; // done
          }
        }
      } catch (_) { /* AsyncStorage read failed — proceed to API */ }

      // Hash changed (new med/condition added) — call AI
      setAiChecking(true);
      try {
        const { checkInteractionsAI } = await import('../lib/groq');
        const aiResults = await checkInteractionsAI(activeMedNames, condNames);
        setInteractions(mergeInteractions(ddIx, dcIx, aiResults));
        // Persist new cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ hash: currentHash, results: aiResults }));
      } catch { /* silently ignore AI/storage failures */ }
      finally { setAiChecking(false); }
    }
  }, [personId]);

  useEffect(() => { load(); }, [load]);

  // ── Open add / edit ──
  const openAdd = () => {
    setEditingMed(null);
    setExistingSchedId(null);
    setForm(emptyForm());
    setSched(emptySched());
    setDrugSuggestions([]);
    setBrandSuggestions([]);
    setTimePickerIdx(null);
    setSaveError(null);
    setShowModal(true);
  };

  const openEdit = async (med) => {
    setEditingMed(med);
    setForm({
      name: med.name,
      brand: med.brand ?? '',
      dose: med.dose ?? '',
      frequency: med.frequency ?? '',
      prescriber: med.prescriber ?? '',
      start_date: med.start_date ?? '',
      end_date: med.end_date ?? '',
    });
    setDrugSuggestions([]);
    setBrandSuggestions([]);
    setTimePickerIdx(null);
    setSaveError(null);

    // Load existing schedule
    const existing = scheduleMap[med.name];
    if (existing) {
      setExistingSchedId(existing.id ?? null);
      setSched({
        enabled: true,
        freq: existing.freq,
        times: existing.times.length ? existing.times : ['08:00'],
        daysOfWeek: [],
        food: existing.food,
        supply: existing.supply,
      });
    } else {
      setExistingSchedId(null);
      setSched(emptySched());
    }
    setShowModal(true);
  };

  // ── Drug search handlers ──
  const handleNameChange = (text) => {
    setForm(f => ({ ...f, name: text }));
    setDrugSuggestions([]);
    if (drugTimer.current) clearTimeout(drugTimer.current);
    if (text.length < 2) { setSearchingDrug(false); return; }
    setSearchingDrug(true);
    drugTimer.current = setTimeout(async () => {
      const r = await fetchDrugSuggestions(text);
      setDrugSuggestions(r);
      setSearchingDrug(false);
    }, 350);
  };
  const handleBrandChange = (text) => {
    setForm(f => ({ ...f, brand: text }));
    setBrandSuggestions([]);
    if (brandTimer.current) clearTimeout(brandTimer.current);
    if (text.length < 2) return;
    setSearchingBrand(true);
    brandTimer.current = setTimeout(async () => {
      const r = await fetchBrandSuggestions(text);
      setBrandSuggestions(r);
      setSearchingBrand(false);
    }, 350);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        dose: form.dose.trim() || null,
        frequency: form.frequency.trim() || null,
        prescriber: form.prescriber.trim() || null,
        start_date: form.start_date.trim() || null,
        end_date: form.end_date.trim() || null,
      };

      let updatedMeds;
      if (editingMed) {
        const { error } = await supabase.from('medications').update(payload).eq('id', editingMed.id);
        if (error) throw error;
        updatedMeds = medications.map(m => m.id === editingMed.id ? { ...m, ...payload } : m);
      } else {
        const { data, error } = await supabase
          .from('medications')
          .insert({ ...payload, person_id: personId, active: true })
          .select().single();
        if (error) throw error;
        updatedMeds = data ? [...medications, data] : medications;
      }
      setMedications(updatedMeds);

      // Save / update schedule
      if (personId) {
        const { data: { user } } = await supabase.auth.getUser();
        const schedPayload = {
          user_id: user?.id,
          person_id: personId,
          medication_name: payload.name,
          dose_quantity: payload.dose || null,
          frequency_type: sched.freq,
          times: sched.freq === 'prn' ? [] : sched.times,
          days_of_week: sched.freq === 'custom_days' ? sched.daysOfWeek : null,
          food_instruction: sched.food === 'none' ? null : sched.food,
          supply_on_hand: sched.supply ? parseInt(sched.supply, 10) : null,
          active: true,
        };

        if (sched.enabled) {
          if (existingSchedId) {
            await supabase.from('medication_schedules').update(schedPayload).eq('id', existingSchedId);
          } else {
            await supabase.from('medication_schedules').insert({
              ...schedPayload,
              start_date: new Date().toISOString().split('T')[0],
            });
          }
        } else if (existingSchedId) {
          await supabase.from('medication_schedules').update({ active: false }).eq('id', existingSchedId);
        }
      }

      // Invalidate AI cache so the new combo gets checked on next load
      await AsyncStorage.removeItem(`@cc_ix_v1_${personId}`).catch(() => {});
      await load();
      setShowModal(false);
    } catch (e) {
      setSaveError(e.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Mark stopped / active / delete ──
  const invalidateIxCache = () => AsyncStorage.removeItem(`@cc_ix_v1_${personId}`).catch(() => {});

  const handleMarkStopped = (med) => {
    Alert.alert(
      'Mark as stopped',
      `Mark "${med.name}" as stopped?`,
      [{ text: 'Cancel', style: 'cancel' }, {
        text: 'Mark stopped', onPress: async () => {
          const { error } = await supabase.from('medications').update({ active: false }).eq('id', med.id);
          if (error) { Alert.alert('Error', error.message); return; }
          invalidateIxCache();
          await load();
        }
      }]
    );
  };
  const handleMarkActive = (med) => {
    Alert.alert(
      'Mark as active',
      `Move "${med.name}" back to current medications?`,
      [{ text: 'Cancel', style: 'cancel' }, {
        text: 'Mark active', onPress: async () => {
          const { error } = await supabase.from('medications').update({ active: true }).eq('id', med.id);
          if (error) { Alert.alert('Error', error.message); return; }
          invalidateIxCache();
          await load();
        }
      }]
    );
  };
  const handleDelete = (med) => {
    Alert.alert(
      'Delete medication',
      `Permanently delete "${med.name}"?`,
      [{ text: 'Cancel', style: 'cancel' }, {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('medications').delete().eq('id', med.id);
          if (error) { Alert.alert('Error', error.message); return; }
          invalidateIxCache();
          await load();
        }
      }]
    );
  };

  const activeMeds = medications.filter(m => m.active);
  const stoppedMeds = medications.filter(m => !m.active);
  const scheduledCount = Object.keys(scheduleMap).filter(k => activeMeds.find(m => m.name === k)).length;
  const totalDoses = activeMeds.reduce((sum, m) => {
    const t = scheduleMap[m.name]?.times;
    return sum + (t?.length ?? freqToCount(m.frequency));
  }, 0);

  return (
    <SafeAreaView style={s.safe}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.topTitle}>Medications</Text>
          {personName ? <Text style={s.topSub}>{personName}</Text> : null}
        </View>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={C.forest} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {medications.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyTitle}>No medications recorded</Text>
              <Text style={s.emptySub}>
                Add current or past medications to keep an accurate record.
              </Text>
              <TouchableOpacity style={s.emptyBtn} onPress={openAdd}>
                <Text style={s.emptyBtnText}>Add medication</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Hero card */}
              {activeMeds.length > 0 && (
                <View style={s.heroCard}>
                  <View style={s.heroRings}>
                    <Svg width={180} height={180}>
                      <Circle cx={90} cy={90} r={85} stroke="#fff" strokeWidth={1} fill="none" opacity={0.08} />
                      <Circle cx={90} cy={90} r={55} stroke="#fff" strokeWidth={1} fill="none" opacity={0.08} />
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.heroValue}>{totalDoses} {totalDoses === 1 ? 'dose' : 'doses'} today</Text>
                    <Text style={s.heroSub}>
                      {activeMeds.length} active{scheduledCount > 0 ? ` · ${scheduledCount} with reminders` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.heroReminderBtn}
                    onPress={() => navigation.navigate('MedicationReminders', { personId, person })}
                    activeOpacity={0.8}
                  >
                    <Text style={s.heroReminderText}>Reminders →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Interaction banner */}
              {(interactions.length > 0 || aiChecking) && (
                <TouchableOpacity
                  style={[s.ixBanner, interactions.length === 0 && { opacity: 0.7 }]}
                  onPress={() => interactions.length > 0 && setSelectedIx(interactions[0])}
                  activeOpacity={0.82}
                >
                  <View style={s.ixBannerDot}>
                    {aiChecking && interactions.length === 0
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <IWarn />}
                  </View>
                  <View style={{ flex: 1 }}>
                    {interactions.length > 0 ? (
                      <>
                        <Text style={s.ixBannerTitle}>
                          {interactions.length} interaction{interactions.length > 1 ? 's' : ''} detected
                        </Text>
                        <Text style={s.ixBannerSub}>
                          {aiChecking ? 'AI analysis running…' : 'Tap to review'}
                        </Text>
                      </>
                    ) : (
                      <Text style={s.ixBannerTitle}>Checking interactions…</Text>
                    )}
                  </View>
                  {interactions.length > 0 && (
                    <View style={[s.sevBadge, { backgroundColor: C.terracottaSoft }]}>
                      <Text style={[s.sevText, { color: C.terracotta }]}>
                        {interactions[0]?.sev === 'major' ? 'MAJOR' : interactions[0]?.sev === 'moderate' ? 'MODERATE' : 'MINOR'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* Active section */}
              {activeMeds.length > 0 && (
                <View style={s.section}>
                  <View style={s.sectionHead}>
                    <Text style={s.sectionTitle}>Active</Text>
                    <Text style={s.sectionCount}>{String(activeMeds.length).padStart(2, '0')}</Text>
                  </View>
                  <View style={s.listCard}>
                    {activeMeds.map((med, idx) => (
                      <View key={med.id}>
                        <MedRow
                          med={med}
                          colorIndex={idx}
                          scheduleTimes={scheduleMap[med.name]?.times ?? null}
                          isStopped={false}
                          onEdit={openEdit}
                          onMarkStopped={handleMarkStopped}
                          onMarkActive={handleMarkActive}
                          onDelete={handleDelete}
                        />
                        {idx < activeMeds.length - 1 && <View style={s.rowDivider} />}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Stopped section */}
              {stoppedMeds.length > 0 && (
                <View style={s.section}>
                  <View style={s.sectionHead}>
                    <Text style={[s.sectionTitle, { color: C.muted }]}>Stopped</Text>
                    <Text style={s.sectionCount}>{String(stoppedMeds.length).padStart(2, '0')}</Text>
                  </View>
                  <View style={[s.listCard, { opacity: 0.75 }]}>
                    {stoppedMeds.map((med, idx) => (
                      <View key={med.id}>
                        <MedRow
                          med={med}
                          colorIndex={idx + activeMeds.length}
                          scheduleTimes={null}
                          isStopped
                          onEdit={openEdit}
                          onMarkStopped={handleMarkStopped}
                          onMarkActive={handleMarkActive}
                          onDelete={handleDelete}
                        />
                        {idx < stoppedMeds.length - 1 && <View style={s.rowDivider} />}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── Interaction detail modal ── */}
      {selectedIx && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedIx(null)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
            <View style={s.modalTopBar}>
              <TouchableOpacity style={s.modalCloseBtn} onPress={() => setSelectedIx(null)}>
                <IClose />
              </TouchableOpacity>
              <Text style={s.modalTopTitle}>Interaction</Text>
              <View style={s.modalCloseBtn} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <Text style={[s.sectionTitle, { fontSize: 22 }]}>{selectedIx.a}</Text>
                <Text style={{ fontSize: 16, color: C.mutedSoft }}>{selectedIx.isCondition ? '+' : '×'}</Text>
                <Text style={[s.sectionTitle, { fontSize: 22, color: selectedIx.isCondition ? C.forest : C.forestDeep }]}>{selectedIx.b}</Text>
              </View>
              {selectedIx.isCondition && (
                <Text style={{ fontSize: 11, color: C.mutedSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>Drug + Condition interaction</Text>
              )}
              {(() => {
                const sev = selectedIx.sev === 'major' ? { bg: '#FBE3D9', color: C.terracotta, label: 'MAJOR' }
                  : selectedIx.sev === 'moderate' ? { bg: '#F5E4C9', color: '#C7973A', label: 'MODERATE' }
                  : { bg: C.sageSoft, color: '#2E4942', label: 'MINOR' };
                return (
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 22 }}>
                    <View style={[s.sevBadge, { backgroundColor: sev.bg, paddingHorizontal: 10, paddingVertical: 5 }]}>
                      <Text style={[s.sevText, { color: sev.color, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 }]}>{sev.label}</Text>
                    </View>
                    <View style={[s.sevBadge, { backgroundColor: sev.bg, paddingHorizontal: 10, paddingVertical: 5 }]}>
                      <Text style={[s.sevText, { color: sev.color, fontSize: 11 }]}>{selectedIx.label}</Text>
                    </View>
                  </View>
                );
              })()}
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.mutedSoft, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>WHAT HAPPENS</Text>
              <Text style={{ fontSize: 14.5, color: C.ink, lineHeight: 22, marginBottom: 24 }}>{selectedIx.why}</Text>
              <View style={{ backgroundColor: C.forestDeep, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center' }}>
                  <IWarn />
                </View>
                <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.80)', lineHeight: 18, flex: 1 }}>
                  Always consult the prescribing physician or pharmacist before changing or stopping any medication.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* ── Add / Edit medication modal ── */}
      <Modal visible={showModal} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
          {/* Top bar */}
          <View style={s.amTopBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => setShowModal(false)}>
              <IBack />
            </TouchableOpacity>
            <Text style={s.amTopTitle}>{editingMed ? 'Edit medication' : 'Add medication'}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={s.amCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={s.amHero}>
            <Text style={s.amHeroTitle}>
              {editingMed ? 'Update this medication.' : 'A new med, kept right.'}
            </Text>
            <Text style={s.amHeroSub}>
              {personName ? `For ${personName}. ` : ''}Only the name is required.
            </Text>
          </View>

          <ScrollView contentContainerStyle={s.amContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Medication name */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Medication name</Text>
              <View style={s.input}>
                <TextInput
                  style={s.inputText}
                  placeholder="e.g. Metoprolol"
                  placeholderTextColor={C.mutedSoft}
                  value={form.name}
                  onChangeText={handleNameChange}
                  autoCapitalize="words"
                />
              </View>
              {form.name.trim().length > 0 && (
                <Text style={s.fieldHint}>We'll check for interactions with your other medications.</Text>
              )}
            </View>
            {searchingDrug && <ActivityIndicator size="small" color={C.forest} style={{ marginTop: -8, marginBottom: 8, alignSelf: 'flex-start' }} />}
            {drugSuggestions.length > 0 && (
              <View style={s.suggestionBox}>
                {drugSuggestions.map((d, i) => (
                  <TouchableOpacity key={i} style={[s.suggRow, i < drugSuggestions.length - 1 && s.suggRowBorder]}
                    onPress={() => { setForm(f => ({ ...f, name: d.name })); setDrugSuggestions([]); }}>
                    <Text style={s.suggName}>{d.name}</Text>
                    {d.strengthHint ? <Text style={s.suggBrand}>{d.strengthHint}</Text> : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Brand name */}
            <View style={s.field}>
              <View style={s.fieldLabelRow}>
                <Text style={s.fieldLabel}>Brand name</Text>
                <Text style={s.fieldOpt}>Optional</Text>
              </View>
              <View style={s.input}>
                <TextInput
                  style={s.inputText}
                  placeholder="e.g. Lopressor"
                  placeholderTextColor={C.mutedSoft}
                  value={form.brand}
                  onChangeText={handleBrandChange}
                  autoCapitalize="words"
                />
              </View>
            </View>
            {searchingBrand && <ActivityIndicator size="small" color={C.forest} style={{ marginTop: -8, marginBottom: 8, alignSelf: 'flex-start' }} />}
            {brandSuggestions.length > 0 && (
              <View style={s.suggestionBox}>
                {brandSuggestions.map((b, i) => (
                  <TouchableOpacity key={i} style={[s.suggRow, i < brandSuggestions.length - 1 && s.suggRowBorder]}
                    onPress={() => { setForm(f => ({ ...f, brand: b })); setBrandSuggestions([]); }}>
                    <Text style={s.suggName}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Dose + Supply side by side */}
            <View style={s.fieldRow}>
              <View style={[s.field, { flex: 1 }]}>
                <View style={s.fieldLabelRow}>
                  <Text style={s.fieldLabel}>Dose</Text>
                  <Text style={s.fieldOpt}>Optional</Text>
                </View>
                <View style={[s.input, { flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput style={[s.inputText, { flex: 1 }]} placeholder="e.g. 50"
                    placeholderTextColor={C.mutedSoft}
                    value={form.dose} onChangeText={t => setForm(f => ({ ...f, dose: t }))}
                    keyboardType="decimal-pad" />
                  <Text style={{ fontSize: 13, color: C.muted, marginRight: 14 }}>mg</Text>
                </View>
              </View>
              <View style={[s.field, { flex: 1 }]}>
                <View style={s.fieldLabelRow}>
                  <Text style={s.fieldLabel}>Supply</Text>
                  <Text style={s.fieldOpt}>Optional</Text>
                </View>
                <View style={[s.input, { flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="e.g. 30"
                    placeholderTextColor={C.mutedSoft}
                    value={sched.supply}
                    onChangeText={v => setSched(sc => ({ ...sc, supply: v }))}
                    keyboardType="numeric"
                  />
                  <Text style={{ fontSize: 13, color: C.muted, marginRight: 14 }}>doses</Text>
                </View>
              </View>
            </View>

            {/* Prescriber */}
            <View style={s.field}>
              <View style={s.fieldLabelRow}>
                <Text style={s.fieldLabel}>Prescribing doctor</Text>
                <Text style={s.fieldOpt}>Optional</Text>
              </View>
              <View style={s.input}>
                <TextInput style={s.inputText} placeholder="e.g. Dr. Patel" placeholderTextColor={C.mutedSoft}
                  value={form.prescriber} onChangeText={t => setForm(f => ({ ...f, prescriber: t }))} />
              </View>
            </View>

            {/* ── Schedule section ── */}
            <View style={s.schedDivider} />

            <View style={s.schedToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.schedToggleTitle}>Enable schedule</Text>
                <Text style={s.schedToggleSub}>Set up daily reminders with specific times</Text>
              </View>
              <Switch
                value={sched.enabled}
                onValueChange={v => setSched(sc => ({ ...sc, enabled: v }))}
                trackColor={{ false: C.line, true: C.forest }}
                thumbColor="#fff"
              />
            </View>

            {sched.enabled && (
              <>
                {/* Frequency type chips */}
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Frequency</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}>
                    {FREQ_OPTIONS.map(opt => {
                      const active = sched.freq === opt.key;
                      return (
                        <TouchableOpacity key={opt.key}
                          style={[s.chip, active && s.chipActive]}
                          onPress={() => setSched(sc => ({ ...sc, freq: opt.key, times: opt.defaultTimes.length ? [...opt.defaultTimes] : sc.times }))}>
                          <Text style={[s.chipText, active && s.chipTextActive]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Custom days */}
                {sched.freq === 'custom_days' && (
                  <View style={s.field}>
                    <Text style={s.fieldLabel}>Days of week</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {DAYS_OF_WEEK.map(d => {
                        const sel = sched.daysOfWeek.includes(d);
                        return (
                          <TouchableOpacity key={d}
                            style={[s.chip, sel && s.chipActive]}
                            onPress={() => setSched(sc => ({
                              ...sc,
                              daysOfWeek: sel ? sc.daysOfWeek.filter(x => x !== d) : [...sc.daysOfWeek, d]
                            }))}>
                            <Text style={[s.chipText, sel && s.chipTextActive]}>{d}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Times */}
                {sched.freq !== 'prn' && (
                  <View style={s.field}>
                    <Text style={s.fieldLabel}>Time{sched.times.length > 1 ? 's' : ''}</Text>
                    {sched.times.map((t, idx) => (
                      <TouchableOpacity key={idx}
                        style={[s.timeRow, timePickerIdx === idx && s.timeRowActive]}
                        onPress={() => setTimePickerIdx(timePickerIdx === idx ? null : idx)}>
                        <Text style={s.timeRowLabel}>Dose {idx + 1}</Text>
                        <Text style={s.timeRowValue}>{formatTime(t)}</Text>
                      </TouchableOpacity>
                    ))}
                    {timePickerIdx !== null && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}
                        contentContainerStyle={{ gap: 8, flexDirection: 'row' }}>
                        {HOUR_OPTIONS.map(opt => {
                          const sel = sched.times[timePickerIdx] === opt.value;
                          return (
                            <TouchableOpacity key={opt.value}
                              style={[s.chip, sel && s.chipActive]}
                              onPress={() => {
                                const updated = [...sched.times];
                                updated[timePickerIdx] = opt.value;
                                setSched(sc => ({ ...sc, times: updated }));
                                setTimePickerIdx(null);
                              }}>
                              <Text style={[s.chipText, sel && s.chipTextActive]}>{opt.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                )}

                {/* Food instruction */}
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Food instruction</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {FOOD_OPTIONS.map(opt => {
                      const active = sched.food === opt.key;
                      return (
                        <TouchableOpacity key={opt.key}
                          style={[s.chip, active && s.chipSage]}
                          onPress={() => setSched(sc => ({ ...sc, food: opt.key }))}>
                          <Text style={[s.chipText, active && s.chipTextSage]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

              </>
            )}

            {/* Save error */}
            {saveError ? (
              <View style={{ backgroundColor: '#FBE3D9', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: C.terracotta }}>{saveError}</Text>
              </View>
            ) : null}

            {/* Save button */}
            <TouchableOpacity
              style={[s.saveBtn, (!form.name.trim() || saving) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!form.name.trim() || saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>{editingMed ? 'Save changes' : 'Add medication'}</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: C.forestDeep, borderRadius: 99,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 48 },

  // Hero card
  heroCard: {
    backgroundColor: C.forestDeep, borderRadius: 20, padding: 20,
    marginBottom: 16, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  heroRings: { position: 'absolute', right: -40, top: -40 },
  heroValue: { fontFamily: 'Georgia', fontSize: 28, color: '#fff', fontWeight: '400', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  heroReminderBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 8, flexShrink: 0,
  },
  heroReminderText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  // Interaction banner
  ixBanner: {
    backgroundColor: '#FBE3D9', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  ixBannerDot: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: C.terracotta,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ixBannerTitle: { fontSize: 13.5, fontWeight: '600', color: C.ink },
  ixBannerSub: { fontSize: 11.5, color: C.muted, marginTop: 1 },

  // Section
  section: { marginBottom: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  sectionTitle: {
    fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep,
    fontWeight: '500', letterSpacing: -0.3,
  },
  sectionCount: { fontSize: 11, color: C.muted, letterSpacing: 0.4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // List card
  listCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden',
  },
  listRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  rowDivider: { height: 1, backgroundColor: C.lineSoft, marginHorizontal: 16 },

  // Med row
  medRow: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  medDot: {
    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  medDotGradient: {
    position: 'absolute', inset: 0, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
    // React Native doesn't support CSS gradients inline, use a View overlay
  },
  medDotInitial: { fontFamily: 'Georgia', fontSize: 13, color: '#fff', fontWeight: '500' },
  medNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  medName: { fontSize: 14, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  medDose: { fontSize: 11.5, color: C.muted },
  medFreq: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  medRight: { flexShrink: 0, alignItems: 'flex-end', gap: 3 },
  medCountText: {
    fontSize: 11, color: C.forest, fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  medCountDay: { color: C.muted, fontWeight: '400' },
  medTimeChips: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' },
  medTimeChip: {
    backgroundColor: C.cream, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  medTimeChipText: {
    fontSize: 9, color: C.muted, letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  medReminderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.sageSoft, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  medReminderText: { fontSize: 10, color: C.forest, fontWeight: '600' },
  stoppedChip: {
    backgroundColor: C.terracottaSoft, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  stoppedChipText: { fontSize: 10, color: C.terracotta, fontWeight: '600' },
  medActions: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  medAction: { fontSize: 12, fontWeight: '500' },

  // Severity badge
  sevBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  sevText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Interaction row elements
  ixDot: {
    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  ixTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ixDrugName: { fontSize: 13.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  ixTimes: { fontSize: 11, color: C.mutedSoft },
  ixTapHint: { fontSize: 10.5, color: C.mutedSoft, marginTop: 4 },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: C.line,
    padding: 24, alignItems: 'center', marginTop: 20,
  },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, letterSpacing: -0.4 },
  emptySub: { fontSize: 13, color: C.muted, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  emptyBtn: {
    marginTop: 16, backgroundColor: C.forestDeep,
    borderRadius: 99, paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Modal top bar
  modalTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTopTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },

  // Add/Edit modal
  amTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  amTopTitle: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500' },
  amCancelText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  amHero: { paddingHorizontal: 20, paddingVertical: 20 },
  amHeroTitle: {
    fontFamily: 'Georgia', fontSize: 26, color: C.forestDeep,
    fontWeight: '400', letterSpacing: -0.6, lineHeight: 30,
  },
  amHeroSub: { fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 18 },
  amContent: { paddingHorizontal: 20, paddingBottom: 48 },

  // Form fields
  field: { marginBottom: 20 },
  fieldRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fieldLabel: {
    fontSize: 11, color: C.muted, fontWeight: '600',
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6,
  },
  fieldOpt: { fontSize: 10.5, color: C.mutedSoft, fontStyle: 'italic' },
  fieldHint: { fontSize: 11.5, color: C.mutedSoft, fontStyle: 'italic', marginTop: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  inputText: { fontSize: 15, color: C.ink },

  // Drug suggestions
  suggestionBox: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden',
    marginBottom: 12,
  },
  suggRow: { paddingHorizontal: 14, paddingVertical: 10 },
  suggRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  suggName: { fontSize: 14, color: C.ink, fontWeight: '500' },
  suggBrand: { fontSize: 11.5, color: C.muted, marginTop: 1 },

  // Schedule
  schedDivider: { height: 1, backgroundColor: C.lineSoft, marginVertical: 20 },
  schedToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  schedToggleTitle: { fontFamily: 'Georgia', fontSize: 15, color: C.forestDeep, fontWeight: '500' },
  schedToggleSub: { fontSize: 11.5, color: C.muted, marginTop: 2 },

  // Chips
  chip: {
    height: 36, borderRadius: 99, paddingHorizontal: 14,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  chipText: { fontSize: 13, color: C.ink, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  chipSage: { backgroundColor: C.sageSoft, borderColor: C.sageSoft },
  chipTextSage: { color: '#2E4942' },

  // Time row
  timeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 14, paddingVertical: 11,
    marginBottom: 6,
  },
  timeRowActive: { borderColor: C.forestDeep },
  timeRowLabel: { fontSize: 13, color: C.muted },
  timeRowValue: { fontSize: 15, color: C.forestDeep, fontWeight: '500' },

  // Save button
  saveBtn: {
    height: 54, borderRadius: 16, backgroundColor: C.forestDeep,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontFamily: 'Georgia', fontSize: 16, color: '#fff', fontWeight: '400', letterSpacing: -0.2 },
});
