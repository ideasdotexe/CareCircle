import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme';
import { supabase } from '../lib/supabase';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconBack({ color = colors.ink }) {
  return (
    <Svg width="9" height="16" viewBox="0 0 9 16">
      <Path d="M8 1L1 8l7 7" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Vital config ─────────────────────────────────────────────────────────────

const VITAL_META = {
  bp:     { label: 'Blood pressure', unit: 'mmHg',   rail: '#C66E4E', ranges: { highSys: 140, highDia: 90, lowSys: 90, lowDia: 60 } },
  sugar:  { label: 'Blood sugar',    unit: 'mmol/L', rail: '#3F5D54', ranges: { low: 4, high: 7.8 } },
  hr:     { label: 'Heart rate',     unit: 'bpm',    rail: '#7A5A3F', ranges: { low: 50, high: 100 } },
  weight: { label: 'Weight',         unit: 'kg',     rail: '#A8B5A0' },
  spo2:   { label: 'SpO₂',           unit: '%',      rail: '#3F5D54', ranges: { low: 94, high: 100 } },
  temp:   { label: 'Temperature',    unit: '°C',     rail: '#C66E4E', ranges: { low: 36, high: 37.5 } },
};

function getFlag(type, value) {
  const m = VITAL_META[type];
  if (!m || !m.ranges) return 'normal';
  if (type === 'bp') {
    if (!value || !value.includes('/')) return 'normal';
    const [s, d] = value.split('/').map(parseFloat);
    if (isNaN(s) || isNaN(d)) return 'normal';
    if (s >= m.ranges.highSys || d >= m.ranges.highDia) return 'high';
    if (s < m.ranges.lowSys || d < m.ranges.lowDia) return 'low';
    return 'normal';
  }
  const n = parseFloat(value);
  if (isNaN(n)) return 'normal';
  if (n > m.ranges.high) return 'high';
  if (n < m.ranges.low) return 'low';
  return 'normal';
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return 'Today, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── VitalChip ────────────────────────────────────────────────────────────────

function VitalChip({ reading, onPress }) {
  const meta = VITAL_META[reading.type] || { label: reading.type, unit: '', rail: colors.sage };
  const flag = getFlag(reading.type, reading.value);
  const tone =
    flag === 'high' ? { bg: '#FBE3D9', fg: colors.terracotta, label: 'HIGH' } :
    flag === 'low'  ? { bg: '#FBE7D0', fg: '#D49542',          label: 'LOW' } :
                      { bg: colors.sageSoft, fg: colors.forest, label: 'OK' };

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.chipRail, { backgroundColor: meta.rail }]} />
      <View style={{ paddingLeft: 10, flex: 1 }}>
        <View style={styles.chipTop}>
          <Text style={styles.chipLabel}>{meta.label}</Text>
          {flag !== 'normal' && (
            <View style={[styles.chipFlag, { backgroundColor: tone.bg }]}>
              <Text style={[styles.chipFlagText, { color: tone.fg }]}>{tone.label}</Text>
            </View>
          )}
        </View>
        <View style={styles.chipValueRow}>
          <Text style={styles.chipValue}>{reading.value}</Text>
          <Text style={styles.chipUnit}> {meta.unit}</Text>
        </View>
        <Text style={styles.chipTime}>{relativeTime(reading.recorded_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function BPSparkline({ data }) {
  if (data.length < 2) return null;
  const chartW = SCREEN_W - 80;
  const chartH = 80;
  const threshold = 140;

  const values = data.map(r => {
    const parts = r.value?.split('/');
    return parts ? parseFloat(parts[0]) : null;
  }).filter(n => n !== null);

  if (values.length < 2) return null;

  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const thresholdY = chartH - ((threshold - min) / (max - min)) * chartH;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * chartW;
    const y = chartH - ((v - min) / (max - min)) * chartH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View>
      <Svg width={chartW} height={chartH} style={{ marginTop: 10, overflow: 'visible' }}>
        <Line x1="0" y1={thresholdY} x2={chartW} y2={thresholdY} stroke={colors.terracotta} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <Polyline points={pts} fill="none" stroke={colors.forest} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * chartW;
          const y = chartH - ((v - min) / (max - min)) * chartH;
          const flagged = v >= threshold;
          return <Circle key={i} cx={x} cy={y} r={flagged ? 3 : 2.2} fill={flagged ? colors.terracotta : colors.forest} />;
        })}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={styles.sparkDate}>{formatDate(data[data.length - 1]?.recorded_at).split(',')[0]}</Text>
        <Text style={styles.sparkDate}>{formatDate(data[0]?.recorded_at).split(',')[0]}</Text>
      </View>
    </View>
  );
}

