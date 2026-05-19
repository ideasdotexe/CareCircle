import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft } from '../components/Icons';
import { supabase } from '../lib/supabase';

const SPECIALTIES = ['Dementia', 'Post-op', 'Diabetes care', 'Cardiac care', 'Wound care', 'Mobility', 'Live-in', 'Companion'];

export default function CaregiverEditProfileScreen({ navigation }) {
  const [form, setForm] = useState({ title: '', years_experience: '', city: '', province: '', bio: '', rate: '', specialties: [], languages: '', availability: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('caregiver_profiles').select('*').eq('user_id', user.id).maybeSingle();
        if (data) setForm({
          ...form,
          ...data,
          years_experience: data.years_experience ? String(data.years_experience) : '',
          languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''),
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
        });
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  const toggleSpec = (s) => {
    setForm(f => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('caregiver_profiles').upsert({
        user_id: user.id,
        title: form.title,
        years_experience: parseInt(form.years_experience, 10) || null,
        city: form.city,
        province: form.province,
        bio: form.bio,
        rate: form.rate,
        specialties: form.specialties,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        availability: form.availability,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message || String(e));
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Edit profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
          <Field label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Personal Support Worker" />
          <Field label="Years experience" value={form.years_experience} onChange={v => setForm({ ...form, years_experience: v })} keyboardType="numeric" />
          <Field label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} />
          <Field label="Province" value={form.province} onChange={v => setForm({ ...form, province: v })} />
          <Field label="Hourly rate" value={form.rate} onChange={v => setForm({ ...form, rate: v })} placeholder="$28/hr" />
          <Field label="Languages (comma separated)" value={form.languages} onChange={v => setForm({ ...form, languages: v })} />
          <Field label="Availability" value={form.availability} onChange={v => setForm({ ...form, availability: v })} placeholder="Weekdays · evenings" />

          <Text style={styles.fLabel}>Bio</Text>
          <TextInput value={form.bio} onChangeText={v => setForm({ ...form, bio: v })} multiline numberOfLines={5} style={[styles.input, { height: 120, textAlignVertical: 'top' }]} />

          <Text style={[styles.fLabel, { marginTop: 18 }]}>Specialties</Text>
          <View style={styles.chipsRow}>
            {SPECIALTIES.map(s => {
              const active = form.specialties.includes(s);
              return (
                <TouchableOpacity key={s} onPress={() => toggleSpec(s)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.mutedSoft} keyboardType={keyboardType} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  fLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  chipsRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '500' },
  saveBtn: { marginTop: 22, height: 52, borderRadius: 14, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
