import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft } from '../components/Icons';
import { supabase } from '../lib/supabase';

export default function CaregiverVitalsLogScreen({ navigation, route }) {
  const personId = route?.params?.personId;
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [sugar, setSugar] = useState('');
  const [hr, setHr] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const rows = [];
      if (sys && dia) rows.push({ person_id: personId, vital_type: 'blood_pressure', value: `${sys}/${dia}`, recorded_by: user.id, recorded_at: new Date().toISOString() });
      if (sugar) rows.push({ person_id: personId, vital_type: 'blood_sugar', value: sugar, recorded_by: user.id, recorded_at: new Date().toISOString() });
      if (hr) rows.push({ person_id: personId, vital_type: 'heart_rate', value: hr, recorded_by: user.id, recorded_at: new Date().toISOString() });
      if (rows.length === 0) { Alert.alert('Enter at least one reading'); setSaving(false); return; }
      await supabase.from('vitals').insert(rows);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message || String(e));
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.modeStrip} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Log vitals</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <Text style={styles.label}>BLOOD PRESSURE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <TextInput value={sys} onChangeText={setSys} placeholder="120" keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
          <Text style={{ fontSize: 18, color: colors.muted }}>/</Text>
          <TextInput value={dia} onChangeText={setDia} placeholder="80" keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
          <Text style={{ fontSize: 12, color: colors.muted }}>mmHg</Text>
        </View>

        <Text style={styles.label}>BLOOD SUGAR</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <TextInput value={sugar} onChangeText={setSugar} placeholder="6.2" keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
          <Text style={{ fontSize: 12, color: colors.muted }}>mmol/L</Text>
        </View>

        <Text style={styles.label}>HEART RATE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <TextInput value={hr} onChangeText={setHr} placeholder="72" keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
          <Text style={{ fontSize: 12, color: colors.muted }}>bpm</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save readings</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  modeStrip: { height: 4, backgroundColor: colors.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  footer: { padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: colors.line },
  saveBtn: { height: 52, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