// ─── Reading log row ──────────────────────────────────────────────────────────

function ReadingRow({ reading, unit, isLast }) {
  const flag = getFlag(reading.type, reading.value);
  const tone =
    flag === 'high' ? { fg: colors.terracotta } :
    flag === 'low'  ? { fg: '#D49542' } :
                      { fg: colors.ink };
  return (
    <View style={[styles.logRow, !isLast && styles.logRowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.logValue, { color: tone.fg }]}>{reading.value} <Text style={styles.logUnit}>{unit}</Text></Text>
        {(reading.context || reading.notes) && (
          <Text style={styles.logNote}>{reading.context || reading.notes}</Text>
        )}
      </View>
      <Text style={styles.logDate}>{formatDate(reading.recorded_at)}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VitalsHistoryScreen({ navigation, route }) {
  const personId = route?.params?.personId || route?.params?.person?.id;
  const personName = route?.params?.personName || route?.params?.person?.name || route?.params?.person?.first_name || '';

  const [allReadings, setAllReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(null); // null = overview, or 'bp'|'sugar'|etc.

  const load = useCallback(async () => {
    if (!personId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('vitals')
        .select('id, type, value, notes, context, recorded_at')
        .eq('person_id', personId)
        .order('recorded_at', { ascending: false })
        .limit(100);
      setAllReadings(data || []);
    } catch (e) {
      console.error('[VitalsHistory] load error:', e);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Most recent per type (for overview chips)
  const latestPerType = (() => {
    const seen = new Set();
    return allReadings.filter(r => { if (seen.has(r.type)) return false; seen.add(r.type); return true; });
  })();

  // Latest overall
  const mostRecent = allReadings[0];

  // BP readings for sparkline
  const bpReadings = allReadings.filter(r => r.type === 'bp').slice(0, 14).reverse();

  // Filtered readings for detail view
  const filteredReadings = activeType ? allReadings.filter(r => r.type === activeType) : [];
  const activeMeta = activeType ? VITAL_META[activeType] : null;

  const navigateToLog = () => {
    navigation.navigate('VitalsEntry', { personId, personName });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
          <IconBack />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.topTitle}>Vitals</Text>
          {personName ? <Text style={styles.topSub}>{personName}</Text> : null}
        </View>
        <TouchableOpacity style={styles.topBtn}>
          <IconDots />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.forest} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Last reading summary */}
          <View style={styles.summaryCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryEyebrow}>Last reading</Text>
              <Text style={styles.summaryValue}>
                {mostRecent ? relativeTime(mostRecent.recorded_at) : 'No readings yet'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logBtn} onPress={navigateToLog}>
              <Text style={styles.logBtnText}>+ Log reading</Text>
            </TouchableOpacity>
          </View>

          {/* Type filter pills */}
          {latestPerType.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              <TouchableOpacity
                style={[styles.typePill, !activeType && styles.typePillActive]}
                onPress={() => setActiveType(null)}
              >
                <Text style={[styles.typePillText, !activeType && styles.typePillTextActive]}>Overview</Text>
              </TouchableOpacity>
              {Object.keys(VITAL_META).filter(k => latestPerType.some(r => r.type === k)).map(k => (
                <TouchableOpacity
                  key={k}
                  style={[styles.typePill, activeType === k && styles.typePillActive]}
                  onPress={() => setActiveType(k)}
                >
                  <Text style={[styles.typePillText, activeType === k && styles.typePillTextActive]}>
                    {VITAL_META[k].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Overview mode */}
          {!activeType && (
            <>
              {latestPerType.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No vitals recorded yet.</Text>
                  <TouchableOpacity onPress={navigateToLog}>
                    <Text style={styles.emptyAction}>Log first reading</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Current</Text>
                  <View style={styles.chipGrid}>
                    {latestPerType.map((r, i) => (
                      <View key={r.id} style={{ width: '48%' }}>
                        <VitalChip reading={r} onPress={() => setActiveType(r.type)} />
                      </View>
                    ))}
                  </View>

                  {bpReadings.length >= 2 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Trends</Text>
                        <TouchableOpacity onPress={() => setActiveType('bp')}>
                          <Text style={styles.sectionAction}>Open chart →</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.trendCard}>
                        <Text style={styles.trendLabel}>BLOOD PRESSURE · {bpReadings.length} READINGS</Text>
                        <BPSparkline data={bpReadings} />
                      </View>
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* Detail mode — filtered readings for one type */}
          {activeType && activeMeta && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{activeMeta.label}</Text>
                <Text style={styles.sectionAction}>{filteredReadings.length} readings</Text>
              </View>

              {/* Sparkline for BP */}
              {activeType === 'bp' && filteredReadings.length >= 2 && (
                <View style={[styles.trendCard, { marginBottom: 20 }]}>
                  <Text style={styles.trendLabel}>SYSTOLIC · 140 mmHg THRESHOLD</Text>
                  <BPSparkline data={filteredReadings.slice(0, 14).reverse()} />
                </View>
              )}

              {/* Stats row */}
              {filteredReadings.length > 0 && activeType !== 'bp' && (
                <View style={styles.statsRow}>
                  {(() => {
                    const nums = filteredReadings.map(r => parseFloat(r.value)).filter(n => !isNaN(n));
                    const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '—';
                    const high = nums.length ? Math.max(...nums).toFixed(1) : '—';
                    const low = nums.length ? Math.min(...nums).toFixed(1) : '—';
                    return [
                      { label: 'Average', value: avg },
                      { label: 'Highest', value: high },
                      { label: 'Lowest', value: low },
                    ].map(s => (
                      <View key={s.label} style={styles.statCard}>
                        <Text style={styles.statLabel}>{s.label}</Text>
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statUnit}>{activeMeta.unit}</Text>
                      </View>
                    ));
                  })()}
                </View>
              )}

              {/* Log */}
              <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Reading log</Text>
              {filteredReadings.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No {activeMeta.label.toLowerCase()} readings yet.</Text>
                </View>
              ) : (
                <View style={styles.listCard}>
                  {filteredReadings.map((r, i) => (
                    <ReadingRow key={r.id} reading={r} unit={activeMeta.unit} isLast={i === filteredReadings.length - 1} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },

  // Top bar
  topBar: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.2 },
  topSub: { fontSize: 10.5, color: colors.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 },

  // Summary card
  summaryCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  summaryEyebrow: { fontSize: 11, color: colors.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  summaryValue: { fontFamily: 'Georgia', fontSize: 15, color: colors.forestDeep, fontWeight: '500', marginTop: 2 },
  logBtn: { height: 36, paddingHorizontal: 14, borderRadius: 99, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  logBtnText: { color: '#fff', fontSize: 12.5, fontWeight: '600', letterSpacing: -0.1 },

  // Type pills
  typePill: { height: 36, paddingHorizontal: 14, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, justifyContent: 'center' },
  typePillActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  typePillText: { fontSize: 12.5, fontWeight: '600', color: colors.ink, letterSpacing: -0.1 },
  typePillTextActive: { color: '#fff' },

  // Section
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.3, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionAction: { fontSize: 12, color: colors.forest, fontWeight: '500' },

  // Chip grid
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, flexDirection: 'row', overflow: 'hidden' },
  chipRail: { position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, borderRadius: 99 },
  chipTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  chipLabel: { fontSize: 10.5, color: colors.muted, letterSpacing: 0.3, textTransform: 'uppercase', flex: 1 },
  chipFlag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, marginLeft: 4 },
  chipFlagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  chipValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  chipValue: { fontFamily: 'Georgia', fontSize: 22, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.4, lineHeight: 26 },
  chipUnit: { fontSize: 10.5, color: colors.muted },
  chipTime: { fontSize: 10.5, color: colors.mutedSoft, marginTop: 2 },

  // Trend card
  trendCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16 },
  trendLabel: { fontSize: 11, color: colors.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  sparkDate: { fontSize: 10, color: colors.mutedSoft, fontVariant: ['tabular-nums'] },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14, alignItems: 'center' },
  statLabel: { fontSize: 10.5, color: colors.muted, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontFamily: 'Georgia', fontSize: 20, color: colors.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  statUnit: { fontSize: 10, color: colors.mutedSoft, marginTop: 1 },

  // List card
  listCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', marginBottom: 20 },
  logRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  logValue: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '500', letterSpacing: -0.3 },
  logUnit: { fontFamily: 'Georgia', fontSize: 12, color: colors.muted, fontWeight: '400' },
  logNote: { fontSize: 11.5, color: colors.muted, marginTop: 2, fontStyle: 'italic' },
  logDate: { fontSize: 11, color: colors.mutedSoft, textAlign: 'right', flexShrink: 0, maxWidth: 110 },

  // Empty
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  emptyAction: { marginTop: 10, fontSize: 13, color: colors.forest, fontWeight: '600' },
});
