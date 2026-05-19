import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { normalizeSupabaseCaregiver } from '../data/caregivers';
import { PhotoTile, Stars } from './FindCaregiverScreen';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', sage: '#A8B5A0', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ─── Atoms ───────────────────────────────────────────────
function SectionTitle({ title, count, accent }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={at.sectionTitle}>{title}</Text>
        {count != null && (
          <Text style={{
            fontSize: 11, color: C.muted, letterSpacing: 0.4,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
          }}>{String(count).padStart(2, '0')}</Text>
        )}
      </View>
      {!!accent && <Text style={{ fontSize: 11, color: C.muted, letterSpacing: 0.2 }}>{accent}</Text>}
    </View>
  );
}

function StatTile({ big, label, stars }) {
  return (
    <View style={at.statTile}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={at.statBig}>{big}</Text>
        {stars && (
          <Svg width={11} height={11} viewBox="0 0 11 11">
            <Path d="M5.5 1l1.4 2.8 3.1.5-2.3 2.2.5 3.1L5.5 8.1 2.8 9.6l.5-3.1L1 4.3l3.1-.5L5.5 1z" fill="#D49542" />
          </Svg>
        )}
      </View>
      <Text style={at.statLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ label, value }) {
  return (
    <View style={at.infoCard}>
      <Text style={at.infoLabel}>{label}</Text>
      <Text style={at.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function VerifiedTag() {
  return (
    <View style={at.verifiedTag}>
      <Svg width={10} height={10} viewBox="0 0 11 11">
        <Path d="M5.5 1l1.2.8 1.4-.2.4 1.4 1.2.9-.6 1.3.4 1.4-1.3.4-.7 1.3-1.4-.4L5.5 8l-1-1-1.4.4-.7-1.3-1.3-.4.4-1.4L1 3l1.2-.9.4-1.4 1.4.2L5.5 1z" fill="#fff" />
        <Path d="M3.5 5.5l1.5 1.5 3-3" stroke={C.forest} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={at.verifiedText}>Verified pro</Text>
    </View>
  );
}

function ReviewRow({ r, isLast }) {
  const initials = (r.who || '').split(' ').map(w => w[0]).join('').slice(0, 2);
  return (
    <View style={[at.reviewRow, !isLast && at.reviewBorder]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={at.reviewAvatar}>
          <Text style={at.reviewAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={at.reviewName}>{r.who}</Text>
          {!!r.rel && <Text style={at.reviewMeta}>{r.rel}</Text>}
        </View>
        <Stars rating={r.stars || 5} size={9} />
      </View>
      <Text style={at.reviewText}>"{r.text}"</Text>
      {!!r.when && <Text style={at.reviewWhen}>{r.when}</Text>}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────
export default function CaregiverPublicProfileScreen({ navigation, route }) {
  const passedCaregiver = route?.params?.caregiver;
  const id = route?.params?.id;

  const [c, setC] = useState(passedCaregiver || null);
  const [loading, setLoading] = useState(!passedCaregiver);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!passedCaregiver && id) {
      (async () => {
        try {
          const { data } = await supabase.from('caregiver_profiles').select('*').eq('id', id).maybeSingle();
          if (data) setC(normalizeSupabaseCaregiver(data));
        } catch (_) {}
        finally { setLoading(false); }
      })();
    }
  }, [id, passedCaregiver]);

  const sendRequest = async () => {
    if (!c._isReal) {
      // Mock profile — simulate
      setSending(true);
      setTimeout(() => { setSending(false); setSent(true); }, 800);
      return;
    }
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('caregiver_requests').insert({
        owner_id: user.id,
        caregiver_id: c.id,
        status: 'pending',
      });
      setSent(true);
    } catch (e) {
      Alert.alert('Could not send', e.message || String(e));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={st.container} edges={['top']}>
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }
  if (!c) {
    return (
      <SafeAreaView style={st.container} edges={['top']}>
        <View style={{ padding: 40 }}>
          <Text style={{ color: C.muted }}>Caregiver not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = c.name || c.full_name || 'Caregiver';
  const firstName = displayName.split(' ')[0];
  const tones = c.photoTone || ['#3F5D54', '#2E4942'];
  const initials = c.initials || displayName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const yearsExp = c.yearsExp || c.years_experience || 0;
  const reviewCount = c.reviewCount || c.review_count || 0;
  const rating = c.rating || 0;
  const languages = Array.isArray(c.languages) ? c.languages : [];
  const specialties = Array.isArray(c.specialties) ? c.specialties : [];
  const reviews = Array.isArray(c.reviews) ? c.reviews : [];

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Top bar */}
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.iconBtn}>
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={st.title}>Caregiver</Text>
        <View style={st.iconBtn}>
          <Svg width={11} height={14} viewBox="0 0 11 14" fill="none">
            <Path d="M1 1h9v12L5.5 10 1 13V1z" stroke={C.muted} strokeWidth={1.3} strokeLinejoin="round" />
          </Svg>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={{ padding: 24, paddingTop: 20, flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
          <PhotoTile tones={tones} initials={initials} size={92} radius={20} />
          <View style={{ flex: 1, paddingTop: 4 }}>
            <Text style={st.name}>{displayName}</Text>
            {!!c.title && <Text style={st.role}>{c.title}</Text>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <Svg width={11} height={13} viewBox="0 0 11 13" fill="none">
                <Path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={C.mutedSoft} strokeWidth={1.3} />
                <Circle cx={5.5} cy={5} r={1.5} stroke={C.mutedSoft} strokeWidth={1.3} />
              </Svg>
              <Text style={st.loc}>
                {[c.region && c.region !== c.city ? c.region : null, c.city, c.province, c.country].filter(Boolean).join(', ')}
              </Text>
            </View>
            {c.verified && <View style={{ marginTop: 10 }}><VerifiedTag /></View>}
          </View>
        </View>

        {/* ── Stat strip ── */}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 8 }}>
          <StatTile big={yearsExp > 0 ? `${yearsExp}` : '—'} label="Years exp." />
          <StatTile big={rating > 0 ? rating.toFixed(1) : '—'} label={`${reviewCount} reviews`} stars={rating > 0} />
          <StatTile big={c.rate || '—'} label="Rate" />
        </View>

        {/* ── About ── */}
        {!!c.bio && (
          <View style={st.section}>
            <SectionTitle title="About" />
            <Text style={st.bodyText}>{c.bio}</Text>
          </View>
        )}

        {/* ── Specialties ── */}
        {specialties.length > 0 && (
          <View style={st.section}>
            <SectionTitle title="Specialties" />
            <View style={st.chipsRow}>
              {specialties.map((s, i) => (
                <View key={i} style={st.chip}><Text style={st.chipText}>{s}</Text></View>
              ))}
            </View>
          </View>
        )}

        {/* ── Languages + Availability ── */}
        {(languages.length > 0 || !!c.available) && (
          <View style={{ paddingHorizontal: 20, paddingTop: 22, flexDirection: 'row', gap: 10 }}>
            {languages.length > 0 && <View style={{ flex: 1 }}><InfoCard label="Languages" value={languages.join(' · ')} /></View>}
            {!!c.available && <View style={{ flex: 1 }}><InfoCard label="Available" value={c.available} /></View>}
          </View>
        )}

        {/* ── Location card ── */}
        {!!c.city && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View style={st.locationCard}>
              <View style={st.mapTile}>
                <Svg width={56} height={56} viewBox="0 0 56 56" style={{ position: 'absolute', opacity: 0.5 }}>
                  <Path d="M0 20 Q15 18 30 24 T56 22" stroke={C.sage} strokeWidth={1} fill="none" />
                  <Path d="M0 38 Q20 36 35 40 T56 38" stroke={C.sage} strokeWidth={1} fill="none" />
                  <Path d="M14 0 L18 56" stroke={C.sage} strokeWidth={0.8} fill="none" opacity="0.7" />
                  <Path d="M38 0 L42 56" stroke={C.sage} strokeWidth={0.8} fill="none" opacity="0.7" />
                </Svg>
                <View style={{ position: 'absolute', top: '38%', left: '50%', marginLeft: -7 }}>
                  <Svg width={14} height={18} viewBox="0 0 14 18">
                    <Path d="M7 1a6 6 0 016 6c0 4.5-6 10-6 10s-6-5.5-6-10a6 6 0 016-6z" fill={C.terracotta} />
                    <Circle cx={7} cy={7} r={2} fill="#fff" />
                  </Svg>
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={st.locLabel}>Location</Text>
                <Text style={st.locCity}>{c.region && c.region !== c.city ? `${c.region}, ` : ''}{c.city}</Text>
                <Text style={st.locProv}>{[c.province, c.country].filter(Boolean).join(' · ')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Reviews ── */}
        <View style={st.section}>
          <SectionTitle
            title="Reviews"
            count={reviewCount}
            accent={rating > 0 ? `★ ${rating.toFixed(1)} average` : undefined}
          />
          <View style={st.listCard}>
            {reviews.length === 0 ? (
              <View style={{ padding: 18 }}>
                <Text style={{ fontSize: 12.5, color: C.muted, textAlign: 'center' }}>No reviews yet.</Text>
              </View>
            ) : reviews.map((r, i) => (
              <ReviewRow key={i} r={r} isLast={i === reviews.length - 1} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={st.footer}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={st.msgBtn}>
            <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <Path d="M1 3a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H6l-3 3v-3H3a2 2 0 01-2-2V3z" stroke={C.forest} strokeWidth={1.4} strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={sendRequest}
            disabled={sent || sending}
            style={[st.sendBtn, sent && { backgroundColor: C.sage }]}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : sent ? (
              <>
                <Svg width={14} height={11} viewBox="0 0 14 11">
                  <Path d="M1 6L5 10L13 1" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={st.sendBtnText}>Request sent</Text>
              </>
            ) : (
              <>
                <Text style={st.sendBtnText}>Send request</Text>
                <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                  <Path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </>
            )}
          </TouchableOpacity>
        </View>
        {!sent && (
          <Text style={st.footerNote}>
            {firstName} sees your name and the role you'd like to fill. No data is shared until they accept.
          </Text>
        )}
        {sent && (
          <Text style={st.footerNote}>
            You'll be notified when {firstName} responds. Usually within 24 hours.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const at = StyleSheet.create({
  sectionTitle: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  statTile: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  statBig: { fontFamily: 'Georgia', fontSize: 22, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.4, lineHeight: 26 },
  statLabel: { fontSize: 10, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  infoLabel: { fontSize: 10, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '600' },
  infoValue: { fontSize: 13, color: C.ink, marginTop: 3, fontWeight: '500', letterSpacing: -0.1, lineHeight: 17 },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: C.forest },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  reviewRow: { padding: 14 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  reviewAvatar: { width: 26, height: 26, borderRadius: 99, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontFamily: 'Georgia', fontSize: 10, color: C.muted, fontWeight: '500' },
  reviewName: { fontSize: 12.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  reviewMeta: { fontSize: 10.5, color: C.mutedSoft, marginTop: 1 },
  reviewText: { marginTop: 8, fontSize: 12.5, color: C.ink, lineHeight: 17, letterSpacing: -0.05 },
  reviewWhen: { marginTop: 6, fontSize: 10, color: C.mutedSoft, letterSpacing: 0.3 },
});

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.2 },
  name: { fontFamily: 'Georgia', fontSize: 22, lineHeight: 26, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.4 },
  role: { fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 17 },
  loc: { fontSize: 11.5, color: C.mutedSoft },
  section: { paddingHorizontal: 24, paddingTop: 22 },
  bodyText: { fontSize: 13, color: C.ink, lineHeight: 19, letterSpacing: -0.05 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line },
  chipText: { fontSize: 12, color: C.ink, fontWeight: '500', letterSpacing: -0.1 },
  listCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  locationCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  mapTile: {
    width: 56, height: 56, borderRadius: 12, flexShrink: 0,
    backgroundColor: C.sageSoft, borderWidth: 1, borderColor: C.lineSoft,
    overflow: 'hidden', position: 'relative',
  },
  locLabel: { fontSize: 11, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '600' },
  locCity: { fontFamily: 'Georgia', fontSize: 15, color: C.forestDeep, fontWeight: '500', marginTop: 2, letterSpacing: -0.2 },
  locProv: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.cream,
    paddingHorizontal: 20, paddingBottom: 30, paddingTop: 16,
  },
  msgBtn: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { flex: 1, height: 54, borderRadius: 16, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
  footerNote: { marginTop: 10, textAlign: 'center', fontSize: 11, color: C.mutedSoft, letterSpacing: 0.1 },
});
