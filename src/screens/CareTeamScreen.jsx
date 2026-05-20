import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Modal, Alert, ActivityIndicator, Platform, TextInput,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import { supabase } from '../lib/supabase';

// ─── Design tokens ────────────────────────────────────────
const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', sageSoft: '#DDE4D6', sage: '#A8B5A0',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

const ROLES = [
  'Family Doctor (GP)', 'Cardiologist', 'Endocrinologist', 'Neurologist',
  'Oncologist', 'Pharmacist', 'Physiotherapist', 'Nurse', 'Specialist', 'Other',
];
const DOCTOR_ROLES = new Set([
  'Family Doctor (GP)', 'Cardiologist', 'Endocrinologist',
  'Neurologist', 'Oncologist', 'Specialist',
]);

const ROLE_TINTS = {
  'Family Doctor (GP)': '#3F5D54',
  Cardiologist: '#C66E4E',
  Endocrinologist: '#7A5A3F',
  Neurologist: '#3F5D54',
  Oncologist: '#1F3D38',
  Pharmacist: '#C7973A',
  Physiotherapist: '#A8B5A0',
  Nurse: '#C66E4E',
  Specialist: '#3F5D54',
  Other: '#9A968F',
};

function formatName(name, role) {
  const t = name.trim();
  if (!DOCTOR_ROLES.has(role)) return t;
  if (/^dr\.?\s/i.test(t)) return t;
  return `Dr. ${t}`;
}
function initials(name) {
  return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}
function emptyForm() {
  return { name: '', role: '', phone: '', location: '', notes: '' };
}

