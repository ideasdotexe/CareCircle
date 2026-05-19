import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft, IconCheck, IconPlus } from '../components/Icons';
import { supabase } from '../lib/supabase';

export default function CaregiverVisitScreen({ navigation, route }) {
  const personId = route?.params?.personId;
  const [person, setPerson] = useState(null);
  const [meds, setMeds] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personId) { setLoading(false); return; }
    (async () => {
      try {
        const { data: p } = await supabase.from('persons').select('*').eq('id', personId).maybeSingle();
        setPerson(p);
        try { const { data } = await supabase.from('medications').select('*').eq('person_id', personId); setMeds(data || []); } catch (_) {}
        try { const { data } = await supabase.from('allergies').select('*').eq('person_id', personId); setAllergies(data || []); } catch (_) {}
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [personId]);

  const confirmMed = async (med) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('med_administrations').insert({
        person_id: personId,
        medication_id: med.id,
        administered_by: user.id,
        administered_at: new Date().toISOString(),
      });
      navigation.navigate('CaregiverMedConfirm', { medId: med.id, personId, name: med.name, dose: med.dosage });
    } catch (e) {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={colors.forest} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.modeStrip} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>{person?.first_name || 'Visit'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {allergies.length > 0 && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: '700' }}>Allergies: </Text>{allergies.map(a => a.name || a.allergen).join(' · ')}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Medications</Text>
        {meds.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No medications.</Text></View>
        ) : (
          <View style={styles.card}>
            {meds.map((m, i) => (
              <TouchableOpacity key={m.id} onPress={() => confirmMed(m)} style={[styles.medRow, i < meds.length - 1 && styles.medRowBorder]}>
                <View style={styles.medCheck}><IconCheck color={colors.muted} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{m.name} <Text style={styles.medDose}>{m.dosage || ''}</Text></Text>
                  <Text style={styles.medMeta}>{m.frequency || ''}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Vitals to log</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.vitalBtn} onPress={() => navigation.navigate('CaregiverVitalsLog', { personId })}>
            <Text style={styles.vitalLabel}>Blood pressure</Text>
            <Text style={styles.vitalSub}>Tap to log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalBtn} onPress={() => navigation.navigate('CaregiverVitalsLog', { personId })}>
            <Text style={styles.vitalLabel}>Blood sugar</Text>
            <Text style={styles.vitalSub}>Tap to log</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.noteBtn} onPress={() => navigation.navigate('CaregiverVisitNote', { personId })}>
          <IconPlus color="#fff" />
          <Text style={styles.noteBtnText}>Log visit note</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  modeStrip: { height: 4, backgroundColor: colors.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 17, color: colors.forestDeep, fontWeight: '500' },
  alertBanner: { backgroundColor: '#FBE3D9', borderRadius: 14, padding: 12, marginBottom: 16 },
  alertText: { fontSize: 12.5, color: '#5C2A1F', lineHeight: 17 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 17, color: colors.forestDeep, fontWeight: '500', marginBottom: 10 },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18 },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  medRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  medCheck: { width: 28, height: 28, borderRadius: 99, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  medDose: { fontSize: 11.5, color: colors.muted, fontWeight: '400' },
  medMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8 },
  vitalBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14 },
  vitalLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  vitalSub: { fontSize: 11, color: colors.muted, marginTop: 4 },
  noteBtn: { marginTop: 22, height: 52, borderRadius: 14, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  noteBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '500' },
});
