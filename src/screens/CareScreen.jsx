import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';
import { IconPlus } from '../components/Icons';
import TabBar from '../components/TabBar';
import { supabase } from '../lib/supabase';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', muted: '#6B6862', mutedSoft: '#9A968F',
  line: '#E8E0D2', lineSoft: '#EFE8DA', sageSoft: '#DDE4D6',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

export default function CareScreen({ navigation }) {
  const [caregivers, setCaregivers] = useState([]);
  const [persons, setPersons] = useState([]);
  const [assignModal, setAssignModal] = useState(null); // { caregiver: rel }
  const [assignPersonId, setAssignPersonId] = useState('');
  const [assignAccess, setAssignAccess] = useState({ vitals: true, medications: true, documents: true });
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Accepted caregivers on my account (no FK joins — fetch separately)
      try {
        const { data: rels } = await supabase
          .from('caregiver_relationships')
          .select('id, caregiver_id, owner_id, person_id, status, role')
          .eq('owner_id', user.id)
          .eq('status', 'accepted');
        const cgIds = (rels || []).map(r => r.caregiver_id).filter(Boolean);
        let nameMap = {};
        if (cgIds.length) {
          const { data: profs } = await supabase.from('profiles').select('id, full_name, first_name, last_name').in('id', cgIds);
          (profs || []).forEach(p => {
            nameMap[p.id] = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim();
          });
        }
        setCaregivers((rels || []).map(r => ({ ...r, _name: nameMap[r.caregiver_id] || 'Caregiver' })));
      } catch (_) { setCaregivers([]); }

      // Owner's persons for assignment
      try {
        const { data: ps } = await supabase.from('persons').select('id, first_name, last_name').eq('user_id', user.id);
        setPersons(ps || []);
      } catch (_) {}
    } catch (_) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openAssign = (rel) => {
    setAssignModal(rel);
    setAssignPersonId(persons[0]?.id || '');
    setAssignAccess({ vitals: true, medications: true, documents: true });
  };

  const handleAssign = async () => {
    if (!assignModal || !assignPersonId) return;
    setAssigning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: assignErr } = await supabase.from('caregiver_relationships').upsert({
        caregiver_id: assignModal.caregiver_id,
        owner_id: user.id,
        person_id: assignPersonId,
        status: 'accepted',
        role: 'caregiver',
      }, { onConflict: 'caregiver_id,owner_id,person_id' });
      if (assignErr) throw assignErr;
      setAssignModal(null);
      load();
      if (Platform.OS === 'web') window.alert('Caregiver assigned successfully.');
      else Alert.alert('Done', 'Caregiver assigned successfully.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not assign.');
    } finally { setAssigning(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.title}>Care</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={styles.hero}>The people{'\n'}who help.</Text>
          <Text style={styles.heroSub}>Find caregivers, invite family, manage who can do what.</Text>
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => navigation.navigate('FindCaregiver')}>
            <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <Circle cx={6} cy={6} r={4.5} stroke="#fff" strokeWidth={1.6} />
              <Path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
            </Svg>
            <Text style={styles.primaryBtnText}>Find caregiver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { flex: 1 }]}
            onPress={() => navigation.navigate('InviteCaregiver', { personId: persons[0]?.id })}
          >
            <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
              <Path d="M6.5 1v11M1 6.5h11" stroke={C.forestDeep} strokeWidth={1.7} strokeLinecap="round" />
            </Svg>
            <Text style={styles.secondaryBtnText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* ── My care team ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Your care team</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FindCaregiver')}>
              <Text style={styles.sectionAction}>Find more</Text>
            </TouchableOpacity>
          </View>
          {caregivers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No caregivers yet. Find a professional and send a request.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('FindCaregiver')}>
                <IconPlus color={colors.forest} />
                <Text style={styles.emptyBtnText}>Find caregiver</Text>
              </TouchableOpacity>
            </View>
          ) : (
            caregivers.map(rel => {
              const ini = getInitials(rel._name);
              const assigned = rel.person_id ? persons.find(p => p.id === rel.person_id) : null;
              return (
                <View key={rel.id} style={styles.teamCard}>
                  <View style={[styles.teamAvatar, { backgroundColor: '#3F5D54' }]}>
                    <Text style={styles.teamAvatarText}>{ini}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{rel._name}</Text>
                    <Text style={styles.teamMeta}>
                      {assigned ? `Assigned to ${assigned.first_name}` : 'Not yet assigned'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.assignBtn} onPress={() => openAssign(rel)}>
                    <Text style={styles.assignBtnText}>{rel.person_id ? 'Reassign' : 'Assign'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* ── Assign caregiver modal ── */}
        <Modal visible={!!assignModal} transparent animationType="slide" onRequestClose={() => setAssignModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Assign caregiver</Text>
              <Text style={styles.modalSub}>Choose a person and what {assignModal?._name} can access.</Text>

              <Text style={styles.modalLabel}>ASSIGN TO</Text>
              {persons.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personRow, assignPersonId === p.id && styles.personRowActive]}
                  onPress={() => setAssignPersonId(p.id)}
                >
                  <Text style={[styles.personRowText, assignPersonId === p.id && { color: '#fff' }]}>
                    {p.first_name} {p.last_name || ''}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalLabel, { marginTop: 16 }]}>ACCESS</Text>
              {[['vitals', 'Vitals'], ['medications', 'Medications'], ['documents', 'Documents']].map(([key, label]) => (
                <TouchableOpacity key={key} style={styles.accessRow} onPress={() => setAssignAccess(a => ({ ...a, [key]: !a[key] }))}>
                  <View style={[styles.checkbox, assignAccess[key] && styles.checkboxOn]}>
                    {assignAccess[key] && (
                      <Svg width={12} height={10} viewBox="0 0 12 10">
                        <Path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </Svg>
                    )}
                  </View>
                  <Text style={styles.accessLabel}>{label}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAssignModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, assigning && { opacity: 0.6 }]} onPress={handleAssign} disabled={assigning || !assignPersonId}>
                  <Text style={styles.confirmBtnText}>{assigning ? 'Saving…' : 'Confirm'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>

      <TabBar active={2} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  hero: { fontFamily: 'Georgia', fontSize: 28, lineHeight: 32, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.6 },
  heroSub: { marginTop: 8, fontSize: 13, color: C.muted, lineHeight: 18 },
  btnRow: { padding: 20, paddingTop: 18, flexDirection: 'row', gap: 8 },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '500' },
  secondaryBtn: { height: 52, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  secondaryBtnText: { color: C.forestDeep, fontSize: 14.5, fontWeight: '500' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500' },
  sectionAction: { fontSize: 12, color: C.forest, fontWeight: '500' },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 22, alignItems: 'center' },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center' },
  emptyBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyBtnText: { fontSize: 13, color: C.forest, fontWeight: '600' },
  teamCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamAvatar: { width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 14, fontWeight: '500' },
  teamName: { fontSize: 14, fontWeight: '600', color: C.ink },
  teamMeta: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  assignBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: C.sageSoft, borderWidth: 1, borderColor: '#A8B5A0' },
  assignBtnText: { fontSize: 12, color: C.forest, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: 'Georgia', fontSize: 20, color: C.forestDeep, fontWeight: '500', marginBottom: 4 },
  modalSub: { fontSize: 13, color: C.muted, marginBottom: 20 },
  modalLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  personRow: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: C.line, marginBottom: 6, backgroundColor: '#fff' },
  personRowActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  personRowText: { fontSize: 14, fontWeight: '500', color: C.ink },
  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  accessLabel: { fontSize: 14, color: C.ink, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14, color: C.muted, fontWeight: '500' },
  confirmBtn: { flex: 1, height: 48, borderRadius: 14, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});
