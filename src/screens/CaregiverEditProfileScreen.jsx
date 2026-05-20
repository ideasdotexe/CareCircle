import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { PhotoTile } from './FindCaregiverScreen';
import { fetchDisplayName } from '../lib/userProfile';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

const PRESET_SPECIALTIES = [
  'Dementia', 'Post-op', 'Diabetes care', 'Cardiac care',
  'Wound care', 'Medication admin', 'Mobility', 'Live-in',
  'Companion care', 'Hospice support', 'Mental health', 'Pediatric',
];
const PRESET_LANGUAGES = [
  'English', 'French', 'Hindi', 'Punjabi', 'Urdu', 'Arabic',
  'Mandarin', 'Cantonese', 'Spanish', 'Portuguese', 'Tagalog', 'Gujarati',
];

// ─── Icons ───────────────────────────────────────────────
function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ICheck() {
  return (
    <Svg width={9} height={8} viewBox="0 0 10 9">
      <Path d="M1 4.5l2.5 2.5 5.5-6" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
function IClose() {
  return (
    <Svg width={8} height={8} viewBox="0 0 10 10">
      <Path d="M2 2l6 6M8 2l-6 6" stroke={C.forest} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function IPlus() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Path d="M5 1v8M1 5h8" stroke={C.mutedSoft} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Field ────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, keyboardType, multiline, hint }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={st.fieldLabel}>{label}</Text>
        {!!hint && <Text style={st.fieldHint}>{hint}</Text>}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.mutedSoft}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        style={[st.input, multiline && st.inputMulti]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

// ─── Chips editor with presets ────────────────────────────
function ChipsEditor({ label, items, onChange, presets, placeholder, max }) {
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? presets : presets.slice(0, 8);

  const toggle = (item) => {
    if (items.includes(item)) {
      onChange(items.filter(x => x !== item));
    } else {
      if (max && items.length >= max) {
        Alert.alert('Limit reached', `You can add up to ${max} items.`);
        return;
      }
      onChange([...items, item]);
    }
  };

  const addCustom = () => {
    const t = draft.trim();
    if (!t) return;
    if (items.includes(t)) { setDraft(''); return; }
    if (max && items.length >= max) {
      Alert.alert('Limit reached', `You can add up to ${max} items.`);
      setDraft('');
      return;
    }
    onChange([...items, t]);
    setDraft('');
  };

  const customItems = items.filter(it => !presets.includes(it));

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={st.sectionTitle}>{label}</Text>
        {max && <Text style={st.sectionHint}>{items.length}/{max} selected</Text>}
      </View>

      {/* Preset chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {visible.map(p => {
          const active = items.includes(p);
          return (
            <TouchableOpacity
              key={p}
              onPress={() => toggle(p)}
              style={[st.presetChip, active && st.presetChipActive]}
              activeOpacity={0.75}
            >
              {active && <ICheck />}
              <Text style={[st.presetChipText, active && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          );
        })}
        {presets.length > 8 && (
          <TouchableOpacity onPress={() => setExpanded(e => !e)} style={st.moreChip}>
            <Text style={st.moreChipText}>{expanded ? 'Less' : `+${presets.length - 8} more`}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom-added items */}
      {customItems.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
          {customItems.map((it, i) => (
            <View key={i} style={st.customChip}>
              <Text style={st.customChipText}>{it}</Text>
              <TouchableOpacity
                onPress={() => onChange(items.filter(x => x !== it))}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={st.chipX}
              >
                <IClose />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Custom add */}
      <View style={st.addRow}>
        <IPlus />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addCustom}
          onBlur={addCustom}
          placeholder={placeholder}
          placeholderTextColor={C.mutedSoft}
          style={st.addInput}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

// ─── Section title ────────────────────────────────────────
function SectionHead({ title }) {
  return <Text style={[st.sectionTitle, { marginBottom: 12, marginTop: 4 }]}>{title}</Text>;
}

// ─── Main screen ──────────────────────────────────────────
export default function CaregiverEditProfileScreen({ navigation }) {
  const [form, setForm] = useState({
    years_experience: '',
    city: '',
    province: '',
    bio: '',
    rate: '',
    specialties: [],
    languages: [],
    availability: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initials, setInitials] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoTone] = useState(['#C66E4E', '#B05E40']);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [{ name, initials: ini }, { data: cp }] = await Promise.all([
          fetchDisplayName(''),
          supabase.from('caregiver_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        ]);

        setDisplayName(name);
        setInitials(ini);

        if (cp) {
          setForm({
            years_experience: cp.years_experience ? String(cp.years_experience) : '',
            city: cp.city || '',
            province: cp.province || '',
            bio: cp.bio || '',
            rate: cp.rate ? cp.rate.replace(/[^0-9.]/g, '') : '',
            specialties: Array.isArray(cp.specialties) ? cp.specialties : [],
            languages: Array.isArray(cp.languages) ? cp.languages : [],
            availability: cp.availability || '',
          });
        }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in.');

      // 1. Mark as caregiver and save name so Find Caregiver can show it
      await supabase.from('profiles').upsert(
        { id: user.id, role: 'caregiver', full_name: displayName || null, email: user.email },
        { onConflict: 'id' }
      );

      // 2. Save caregiver-specific details
      const payload = {
        user_id: user.id,
        years_experience: parseInt(form.years_experience, 10) || null,
        city: form.city.trim() || null,
        province: form.province.trim() || null,
        bio: form.bio.trim() || null,
        rate: form.rate.trim() ? `$${form.rate.replace(/[^0-9.]/g, '')}/hr` : null,
        specialties: form.specialties,
        languages: form.languages,
        availability: form.availability.trim() || null,
      };

      const { error } = await supabase
        .from('caregiver_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.navigate('CaregiverToday') },
      ]);
    } catch (e) {
      Alert.alert('Could not save', e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={st.container} edges={['top']}>
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Top bar */}
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <IBack />
        </TouchableOpacity>
        <Text style={st.topTitle}>Edit profile</Text>
        <TouchableOpacity
          style={[st.saveTopBtn, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={st.saveTopBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile photo preview */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <PhotoTile tones={photoTone} initials={initials} size={80} radius={20} />
          {!!displayName && (
            <Text style={{ marginTop: 10, fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 }}>
              {displayName}
            </Text>
          )}
          <Text style={{ marginTop: 4, fontSize: 11, color: C.muted }}>
            Profile photo is generated from your initials
          </Text>
        </View>

        {/* ── Professional info ── */}
        <SectionHead title="Professional info" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field
              label="Years of experience"
              value={form.years_experience}
              onChange={v => set('years_experience', v.replace(/[^\d]/g, ''))}
              placeholder="e.g. 5"
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Hourly rate"
              value={form.rate}
              onChange={v => set('rate', v.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 28"
              keyboardType="decimal-pad"
              hint="$/hr"
            />
          </View>
        </View>

        <Field
          label="Availability"
          value={form.availability}
          onChange={v => set('availability', v)}
          placeholder="e.g. Weekdays · evenings"
        />

        {/* ── Bio ── */}
        <SectionHead title="About you" />
        <Field
          label="Bio"
          value={form.bio}
          onChange={v => set('bio', v.slice(0, 500))}
          placeholder="Describe your experience, approach, and what makes you a great caregiver…"
          multiline
          hint={`${form.bio.length}/500`}
        />

        {/* ── Specialties ── */}
        <ChipsEditor
          label="Specialties"
          items={form.specialties}
          onChange={v => set('specialties', v)}
          presets={PRESET_SPECIALTIES}
          placeholder="Add custom specialty…"
          max={6}
        />

        {/* ── Languages ── */}
        <ChipsEditor
          label="Languages"
          items={form.languages}
          onChange={v => set('languages', v)}
          presets={PRESET_LANGUAGES}
          placeholder="Add language…"
        />

        {/* ── Location ── */}
        <SectionHead title="Location" />
        <View style={{ marginBottom: 16, zIndex: 10 }}>
          <Text style={st.fieldLabel}>CITY</Text>
          <View style={{ marginTop: 6 }}>
            <PlaceAutocomplete
              type="city"
              value={form.city}
              onChangeText={v => set('city', v)}
              onSelect={item => {
                set('city', item.city || item.label);
                if (item.province) set('province', item.province);
              }}
              placeholder="e.g. Toronto"
            />
          </View>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={st.fieldLabel}>PROVINCE</Text>
          <View style={[st.input, { marginTop: 6 }]}>
            <TextInput
              value={form.province}
              onChangeText={v => set('province', v)}
              placeholder="e.g. ON"
              placeholderTextColor="#9A968F"
              style={{ flex: 1, fontSize: 15, color: '#1A1F1D' }}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* ── Bottom save button ── */}
        <TouchableOpacity
          style={[st.saveBtn, saving && { opacity: 0.7 }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={st.saveBtnText}>Save changes</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topBar: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.lineSoft, backgroundColor: C.cream },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  saveTopBtn: { height: 34, paddingHorizontal: 16, borderRadius: 10, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  saveTopBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  sectionHint: { fontSize: 11, color: C.muted },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase' },
  fieldHint: { fontSize: 11, color: C.muted },
  input: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 15, color: C.ink },
  inputMulti: { height: 120, paddingTop: 12, paddingBottom: 12 },
  // Preset chips
  presetChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  presetChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  presetChipText: { fontSize: 12.5, color: C.ink, fontWeight: '500', letterSpacing: -0.1 },
  moreChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: C.cream },
  moreChipText: { fontSize: 12, color: C.muted, fontWeight: '500' },
  // Custom chips
  customChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 11, paddingRight: 6, paddingVertical: 6, borderRadius: 99, backgroundColor: C.sageSoft, borderWidth: 1, borderColor: '#A8B5A0' },
  customChipText: { fontSize: 12.5, color: C.forest, fontWeight: '600' },
  chipX: { width: 18, height: 18, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', alignSelf: 'flex-start' },
  addInput: { fontSize: 13, color: C.ink, padding: 0, minWidth: 100 },
  // Save button
  saveBtn: { height: 52, borderRadius: 16, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
});
