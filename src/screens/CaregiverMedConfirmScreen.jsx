import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft, IconCheck } from '../components/Icons';
import { supabase } from '../lib/supabase';

export default function CaregiverMedConfirmScreen({ navigation, route }) {
  const { personId, medId, name, dose } = route?.params || {};
  const [saving, setSaving] = useState(false);

  const log = async (skipped) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('med_administrations').insert({
        person_id: personId,
        medication_id: medId,
        administered_by: user.id,
        administered_at: new Date().toISOString(),
        status: skipped ? 'skipped' : 'given',
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
        <Text style={styles.title}>Confirm</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <IconCheck color={colors.forest} />
        </View>
        <Text style={styles.bigName}>{name || 'Medication'}</Text>
        {!!dose && <Text style={styles.dose}>{dose}</Text>}
        <Text style={styles.subtitle}>Did the patient take this dose?</Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={() => log(true)} disabled={saving}>
            <Text style={styles.skipBtnText}>Skipped</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.givenBtn} onPress={() => log(false)} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.givenBtnText}>Given</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Georgia', fontSize: 16, color: colors.forestDeep, fontWeight: '500' },
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.sageSoft, alignItems: 'center', justifyContent: 'center' },
  bigName: { marginTop: 18, fontFamily: 'Georgia', fontSize: 28, color: colors.forestDeep, fontWeight: '400', textAlign: 'center' },
  dose: { marginTop: 4, fontSize: 16, color: colors.muted },
  subtitle: { marginTop: 24, fontSize: 14, color: colors.muted, textAlign: 'center' },
  btnRow: { marginTop: 30, flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  skipBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.terracotta, alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { color: colors.terracotta, fontSize: 15, fontWeight: '500' },
  givenBtn: { flex: 1, height: 52, borderRadius: 14, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  givenBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