// ─── Icons ────────────────────────────────────────────────
function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IAdd() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IPhone() {
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <Path d="M2 1h3l1.5 3.5-1.5 1a7 7 0 003.5 3.5l1-1.5L13 9v3a1 1 0 01-1 1C5.4 13 0 7.6 0 1a1 1 0 011-1h1z" fill={C.forest} />
    </Svg>
  );
}
function IPin() {
  return (
    <Svg width={11} height={13} viewBox="0 0 11 13" fill="none">
      <Path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={C.muted} strokeWidth={1.3} />
      <Circle cx={5.5} cy={5} r={1.5} stroke={C.muted} strokeWidth={1.3} />
    </Svg>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function CareTeamScreen({ navigation, route }) {
  const person = route?.params?.person;
  const personId = person?.id ?? route?.params?.personId;
  const personName = person?.name ?? person?.first_name ?? '';

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const load = useCallback(async () => {
    if (!personId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('care_team')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: true });
      if (!error && data) setTeam(data);
    } catch (_) {}
    setLoading(false);
  }, [personId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditingMember(null);
    setForm(emptyForm());
    setShowModal(true);
  };
  const openEdit = member => {
    setEditingMember(member);
    setForm({
      name: member.name || '',
      role: member.role || '',
      phone: member.phone ?? '',
      location: member.location ?? '',
      notes: member.notes ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role) return;
    setSaving(true);
    try {
      const payload = {
        name: formatName(form.name, form.role),
        role: form.role,
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editingMember) {
        const { error } = await supabase.from('care_team').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        setTeam(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...payload } : m));
      } else {
        const { data, error } = await supabase
          .from('care_team').insert({ ...payload, person_id: personId }).select().single();
        if (error) throw error;
        if (data) setTeam(prev => [...prev, data]);
      }
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = member => {
    const doDelete = async () => {
      const { error } = await supabase.from('care_team').delete().eq('id', member.id);
      if (error) Alert.alert('Error', error.message);
      else setTeam(prev => prev.filter(m => m.id !== member.id));
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove "${member.name}" from the care team?`)) doDelete();
    } else {
      Alert.alert('Remove member', `Remove "${member.name}" from the care team?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const canSave = !!form.name.trim() && !!form.role;

  return (
    <SafeAreaView style={st.safe}>
      {/* ── Top bar ── */}
      <View style={st.topBar}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={st.topTitle}>Care Team</Text>
          {!!personName && <Text style={st.topSub}>{personName}</Text>}
        </View>
        <TouchableOpacity style={st.addBtn} onPress={openAdd}>
          <IAdd />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {team.length === 0 ? (
            <View style={st.empty}>
              <Text style={st.emptyTitle}>No care team yet</Text>
              <Text style={st.emptyText}>
                Add doctors, specialists, and other healthcare providers.
              </Text>
              <TouchableOpacity style={st.emptyBtn} onPress={openAdd}>
                <Text style={st.emptyBtnText}>+ Add member</Text>
              </TouchableOpacity>
            </View>
          ) : (
            team.map(member => {
              const tint = ROLE_TINTS[member.role] || '#3F5D54';
              const ini = initials(member.name || '?');
              return (
                <View key={member.id} style={st.card}>
                  <View style={st.cardTop}>
                    <View style={[st.avatar, { backgroundColor: tint }]}>
                      <Text style={st.avatarText}>{ini}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={st.memberName}>{member.name}</Text>
                      <View style={st.roleTagWrap}>
                        <Text style={st.roleTag}>{member.role}</Text>
                      </View>
                      {!!member.location && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}>
                          <IPin />
                          <Text style={st.memberLoc} numberOfLines={1}>{member.location}</Text>
                        </View>
                      )}
                      {!!member.notes && (
                        <Text style={st.memberNotes} numberOfLines={2}>{member.notes}</Text>
                      )}
                    </View>
                  </View>

                  <View style={st.cardFoot}>
                    {!!member.phone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <IPhone />
                        <Text style={st.phoneText}>{member.phone}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => openEdit(member)} style={st.editBtn}>
                      <Text style={st.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(member)} style={st.deleteBtn}>
                      <Text style={st.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── Add / Edit modal ── */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={st.modalSafe}>
          <View style={st.modalHead}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={st.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={st.modalTitle}>{editingMember ? 'Edit member' : 'Add member'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={!canSave || saving}>
              <Text style={[st.modalDone, (!canSave || saving) && { opacity: 0.3 }]}>
                {saving ? 'Saving…' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Role chips */}
            <Text style={st.fieldLabel}>ROLE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20, flexShrink: 0 }}
              contentContainerStyle={{ gap: 7, paddingRight: 20 }}
            >
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[st.roleChip, form.role === r && st.roleChipActive]}
                  onPress={() => setForm(f => ({ ...f, role: r }))}
                >
                  <Text style={[st.roleChipText, form.role === r && { color: '#fff' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Name */}
            <Text style={st.fieldLabel}>FULL NAME</Text>
            <View style={[st.inputRow, { marginBottom: 16 }]}>
              <TextInput
                value={form.name}
                onChangeText={t => setForm(f => ({ ...f, name: t }))}
                placeholder="e.g. Dr. Jane Smith"
                placeholderTextColor={C.mutedSoft}
                style={st.inputText}
                autoCapitalize="words"
              />
            </View>

            {/* Phone */}
            <Text style={st.fieldLabel}>PHONE</Text>
            <View style={[st.inputRow, { marginBottom: 16 }]}>
              <TextInput
                value={form.phone}
                onChangeText={t => setForm(f => ({ ...f, phone: t }))}
                placeholder="e.g. 416-555-0101"
                placeholderTextColor={C.mutedSoft}
                style={st.inputText}
                keyboardType="phone-pad"
              />
            </View>

            {/* Clinic / Hospital — uses place autocomplete */}
            <Text style={st.fieldLabel}>CLINIC OR HOSPITAL</Text>
            <View style={{ marginBottom: 16 }}>
              <PlaceAutocomplete
                type="clinic"
                value={form.location}
                onChangeText={t => setForm(f => ({ ...f, location: t }))}
                onSelect={item => setForm(f => ({ ...f, location: item.label }))}
                placeholder="e.g. Sunnybrook Medical Centre"
              />
            </View>

            {/* Notes */}
            <Text style={st.fieldLabel}>NOTES</Text>
            <View style={[st.inputRow, { height: 88, alignItems: 'flex-start', paddingTop: 12, marginBottom: 24 }]}>
              <TextInput
                value={form.notes}
                onChangeText={t => setForm(f => ({ ...f, notes: t }))}
                placeholder="e.g. Sees patient every 6 months"
                placeholderTextColor={C.mutedSoft}
                style={[st.inputText, { height: 64 }]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[st.saveBtn, (!canSave || saving) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!canSave || saving}
            >
              <Text style={st.saveBtnText}>
                {saving ? 'Saving…' : editingMember ? 'Save changes' : 'Add to care team'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14,
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
  addBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.forestDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: C.line,
    padding: 28, alignItems: 'center', marginTop: 12,
  },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  emptyBtn: {
    marginTop: 16, height: 40, paddingHorizontal: 20, borderRadius: 12,
    backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center',
  },
  emptyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
    marginBottom: 10, overflow: 'hidden',
  },
  cardTop: { flexDirection: 'row', gap: 12, padding: 14 },
  avatar: {
    width: 48, height: 48, borderRadius: 99,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontFamily: 'Georgia', fontSize: 16, color: '#fff', fontWeight: '500' },
  memberName: { fontSize: 15, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  roleTagWrap: { marginTop: 3 },
  roleTag: { fontSize: 11, color: C.muted, fontWeight: '500' },
  memberLoc: { fontSize: 11.5, color: C.muted, flex: 1 },
  memberNotes: { fontSize: 11.5, color: C.mutedSoft, marginTop: 4, fontStyle: 'italic', lineHeight: 16 },

  cardFoot: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderTopWidth: 1, borderTopColor: C.lineSoft,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  phoneText: { fontSize: 12, color: C.forest, fontWeight: '500' },
  editBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.line,
  },
  editBtnText: { fontSize: 12, color: C.ink, fontWeight: '600' },
  deleteBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#FBE3D9', borderWidth: 1, borderColor: '#E9C4B5',
  },
  deleteBtnText: { fontSize: 12, color: C.terracotta, fontWeight: '600' },

  // Modal
  modalSafe: { flex: 1, backgroundColor: C.cream },
  modalHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.lineSoft,
  },
  modalCancel: { fontSize: 14, color: C.muted, fontWeight: '500' },
  modalTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  modalDone: { fontSize: 14, color: C.forest, fontWeight: '700' },

  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
  },
  roleChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
  },
  roleChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  roleChipText: { fontSize: 12.5, color: C.ink, fontWeight: '500' },
  inputRow: {
    borderRadius: 13, borderWidth: 1, borderColor: C.line,
    backgroundColor: '#fff', paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', minHeight: 50,
  },
  inputText: { flex: 1, fontSize: 15, color: C.ink, letterSpacing: -0.15 },
  saveBtn: {
    height: 52, borderRadius: 16, backgroundColor: C.forestDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
});
