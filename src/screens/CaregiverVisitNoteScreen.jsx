import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { IconChevronLeft } from '../components/Icons';
import { supabase } from '../lib/supabase';

const WHEN_OPTIONS = ['Now', 'Earlier today', 'Yesterday'];

export default function CaregiverVisitNoteScreen({ navigation, route }) {
  const personId = route?.params?.personId;
  const [note, setNote] = useState('');
  const [when, setWhen] = useState('Now');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!note.trim()) { Alert.alert('Note is empty'); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      await supabase.from('visit_notes').insert({
        person_id: personId,
        author_id: user.id,
        author_name: prof?.full_name || 'Caregiver',
        note,
        when_label: when,
      });
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
        <Text style={styles.title}>Log a visit note</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <Text style={styles.label}>WHEN</Text>
        <View style={styles.whenRow}>
          {WHEN_OPTIONS.map(w => {
            const active = w === when;
            return (
              <TouchableOpacity key={w} onPress={() => setWhen(w)} style={[styles.whenBtn, active && styles.whenBtnActive]}>
                <Text style={[styles.whenBtnText, active && { color: '#fff' }]}>{w}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 18 }]}>NOTE</Text>
        <TextInput
          value={note}
          onChangeText={t => setNote(t.slice(0, 500))}
          multiline
          numberOfLines={8}
          placeholder="What happened during the visit?"
          placeholderTextColor={colors.mutedSoft}
          style={styles.textarea}
        />
        <Text style={styles.charCount}>{note.length}/500</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save & notify</Text>}
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
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  whenRow: { marginTop: 8, flexDirection: 'row', gap: 8 },
  whenBtn: { flex: 1, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  whenBtnActive: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  whenBtnText: { fontSize: 12.5, fontWeight: '500', color: colors.ink },
  textarea: { marginTop: 8, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', fontSize: 14, color: colors.ink, height: 180, textAlignVertical: 'top' },
  charCount: { marginTop: 6, fontSize: 11, color: colors.mutedSoft, textAlign: 'right' },
  footer: { padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: colors.line },
  saveBtn: { height: 52, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
