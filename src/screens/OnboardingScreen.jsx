import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconArrow, IconCheck, IconChevronLeft } from '../components/Icons';
import { supabase } from '../lib/supabase';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [you, setYou] = useState({ first: '', last: '', dob: '', address: '' });
  const [them, setThem] = useState({ first: '', last: '', dob: '', rel: 'Father', address: '', sameAddress: false });

  const rels = ['Mother', 'Father', 'Spouse', 'Child', 'Parent', 'Other'];

  const finishOnboarding = async (skipPerson) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Save profile — profiles table uses full_name (no separate first/last columns)
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: `${you.first} ${you.last}`.trim(),
        email: user.email,
      });

      if (!skipPerson && them.first.trim()) {
        const addr = them.sameAddress ? you.address : them.address;
        // persons table uses single `name` column
        await supabase.from('persons').insert({
          user_id: user.id,
          name: `${them.first} ${them.last}`.trim(),
          date_of_birth: them.dob || null,
          relationship: them.rel,
          address: addr || null,
        });
      }
    } catch (e) {
      Alert.alert('Could not save', e.message || String(e));
    } finally {
      setSaving(false);
      navigation.reset({ index: 0, routes: [{ name: 'OwnerTabs' }] });
    }
  };

  if (step === 1) {
    const canContinue = you.first.trim().length > 0;
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Header stepNum={1} />
          <View style={styles.headingWrap}>
            <Text style={styles.heading}>First, a little{'\n'}about you.</Text>
            <Text style={styles.subhead}>
              This stays private. Doctors and pharmacies sometimes need it when we share documents on your behalf.
            </Text>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formWrap}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field half label="First name" value={you.first} onChange={(v) => setYou({ ...you, first: v })} placeholder="Priya" />
              <Field half label="Last name" value={you.last} onChange={(v) => setYou({ ...you, last: v })} placeholder="Sharma" />
            </View>
            <View style={{ height: 18 }} />
            <Field label="Date of birth" value={you.dob} onChange={(v) => setYou({ ...you, dob: v })} placeholder="YYYY-MM-DD" />
            <View style={{ height: 18 }} />
            <Field label="Address" value={you.address} onChange={(v) => setYou({ ...you, address: v })} placeholder="Street, city, postal code" optional />
          </ScrollView>
          <View style={styles.ctaWrap}>
            <TouchableOpacity disabled={!canContinue} onPress={() => setStep(2)} style={[styles.cta, !canContinue && styles.ctaDisabled]}>
              <Text style={styles.ctaText}>Continue</Text>
              <IconArrow color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const canCreate = them.first.trim().length > 0;
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Header stepNum={2} onBack={() => setStep(1)} onSkip={() => finishOnboarding(true)} />
        <View style={styles.headingWrap}>
          <Text style={styles.heading}>Who are you{'\n'}caring for?</Text>
          <Text style={styles.subhead}>You can add more people, medications, and doctors at your own pace.</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formWrap}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Field half label="First name" value={them.first} onChange={(v) => setThem({ ...them, first: v })} placeholder="Arjun" />
            <Field half label="Last name" value={them.last} onChange={(v) => setThem({ ...them, last: v })} placeholder="Sharma" />
          </View>
          <View style={{ height: 18 }} />
          <Field label="Date of birth" value={them.dob} onChange={(v) => setThem({ ...them, dob: v })} placeholder="YYYY-MM-DD" />
          <View style={{ height: 18 }} />
          <Text style={styles.fLabel}>YOUR RELATIONSHIP</Text>
          <View style={styles.chipsWrap}>
            {rels.map(r => {
              const active = r === them.rel;
              return (
                <TouchableOpacity key={r} onPress={() => setThem({ ...them, rel: r })} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 18 }} />
          <View style={styles.labelRow}>
            <Text style={styles.fLabel}>ADDRESS</Text>
            <Text style={styles.optional}>Optional</Text>
          </View>
          <TextInput
            value={them.sameAddress ? (you.address || 'Same as yours') : them.address}
            onChangeText={(v) => setThem({ ...them, address: v, sameAddress: false })}
            placeholder="Street, city, postal code"
            placeholderTextColor={colors.mutedSoft}
            style={styles.input}
          />
          {!!you.address && (
            <TouchableOpacity onPress={() => setThem({ ...them, sameAddress: !them.sameAddress })} style={styles.checkRow}>
              <View style={[styles.checkbox, them.sameAddress && styles.checkboxActive]}>
                {them.sameAddress && <IconCheck color="#fff" />}
              </View>
              <Text style={{ fontSize: 13, color: colors.ink }}>Same as my address</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <View style={styles.ctaWrap}>
          <TouchableOpacity disabled={!canCreate || saving} onPress={() => finishOnboarding(false)} style={[styles.cta, (!canCreate || saving) && styles.ctaDisabled]}>
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.ctaText}>Create profile</Text>
                <IconArrow color="#fff" />
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => finishOnboarding(true)} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.muted }}>I'll add this later</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ stepNum, onBack, onSkip }) {
  return (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={[styles.pillBtn, !onBack && { opacity: 0.4 }]} disabled={!onBack}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP {stepNum} OF 2</Text>
        {onSkip ? (
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </View>
      <View style={styles.progressRow}>
        <View style={[styles.progressSeg, { backgroundColor: stepNum >= 1 ? colors.forestDeep : colors.line }]} />
        <View style={[styles.progressSeg, { backgroundColor: stepNum >= 2 ? colors.forestDeep : colors.line }]} />
      </View>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, optional, half, keyboardType }) {
  return (
    <View style={{ flex: half ? 1 : undefined }}>
      <View style={styles.labelRow}>
        <Text style={styles.fLabel}>{label}</Text>
        {optional && <Text style={styles.optional}>Optional</Text>}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedSoft}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  headerRow: { paddingHorizontal: 24, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
  skipText: { fontSize: 13, color: colors.muted, fontWeight: '500', padding: 8 },
  progressRow: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', gap: 6 },
  progressSeg: { flex: 1, height: 3, borderRadius: 99 },
  headingWrap: { paddingHorizontal: 28, paddingTop: 28 },
  heading: { fontFamily: 'Georgia', fontSize: 32, lineHeight: 36, color: colors.forestDeep, fontWeight: '400', letterSpacing: -0.7 },
  subhead: { marginTop: 10, fontSize: 13.5, lineHeight: 19, color: colors.muted, maxWidth: 320 },
  formWrap: { padding: 24, paddingBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  fLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  optional: { fontSize: 10.5, color: colors.mutedSoft },
  input: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  chipsWrap: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  chipText: { fontSize: 13.5, fontWeight: '500', color: colors.ink },
  chipTextActive: { color: '#fff' },
  checkRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  ctaWrap: { padding: 24, paddingTop: 4 },
  cta: { height: 52, borderRadius: 14, backgroundColor: colors.forestDeep, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaDisabled: { backgroundColor: '#cdc5b6' },
  ctaText: { color: '#fff', fontSize: 15.5, fontWeight: '500' },
});
