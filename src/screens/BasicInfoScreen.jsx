import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

// ─── Design tokens ────────────────────────────────────────
const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

const SEX_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// ─── Icons ────────────────────────────────────────────────
function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Reusable field components ────────────────────────────
function FieldLabel({ label, optional }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
      <Text style={st.fieldLabel}>{label}</Text>
      {optional && <Text style={st.fieldOpt}>Optional</Text>}
    </View>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, optional, hint, multiline }) {
  return (
    <View style={st.fieldWrap}>
      <FieldLabel label={label} optional={optional} />
      <View style={[st.inputBox, multiline && { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.mutedSoft}
          keyboardType={keyboardType}
          style={[st.inputText, multiline && { height: 56 }]}
          autoCapitalize="sentences"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {!!hint && <Text style={st.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function BasicInfoScreen({ navigation, route }) {
  const person = route?.params?.person;
  const personId = person?.id;

  const [name, setName]           = useState(person?.name ?? '');
  const [dob, setDob]             = useState(person?.date_of_birth ?? '');
  const [sex, setSex]             = useState('');
  const [weight, setWeight]       = useState('');
  const [height, setHeight]       = useState('');
  const [healthCard, setHealthCard] = useState('');
  // Address broken into parts
  const [unit, setUnit]           = useState('');
  const [street, setStreet]       = useState('');
  const [city, setCity]           = useState('');
  const [province, setProvince]   = useState('');
  const [postal, setPostal]       = useState('');
  const [country, setCountry]     = useState('Canada');

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  // Parse a saved address JSON or plain string back into fields
  const parseAddress = (raw) => {
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      setUnit(obj.unit || '');
      setStreet(obj.street || '');
      setCity(obj.city || '');
      setProvince(obj.province || '');
      setPostal(obj.postal || '');
      setCountry(obj.country || 'Canada');
    } catch {
      // legacy plain-text address — put it in street field
      setStreet(raw);
    }
  };

  useEffect(() => {
    if (!personId) { setLoading(false); return; }
    supabase
      .from('persons')
      .select('name, date_of_birth, sex, weight_kg, height_cm, health_card_number, address')
      .eq('id', personId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name ?? '');
          setDob(data.date_of_birth ?? '');
          setSex(data.sex ?? '');
          setWeight(data.weight_kg != null ? String(data.weight_kg) : '');
          setHeight(data.height_cm != null ? String(data.height_cm) : '');
          setHealthCard(data.health_card_number ?? '');
          parseAddress(data.address);
        }
        setLoading(false);
      });
  }, [personId]);

  // Combine fields into a JSON string for storage
  const buildAddressJson = () => {
    const obj = {
      unit: unit.trim() || undefined,
      street: street.trim() || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      postal: postal.trim() || undefined,
      country: country.trim() || undefined,
    };
    // Remove undefined keys
    Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);
    return Object.keys(obj).length ? JSON.stringify(obj) : null;
  };

  const handleSave = async () => {
    if (!personId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('persons').update({
        name: name.trim(),
        date_of_birth: dob.trim() || null,
        sex: sex || null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseFloat(height) : null,
        health_card_number: healthCard.trim() || null,
        address: buildAddressJson(),
      }).eq('id', personId);
      if (error) throw error;
      if (Platform.OS === 'web') {
        window.alert('Basic info saved.');
      } else {
        Alert.alert('Saved', 'Basic info updated successfully.');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={st.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={C.forest} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.safe}>
      {/* ── Top bar ── */}
      <View style={st.topBar}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={st.topTitle}>Basic Info</Text>
          {!!person?.name && <Text style={st.topSub}>{person.name}</Text>}
        </View>
        <TouchableOpacity
          style={[st.saveTopBtn, (saving || !name.trim()) && { opacity: 0.45 }]}
          onPress={handleSave}
          disabled={saving || !name.trim()}
        >
          <Text style={st.saveTopBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={st.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Full name */}
          <Field
            label="FULL NAME"
            value={name}
            onChange={setName}
            placeholder="Full name"
          />

          {/* Date of birth */}
          <Field
            label="DATE OF BIRTH"
            value={dob}
            onChange={setDob}
            placeholder="DD / MM / YYYY"
            keyboardType="numbers-and-punctuation"
          />

          {/* Sex */}
          <View style={st.fieldWrap}>
            <FieldLabel label="SEX" />
            <View style={st.pillRow}>
              {SEX_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[st.pill, sex === s && st.pillActive]}
                  onPress={() => setSex(s)}
                >
                  <Text style={[st.pillText, sex === s && st.pillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight / Height row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field
                label="WEIGHT"
                value={weight}
                onChange={setWeight}
                placeholder="e.g. 74"
                keyboardType="decimal-pad"
                hint="Kilograms (kg)"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="HEIGHT"
                value={height}
                onChange={setHeight}
                placeholder="e.g. 172"
                keyboardType="decimal-pad"
                hint="Centimetres (cm)"
                optional
              />
            </View>
          </View>

          {/* Health card */}
          <Field
            label="HEALTH CARD NUMBER"
            value={healthCard}
            onChange={setHealthCard}
            placeholder="Ontario OHIP number"
            hint="Used for emergency reference only"
            optional
          />

          {/* ── Address section ── */}
          <View style={st.sectionDivider}>
            <View style={st.sectionLine} />
            <Text style={st.sectionDividerLabel}>ADDRESS</Text>
            <View style={st.sectionLine} />
          </View>

          {/* Unit (optional) */}
          <View style={[st.fieldWrap, { marginBottom: 10 }]}>
            <FieldLabel label="UNIT / APT" optional />
            <View style={st.inputBox}>
              <TextInput
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g. 5, 12B"
                placeholderTextColor={C.mutedSoft}
                style={st.inputText}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Street — triggers autocomplete, auto-fills rest */}
          <View style={[st.fieldWrap, { zIndex: 20, marginBottom: 10 }]}>
            <FieldLabel label="STREET ADDRESS" />
            <PlaceAutocomplete
              type="address"
              value={street}
              onChangeText={setStreet}
              onSelect={item => {
                setStreet(item.street || item.label);
                if (item.city)     setCity(item.city);
                if (item.province) setProvince(item.province);
                if (item.postal)   setPostal(item.postal);
                if (item.country)  setCountry(item.country);
              }}
              placeholder="e.g. 200 Jameson Ave"
            />
          </View>

          {/* City + Province row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <View style={{ flex: 3 }}>
              <View style={st.fieldWrap}>
                <FieldLabel label="CITY" />
                <PlaceAutocomplete
                  type="city"
                  value={city}
                  onChangeText={setCity}
                  onSelect={item => {
                    setCity(item.city || item.label);
                    if (item.province) setProvince(item.province);
                  }}
                  placeholder="Toronto"
                />
              </View>
            </View>
            <View style={{ flex: 2 }}>
              <View style={st.fieldWrap}>
                <FieldLabel label="PROVINCE" />
                <View style={st.inputBox}>
                  <TextInput
                    value={province}
                    onChangeText={setProvince}
                    placeholder="ON"
                    placeholderTextColor={C.mutedSoft}
                    style={st.inputText}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Postal code + Country row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            <View style={{ flex: 2 }}>
              <View style={st.fieldWrap}>
                <FieldLabel label="POSTAL CODE" />
                <View style={st.inputBox}>
                  <TextInput
                    value={postal}
                    onChangeText={t => setPostal(t.toUpperCase())}
                    placeholder="M6J 2G4"
                    placeholderTextColor={C.mutedSoft}
                    style={st.inputText}
                    autoCapitalize="characters"
                    maxLength={7}
                  />
                </View>
              </View>
            </View>
            <View style={{ flex: 3 }}>
              <View style={st.fieldWrap}>
                <FieldLabel label="COUNTRY" />
                <View style={st.inputBox}>
                  <TextInput
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Canada"
                    placeholderTextColor={C.mutedSoft}
                    style={st.inputText}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>
          </View>

          <Text style={[st.hint, { marginTop: -14, marginBottom: 16 }]}>
            Used for care coordination and emergency reference
          </Text>

          {/* Save button */}
          <TouchableOpacity
            style={[st.saveBtn, (saving || !name.trim()) && { opacity: 0.45 }]}
            onPress={handleSave}
            disabled={saving || !name.trim()}
            activeOpacity={0.85}
          >
            <Text style={st.saveBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.lineSoft,
    backgroundColor: C.cream,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  topSub: { fontSize: 11, color: C.muted, marginTop: 1 },
  saveTopBtn: {
    height: 34, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center',
  },
  saveTopBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  body: { padding: 20, paddingBottom: 60 },

  fieldWrap: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  fieldOpt: { fontSize: 10.5, color: C.mutedSoft },
  hint: { fontSize: 11, color: C.mutedSoft, marginTop: 5 },

  inputBox: {
    height: 50, borderRadius: 13, borderWidth: 1, borderColor: C.line,
    backgroundColor: '#fff', paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  inputText: { flex: 1, fontSize: 15, color: C.ink, letterSpacing: -0.15 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  pillActive: { borderColor: C.forestDeep, backgroundColor: C.sageSoft },
  pillText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  pillTextActive: { color: C.forestDeep, fontWeight: '700' },

  sectionDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 16, marginTop: 4,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.line },
  sectionDividerLabel: {
    fontSize: 10, fontWeight: '700', color: C.mutedSoft,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  saveBtn: {
    height: 52, borderRadius: 16, backgroundColor: C.forestDeep,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
});
