import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft, IconArrow } from '../components/Icons';
import { supabase } from '../lib/supabase';

export default function CaregiverPublicProfileScreen({ navigation, route }) {
  const initial = route?.params?.caregiver;
  const id = route?.params?.id;
  const [c, setC] = useState(initial);
  const [loading, setLoading] = useState(!initial);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!initial && id) {
      (async () => {
        try {
          const { data } = await supabase.from('caregiver_profiles').select('*').eq('id', id).maybeSingle();
          setC(data);
        } catch (_) {}
        finally { setLoading(false); }
      })();
    }
  }, [id, initial]);

  const sendRequest = async () => {
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }
  if (!c) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: 40 }}>
          <Text>Caregiver not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Caregiver</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ padding: 24, flexDirection: 'row', gap: 16 }}>
          <View style={[styles.avatar, { backgroundColor: '#C66E4E' }]}>
            <Text style={styles.avatarText}>{getInitials(c.full_name || '?')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.full_name}</Text>
            <Text style={styles.role}>{c.title || ''}</Text>
            <Text style={styles.loc}>{[c.city, c.province, c.country].filter(Boolean).join(' · ')}</Text>
            {c.verified && (
              <View style={styles.verifiedTag}><Text style={styles.verifiedText}>VERIFIED PRO</Text></View>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat big={`${c.years_experience || 0}`} label="Years exp." />
          <Stat big={c.rating ? c.rating.toFixed(1) : '—'} label={`${c.review_count || 0} reviews`} />
          <Stat big={c.rate || '—'} label="Rate" />
        </View>

        {!!c.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{c.bio}</Text>
          </View>
        )}

        {Array.isArray(c.specialties) && c.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.chipsRow}>
              {c.specialties.map((s, i) => (
                <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
              ))}
            </View>
          </View>
        )}

        {Array.isArray(c.reviews) && c.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.listCard}>
              {c.reviews.map((r, i) => (
                <View key={i} style={[styles.reviewRow, i < c.reviews.length - 1 && styles.reviewBorder]}>
                  <Text style={styles.reviewName}>{r.who}</Text>
                  <Text style={styles.reviewMeta}>{r.rel}</Text>
                  <Text style={styles.reviewText}>"{r.text}"</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity disabled={sent || sending} style={[styles.sendBtn, sent && { backgroundColor: colors.sage }]} onPress={sendRequest}>
          {sending ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.sendBtnText}>{sent ? 'Request sent' : 'Send request'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Stat({ big, label }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statBig}>{big}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getInitials(name) {
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  avatar: { width: 92, height: 92, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 30, fontWeight: '500' },
  name: { fontFamily: 'Georgia', fontSize: 22, color: colors.forestDeep, fontWeight: '500' },
  role: { fontSize: 12.5, color: colors.muted, marginTop: 4 },
  loc: { fontSize: 11.5, color: colors.muted, marginTop: 8 },
  verifiedTag: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: colors.forest },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  statsRow: { paddingHorizontal: 20, flexDirection: 'row', gap: 8 },
  statTile: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 12 },
  statBig: { fontFamily: 'Georgia', fontSize: 22, color: colors.forestDeep, fontWeight: '500' },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 4, letterSpacing: 0.4 },
  section: { paddingHorizontal: 24, paddingTop: 22 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500', marginBottom: 10 },
  bodyText: { fontSize: 13, color: colors.ink, lineHeight: 19 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  chipText: { fontSize: 12, color: colors.ink, fontWeight: '500' },
  listCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  reviewRow: { padding: 14 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  reviewName: { fontSize: 12.5, fontWeight: '600', color: colors.ink },
  reviewMeta: { fontSize: 10.5, color: colors.mutedSoft, marginTop: 2 },
  reviewText: { marginTop: 8, fontSize: 12.5, color: colors.ink, lineHeight: 17 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: colors.cream },
  sendBtn: { height: 54, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
