import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft, IconShield, IconPill, IconPulse, IconDoc } from '../components/Icons';
import { supabase } from '../lib/supabase';

const SECTIONS = ['Medications', 'Vitals', 'Visit notes', 'Conditions', 'Allergies', 'Documents'];

export default function InviteCaregiverScreen({ navigation, route }) {
  const personId = route?.params?.personId;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Family');
  const [perms, setPerms] = useState(
    SECTIONS.reduce((acc, s) => ({ ...acc, [s]: { v: true, c: false } }), {})
  );
  const [sending, setSending] = useState(false);

  const togVisible = (k) => setPerms(p => ({ ...p, [k]: { v: !p[k].v, c: !p[k].v ? p[k].c : false } }));
  const togContrib = (k) => setPerms(p => ({ ...p, [k]: { v: p[k].v, c: p[k].v ? !p[k].c : false } }));

  const send = async () => {
    if (!email.trim()) { Alert.alert('Email required'); return; }
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const normalEmail = email.trim().toLowerCase();

      // ── Resolve caregiver user ID by email (exact match) ───────────
      let caregiverId = null;
      const { data: cp } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalEmail)
        .maybeSingle();
      caregiverId = cp?.id || null;

      // ── Block if already accepted or pending ──────────────────────
      const { data: existing } = await supabase
        .from('caregiver_requests')
        .select('id, status')
        .eq('owner_id', user.id)
        .eq('caregiver_email', normalEmail)
        .in('status', ['pending', 'accepted'])
        .limit(1)
        .maybeSingle();

      if (existing) {
        const msg = existing.status === 'accepted'
          ? `${normalEmail} is already part of your care team.`
          : `A request to ${normalEmail} is already pending.`;
        Alert.alert('Already exists', msg);
        setSending(false);
        return;
      }

      // ── INSERT ────────────────────────────────────────────────────
      const { error: insertErr } = await supabase
        .from('caregiver_requests')
        .insert({
          owner_id: user.id,
          caregiver_id: caregiverId,
          caregiver_email: normalEmail,
          role,
          status: 'pending',
          permissions: perms,
          ...(personId ? { person_id: personId } : {}),
        });

      if (insertErr) {
        if (insertErr.code === '23505' || insertErr.message?.includes('duplicate') || insertErr.message?.includes('unique')) {
          Alert.alert('Already sent', `A request to ${normalEmail} is already pending.`);
          return;
        }
        throw insertErr;
      }

      // ── In-app notification for the caregiver ───────────────────────
      if (caregiverId) {
        const { data: ownerProfile } = await supabase
          .from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        await supabase.from('notifications').insert({
          user_id: caregiverId,
          type: 'care_request',
          title: 'New care request',
          body: `${ownerProfile?.full_name || 'Someone'} invited you to be their caregiver.`,
          read: false,
        });
      }

      Alert.alert('Request sent', `Request sent to ${normalEmail}.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Invite caregiver</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ padding: 24 }}>
          <Text style={styles.label}>THEIR EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="them@email.com"
            placeholderTextColor={colors.mutedSoft}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <Text style={styles.label}>THEIR ROLE</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {[
              { k: 'Family', t: 'Family / Friend', sub: 'Trusted helper' },
              { k: 'PSW', t: 'Professional PSW', sub: 'Paid caregiver' },
            ].map(r => {
              const active = role === r.k;
              return (
                <TouchableOpacity key={r.k} onPress={() => setRole(r.k)} style={[styles.roleBtn, active && styles.roleBtnActive]}>
                  <Text style={[styles.roleBtnTitle, active && { color: '#fff' }]}>{r.t}</Text>
                  <Text style={[styles.roleBtnSub, active && { color: 'rgba(255,255,255,0.7)' }]}>{r.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 10 }}>
            <Text style={styles.label}>WHAT CAN THEY SEE?</Text>
            <Text style={styles.permSub}>VIEW · CONTRIBUTE</Text>
          </View>
          <View style={styles.permsCard}>
            {SECTIONS.map((k, i) => (
              <View key={k} style={[styles.permRow, i < SECTIONS.length - 1 && styles.permRowBorder]}>
                <View style={[styles.permIcon, { backgroundColor: perms[k].v ? colors.sageSoft : colors.cream }]}>
                  {k === 'Medications' ? <IconPill color={perms[k].v ? colors.forest : colors.muted} /> :
                   k === 'Vitals' ? <IconPulse color={perms[k].v ? colors.forest : colors.muted} /> :
                   <IconDoc color={perms[k].v ? colors.forest : colors.muted} />}
                </View>
                <Text style={[styles.permLabel, !perms[k].v && { color: colors.muted }]}>{k}</Text>
                <Toggle on={perms[k].v} onPress={() => togVisible(k)} />
                <Toggle on={perms[k].v && perms[k].c} onPress={() => togContrib(k)} disabled={!perms[k].v} accent={colors.terracotta} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingHorizontal: 4 }}>
            <IconShield />
            <Text style={styles.permNote}>Server-side enforced. Sections you turn off are never sent.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send invite</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Toggle({ on, onPress, disabled, accent }) {
  const fg = accent || colors.forestDeep;
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.toggleTrack, { backgroundColor: on ? fg : '#E5DDD0', opacity: disabled ? 0.4 : 1 }]}>
      <View style={[styles.toggleThumb, on && { left: 16 }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  permSub: { fontSize: 10.5, color: colors.mutedSoft, letterSpacing: 0.3 },
  input: { marginTop: 8, height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 16, fontSize: 16, color: colors.ink },
  roleBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line, backgroundColor: '#fff' },
  roleBtnActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  roleBtnTitle: { fontSize: 13.5, fontWeight: '600', color: colors.ink },
  roleBtnSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  permsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  permRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  permIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  permLabel: { flex: 1, fontSize: 13.5, fontWeight: '500', color: colors.ink },
  permNote: { fontSize: 11, color: colors.mutedSoft, flex: 1 },
  toggleTrack: { width: 36, height: 22, borderRadius: 99, position: 'relative' },
  toggleThumb: { position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: 99, backgroundColor: '#fff' },
  footer: { padding: 20, paddingTop: 14, paddingBottom: 30, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.cream },
  sendBtn: { height: 52, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
