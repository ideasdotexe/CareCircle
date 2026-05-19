import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { supabase } from '../lib/supabase';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconBack({ color = colors.ink }) {
  return (
    <Svg width="9" height="16" viewBox="0 0 9 16">
      <Path d="M8 1L1 8l7 7" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconCheck({ color = colors.forest }) {
  return (
    <Svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <Path d="M1 4.5l3 3 6-6" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Vital type icons
function IconPulse({ color = '#fff' }) {
  return (
    <Svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <Path d="M1 7h3l2-6 4 12 2-6h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconDrop({ color = '#fff' }) {
  return (
    <Svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <Path d="M7 1c0 5-6 6-6 10.5a6 6 0 0012 0C13 7 7 6 7 1z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
function IconHeart({ color = '#fff' }) {
  return (
    <Svg width="16" height="14" viewBox="0 0 16 14" fill="none">
      <Path d="M8 13S1 9 1 5a3 3 0 016-1 3 3 0 016 1c0 4-7 8-7 8z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
function IconScale({ color = '#fff' }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Rect x="1" y="1" width="14" height="14" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M5 6l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconLung({ color = '#fff' }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path d="M8 1v6m0 0c-1.5-2-4-2-5 0-1 2 0 6 2 7 2 .5 3-1 3-3m0-4c1.5-2 4-2 5 0 1 2 0 6-2 7-2 .5-3-1-3-3" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  );
}
function IconThermo({ color = '#fff' }) {
  return (
    <Svg width="10" height="18" viewBox="0 0 10 18" fill="none">
      <Path d="M5 1v11a2 2 0 102 0V1a1 1 0 10-2 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Vital config ─────────────────────────────────────────────────────────────

const VITAL_KINDS = [
  { id: 'bp',     label: 'Blood pressure', short: 'BP',   unit: 'mmHg',   tone: '#C66E4E', Icon: IconPulse, isBP: true,  ranges: { highSys: 140, highDia: 90, lowSys: 90, lowDia: 60 } },
  { id: 'sugar',  label: 'Blood sugar',    short: 'BG',   unit: 'mmol/L', tone: '#3F5D54', Icon: IconDrop,  ranges: { low: 4, high: 7.8 } },
  { id: 'hr',     label: 'Heart rate',     short: 'HR',   unit: 'bpm',    tone: '#7A5A3F', Icon: IconHeart, ranges: { low: 50, high: 100 } },
  { id: 'weight', label: 'Weight',         short: 'Wt',   unit: 'kg',     tone: '#A8B5A0', Icon: IconScale },
  { id: 'spo2',   label: 'SpO₂',           short: 'SpO₂', unit: '%',      tone: '#3F5D54', Icon: IconLung,  ranges: { low: 94, high: 100 } },
  { id: 'temp',   label: 'Temperature',    short: 'T°',   unit: '°C',     tone: '#C66E4E', Icon: IconThermo,ranges: { low: 36, high: 37.5 } },
];

const WHEN_OPTIONS = [
  { k: 'now',       l: 'Just now' },
  { k: 'morning',   l: 'This morning' },
  { k: 'afternoon', l: 'This afternoon' },
  { k: 'evening',   l: 'This evening' },
];

function contextOptionsFor(id) {
  if (id === 'bp')     return [{ k: 'seated', l: 'Seated' }, { k: 'standing', l: 'Standing' }, { k: 'lying', l: 'Lying down' }, { k: 'left', l: 'Left arm' }, { k: 'right', l: 'Right arm' }];
  if (id === 'sugar')  return [{ k: 'fasting', l: 'Fasting' }, { k: 'preMeal', l: 'Before meal' }, { k: 'postMeal', l: 'After meal' }, { k: 'bedtime', l: 'Bedtime' }, { k: 'random', l: 'Random' }];
  if (id === 'hr')     return [{ k: 'resting', l: 'Resting' }, { k: 'active', l: 'Active' }];
  if (id === 'weight') return [{ k: 'morning', l: 'Morning' }, { k: 'evening', l: 'Evening' }];
  if (id === 'temp')   return [{ k: 'oral', l: 'Oral' }, { k: 'ear', l: 'Ear' }, { k: 'forehead', l: 'Forehead' }];
  if (id === 'spo2')   return [{ k: 'rest', l: 'At rest' }, { k: 'exertion', l: 'After exertion' }];
  return [];
}

function contextLabelFor(id) {
  if (id === 'bp')     return 'Position';
  if (id === 'sugar')  return 'Context';
  if (id === 'hr')     return 'State';
  if (id === 'weight') return 'Time of day';
  if (id === 'temp')   return 'Method';
  if (id === 'spo2')   return 'Position';
  return 'Context';
}

function defaultContextFor(id) {
  if (id === 'bp')     return 'seated';
  if (id === 'sugar')  return 'fasting';
  if (id === 'hr')     return 'resting';
  if (id === 'weight') return 'morning';
  if (id === 'temp')   return 'oral';
  return '';
}

function getFlag(kind, sys, dia, val) {
  if (!kind.ranges) return null;
  if (kind.isBP) {
    if (!sys || !dia) return null;
    const s = parseFloat(sys), d = parseFloat(dia);
    if (isNaN(s) || isNaN(d)) return null;
    if (s >= kind.ranges.highSys || d >= kind.ranges.highDia) return 'high';
    if (s < kind.ranges.lowSys  || d < kind.ranges.lowDia)   return 'low';
    return 'normal';
  }
  if (!val) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  if (n > kind.ranges.high) return 'high';
  if (n < kind.ranges.low)  return 'low';
  return 'normal';
}

// ─── Flag pill ────────────────────────────────────────────────────────────────

function FlagPill({ flag }) {
  if (!flag) return null;
  if (flag === 'normal') {
    return (
      <View style={[styles.flagPill, { backgroundColor: colors.sageSoft }]}>
        <Text style={[styles.flagText, { color: '#2E4942' }]}>NORMAL</Text>
      </View>
    );
  }
  const t = flag === 'high'
    ? { bg: '#FBE3D9', fg: colors.terracotta, label: 'HIGH' }
    : { bg: '#FBE7D0', fg: '#C7973A',         label: 'LOW' };
  return (
    <View style={[styles.flagPill, { backgroundColor: t.bg }]}>
      <Text style={[styles.flagText, { color: t.fg }]}>{t.label}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function VitalsEntryScreen({ navigation, route }) {
  const personId   = route?.params?.personId   || route?.params?.person?.id;
  const personName = route?.params?.personName || route?.params?.person?.name || route?.params?.person?.first_name || 'Care recipient';

  const [kindId, setKindId]       = useState('bp');
  const [sys, setSys]             = useState('');
  const [dia, setDia]             = useState('');
  const [value, setValue]         = useState('');
  const [when, setWhen]           = useState('now');
  const [context, setContext]     = useState(defaultContextFor('bp'));
  const [note, setNote]           = useState('');
  const [saving, setSaving]       = useState(false);

  const sysRef = useRef(null);
  const diaRef = useRef(null);
  const valRef = useRef(null);

  const kind = VITAL_KINDS.find(k => k.id === kindId) || VITAL_KINDS[0];
  const contextOptions = contextOptionsFor(kindId);
  const flag = getFlag(kind, sys, dia, value);
  const canSave = kind.isBP ? (sys.length > 0 && dia.length > 0) : value.length > 0;

  useEffect(() => {
    setSys(''); setDia(''); setValue('');
    setContext(defaultContextFor(kindId));
  }, [kindId]);

  const handleSave = async () => {
    if (!canSave || !personId) return;
    setSaving(true);
    try {
      const finalValue = kind.isBP ? `${sys}/${dia}` : value;
      const { error } = await supabase.from('vitals').insert({
        person_id: personId,
        type: kindId,
        value: finalValue,
        notes: note.trim() || null,
        context: context || null,
        recorded_at: new Date().toISOString(),
      });
      if (error) throw error;
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
            <IconBack />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Log reading</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>{personName} · {when === 'now' ? 'just now' : when}</Text>
          <Text style={styles.heroTitle}>How are the numbers today?</Text>
        </View>

        {/* Vital type picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kindScroll} contentContainerStyle={styles.kindScrollContent}>
          {VITAL_KINDS.map(k => {
            const active = k.id === kindId;
            return (
              <TouchableOpacity
                key={k.id}
                onPress={() => setKindId(k.id)}
                style={[styles.kindBtn, active && styles.kindBtnActive]}
                activeOpacity={0.75}
              >
                <View style={[styles.kindIcon, { backgroundColor: k.tone }]}>
                  <k.Icon color="#fff" />
                </View>
                <Text style={[styles.kindLabel, active && { color: '#fff' }]}>{k.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Input card */}
          <View style={styles.inputCard}>
            {/* Card header */}
            <View style={styles.inputCardHeader}>
              <View style={styles.inputCardMeta}>
                <View style={[styles.inputCardIcon, { backgroundColor: kind.tone }]}>
                  <kind.Icon color="#fff" />
                </View>
                <Text style={styles.inputCardLabel}>{kind.label}</Text>
              </View>
              <FlagPill flag={flag} />
            </View>

            {/* Number input */}
            {kind.isBP ? (
              <View style={styles.bpRow}>
                <TextInput
                  ref={sysRef}
                  style={[styles.bigInput, sys && styles.bigInputFilled]}
                  value={sys}
                  onChangeText={v => { const n = v.replace(/\D/g, '').slice(0, 3); setSys(n); if (n.length === 3) diaRef.current?.focus(); }}
                  placeholder="—"
                  placeholderTextColor={colors.mutedSoft}
                  keyboardType="number-pad"
                  maxLength={3}
                  returnKeyType="next"
                  onSubmitEditing={() => diaRef.current?.focus()}
                />
                <Text style={styles.bpSlash}>/</Text>
                <TextInput
                  ref={diaRef}
                  style={[styles.bigInput, dia && styles.bigInputFilled]}
                  value={dia}
                  onChangeText={v => setDia(v.replace(/\D/g, '').slice(0, 3))}
                  placeholder="—"
                  placeholderTextColor={colors.mutedSoft}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.inputUnit}>{kind.unit}</Text>
              </View>
            ) : (
              <View style={styles.singleRow}>
                <TextInput
                  ref={valRef}
                  style={[styles.bigInput, value && styles.bigInputFilled]}
                  value={value}
                  onChangeText={v => setValue(v.replace(/[^0-9.]/g, '').slice(0, 6))}
                  placeholder="—"
                  placeholderTextColor={colors.mutedSoft}
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <Text style={styles.inputUnit}>{kind.unit}</Text>
              </View>
            )}

            {/* Range hint */}
            {kind.ranges && (
              <View style={styles.rangeHint}>
                <Text style={styles.rangeText}>
                  Typical range{kind.isBP ? '' : ` ${kind.ranges.low}–${kind.ranges.high} ${kind.unit}`}
                  {kind.isBP ? ' 90/60–140/90 mmHg' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* When */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHEN</Text>
            <View style={styles.pillRow}>
              {WHEN_OPTIONS.map(o => {
                const active = when === o.k;
                return (
                  <TouchableOpacity
                    key={o.k}
                    onPress={() => setWhen(o.k)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{o.l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Context */}
          {contextOptions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>{contextLabelFor(kindId).toUpperCase()}</Text>
                <Text style={styles.optionalLabel}>Optional</Text>
              </View>
              <View style={styles.pillRow}>
                {contextOptions.map(o => {
                  const active = context === o.k;
                  return (
                    <TouchableOpacity
                      key={o.k}
                      onPress={() => setContext(active ? '' : o.k)}
                      style={[styles.pill, active && styles.pillContextActive]}
                    >
                      <Text style={[styles.pillText, active && styles.pillContextTextActive]}>{o.l}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Note */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>NOTE</Text>
              <Text style={styles.optionalLabel}>Optional</Text>
            </View>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="e.g. measured after a walk, felt a little dizzy…"
              placeholderTextColor={colors.mutedSoft}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Out-of-range nudge */}
          <View style={styles.nudgeCard}>
            <View style={styles.nudgeIcon}>
              <IconCheck color={colors.forest} />
            </View>
            <Text style={styles.nudgeText}>
              Out-of-range readings show as flagged on the dashboard and trigger a check-in nudge.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Sticky save */}
        <View style={styles.saveBar}>
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save reading'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 0 },
  topBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.2 },
  cancelBtn: { height: 36, paddingHorizontal: 12, justifyContent: 'center' },
  cancelText: { fontSize: 13, color: colors.muted, fontWeight: '500' },

  // Hero
  hero: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 0 },
  heroEyebrow: { fontSize: 11, color: colors.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '600' },
  heroTitle: { marginTop: 4, fontFamily: 'Georgia', fontSize: 26, lineHeight: 30, letterSpacing: -0.6, color: colors.forestDeep, fontWeight: '400' },

  // Kind picker
  kindScroll: { marginTop: 18 },
  kindScrollContent: { paddingHorizontal: 20, gap: 8, paddingRight: 24 },
  kindBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingLeft: 8, paddingVertical: 10, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  kindBtnActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  kindIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  kindLabel: { fontSize: 13, fontWeight: '600', color: colors.ink, letterSpacing: -0.1 },

  // Body scroll
  body: { paddingHorizontal: 20, paddingTop: 22 },

  // Input card
  inputCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 22 },
  inputCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  inputCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputCardIcon: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  inputCardLabel: { fontSize: 13.5, fontWeight: '600', color: colors.ink, letterSpacing: -0.1 },

  // BP input
  bpRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, paddingVertical: 10 },
  bpSlash: { fontFamily: 'Georgia', fontSize: 46, color: colors.mutedSoft, fontWeight: '300', lineHeight: 52, paddingBottom: 10 },
  singleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, paddingVertical: 10 },
  bigInput: { width: 90, textAlign: 'center', fontFamily: 'Georgia', fontSize: 56, lineHeight: 62, color: colors.mutedSoft, fontWeight: '400', letterSpacing: -2, padding: 0, paddingBottom: 10 },
  bigInputFilled: { color: colors.forestDeep },
  inputUnit: { fontSize: 14, color: colors.muted, marginBottom: 18, marginLeft: 4 },

  // Range hint
  rangeHint: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.lineSoft, alignItems: 'center' },
  rangeText: { fontSize: 11, color: colors.mutedSoft, letterSpacing: 0.2 },

  // Sections
  section: { marginBottom: 22 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  optionalLabel: { fontSize: 10.5, color: colors.mutedSoft },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pill: { height: 36, paddingHorizontal: 14, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, justifyContent: 'center' },
  pillActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  pillContextActive: { backgroundColor: colors.sageSoft, borderColor: colors.sageSoft },
  pillText: { fontSize: 12.5, fontWeight: '600', color: colors.ink, letterSpacing: -0.1 },
  pillTextActive: { color: '#fff' },
  pillContextTextActive: { color: '#2E4942' },

  // Flag pill
  flagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  flagText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 },

  // Note
  noteInput: { backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: colors.line, padding: 14, fontFamily: 'System', fontSize: 14, color: colors.ink, minHeight: 80, lineHeight: 20 },

  // Nudge
  nudgeCard: { backgroundColor: colors.sageSoft, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  nudgeIcon: { width: 22, height: 22, borderRadius: 99, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nudgeText: { flex: 1, fontSize: 11.5, color: '#2E4942', lineHeight: 16 },

  // Save
  saveBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 14, backgroundColor: 'rgba(246,241,234,0.95)' },
  saveBtn: { height: 54, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { backgroundColor: '#CDC5B6' },
  saveBtnText: { fontSize: 15.5, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },
});
