import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Platform, Alert, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path, Rect, Polygon } from 'react-native-svg';
import { colors } from '../theme';
import { IconPlus } from '../components/Icons';
import TabBar from '../components/TabBar';
import { supabase } from '../lib/supabase';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1',
  muted: '#6B6862', mutedSoft: '#9A968F',
  line: '#E8E0D2', lineSoft: '#EFE8DA', sageSoft: '#DDE4D6',
};

// ── Section SVG icons ─────────────────────────────────────────────────────────

function IVitals() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={C.forest} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IMeds() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 12.5L12 5a5 5 0 017 7l-7.5 7.5a5 5 0 01-7-7z" stroke={C.forest} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 9l6 6" stroke={C.forest} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IDocs() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={C.forest} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={C.forest} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IProfile() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={C.forest} strokeWidth={1.8} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.forest} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ICalendar() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={C.forest} strokeWidth={1.8} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={C.forest} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IClock() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={C.forest} strokeWidth={1.8} />
      <Path d="M12 7v5l3 3" stroke={C.forest} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Permission sections ───────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'vitals',       label: 'Vitals',                  desc: 'Blood pressure, sugar, weight…', Icon: IVitals },
  { key: 'medications',  label: 'Medications',              desc: 'Current meds & schedules',       Icon: IMeds },
  { key: 'reports',      label: 'Reports & prescriptions',  desc: 'Documents & lab results',        Icon: IDocs },
  { key: 'profile',      label: 'Profile information',      desc: 'Conditions, allergies, info',    Icon: IProfile },
  { key: 'appointments', label: 'Appointments',             desc: 'Upcoming & past visits',         Icon: ICalendar },
  { key: 'activity',     label: 'Activity history',         desc: 'Daily logs & notes',             Icon: IClock },
];

function defaultPerms() {
  const p = {};
  SECTIONS.forEach(({ key }) => { p[key] = { view: true, contribute: false }; });
  return p;
}

function parsePerms(raw) {
  const defaults = defaultPerms();
  if (!raw) return defaults;
  // Legacy array format: ['vitals','medications',…]
  if (Array.isArray(raw)) {
    const p = {};
    SECTIONS.forEach(({ key }) => { p[key] = { view: raw.includes(key), contribute: false }; });
    return p;
  }
  if (typeof raw === 'object') {
    const p = {};
    SECTIONS.forEach(({ key }) => {
      const v = raw[key];
      if (typeof v === 'object' && v !== null) {
        p[key] = { view: v.view !== false, contribute: !!v.contribute };
      } else {
        p[key] = { view: v !== false, contribute: false };
      }
    });
    return p;
  }
  return defaults;
}

function permSummary(raw) {
  const p = parsePerms(raw);
  const on = SECTIONS.filter(s => p[s.key]?.view);
  const contrib = SECTIONS.filter(s => p[s.key]?.contribute);
  if (on.length === 0) return 'No access';
  if (on.length === SECTIONS.length && contrib.length === SECTIONS.length) return 'Full access · Read & contribute';
  if (contrib.length > 0) return `${on.length} sections · Read & contribute`;
  return `${on.length} sections · Read only`;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ISearch() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Circle cx={6} cy={6} r={4.5} stroke="#fff" strokeWidth={1.6} />
      <Path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function IPlus() {
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <Path d="M6.5 1v11M1 6.5h11" stroke={C.forestDeep} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}
function ICheck() {
  return (
    <Svg width={11} height={9} viewBox="0 0 12 10" fill="none">
      <Path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IPencil() {
  return (
    <Svg width={13} height={13} viewBox="0 0 14 14" fill="none">
      <Path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke={C.forest} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

// ── Permission Edit Sheet ─────────────────────────────────────────────────────

function EditSheet({ visible, rel, persons, onClose, onSave }) {
  const [perms, setPerms] = useState(defaultPerms());
  const [personId, setPersonId] = useState('');
  const [saving, setSaving] = useState(false);
  const slide = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible && rel) {
      setPerms(parsePerms(rel.permissions));
      setPersonId(rel.person_id || persons[0]?.id || '');
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }).start();
    } else {
      Animated.timing(slide, { toValue: 600, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible, rel]);

  const toggleView = (key) => {
    setPerms(p => {
      const cur = p[key];
      if (cur.view) {
        // turning off view also turns off contribute
        return { ...p, [key]: { view: false, contribute: false } };
      }
      return { ...p, [key]: { ...cur, view: true } };
    });
  };

  const toggleContrib = (key) => {
    setPerms(p => {
      const cur = p[key];
      // contribute requires view
      return { ...p, [key]: { view: true, contribute: !cur.contribute } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(rel, personId, perms);
    setSaving(false);
  };

  if (!rel) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={sh.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[sh.sheet, { transform: [{ translateY: slide }] }]}>
        <View style={sh.handle} />

        {/* Caregiver header */}
        <View style={sh.header}>
          <View style={[sh.avatar, { backgroundColor: '#3F5D54' }]}>
            <Text style={sh.avatarText}>{getInitials(rel._name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={sh.name}>{rel._name}</Text>
            <Text style={sh.role}>{rel.role || 'Caregiver'}</Text>
          </View>
        </View>

        <View style={sh.divider} />

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
          {/* Person assignment */}
          {persons.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={sh.sectionLabel}>ASSIGNED TO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row' }}>
                {persons.map(p => {
                  const active = personId === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setPersonId(p.id)}
                      style={[sh.personChip, active && sh.personChipActive]}
                    >
                      <Text style={[sh.personChipText, active && { color: '#fff' }]}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Permission rows */}
          <Text style={sh.sectionLabel}>ACCESS PERMISSIONS</Text>

          {/* Column headers */}
          <View style={sh.colHeader}>
            <View style={{ flex: 1 }} />
            <Text style={sh.colLabel}>Read</Text>
            <Text style={sh.colLabel}>Contribute</Text>
          </View>

          {SECTIONS.map(({ key, label, desc, Icon }) => {
            const p = perms[key];
            return (
              <View key={key} style={sh.row}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Icon />
                    <Text style={sh.rowLabel}>{label}</Text>
                  </View>
                  <Text style={sh.rowDesc}>{desc}</Text>
                </View>
                {/* View toggle */}
                <TouchableOpacity
                  onPress={() => toggleView(key)}
                  style={[sh.toggle, p.view && sh.toggleOn]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {p.view && <ICheck />}
                </TouchableOpacity>
                {/* Contribute toggle */}
                <TouchableOpacity
                  onPress={() => toggleContrib(key)}
                  style={[sh.toggle, p.contribute && sh.toggleContrib]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {p.contribute && <ICheck />}
                </TouchableOpacity>
              </View>
            );
          })}

          <Text style={sh.hint}>Contribute = can log, upload, or add entries. Read = view only.</Text>
        </ScrollView>

        {/* Actions */}
        <View style={sh.actions}>
          <TouchableOpacity style={sh.cancelBtn} onPress={onClose}>
            <Text style={sh.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[sh.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={sh.saveText}>Save changes</Text>
            }
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CareScreen({ navigation }) {
  const [caregivers, setCaregivers] = useState([]);
  const [persons, setPersons] = useState([]);
  const [editSheet, setEditSheet] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Backfill owner_name on any old requests that are missing it.
      // The owner can always read their own profile and update their own rows.
      try {
        const { data: ownerProfile } = await supabase
          .from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        const ownerName = ownerProfile?.full_name || '';
        if (ownerName) {
          await supabase
            .from('caregiver_requests')
            .update({ owner_name: ownerName })
            .eq('owner_id', user.id);
        }
      } catch (_) {}

      try {
        const [{ data: reqs }, { data: relRows }] = await Promise.all([
          supabase
            .from('caregiver_requests')
            .select('id, caregiver_id, caregiver_email, person_id, role, permissions')
            .eq('owner_id', user.id)
            .eq('status', 'accepted'),
          // Owner always has RLS access to their caregiver_relationships rows
          supabase
            .from('caregiver_relationships')
            .select('caregiver_id, caregiver_name, caregiver_email')
            .eq('profile_owner_id', user.id),
        ]);

        // Names from caregiver_relationships (most reliable — stored when caregiver accepts)
        const cgRelNameMap = {};
        (relRows || []).forEach(r => {
          if (r.caregiver_id && r.caregiver_name) cgRelNameMap[r.caregiver_id] = r.caregiver_name;
        });

        // Names from profiles as secondary source (works when profiles RLS allows read)
        const cgIds = (reqs || []).map(r => r.caregiver_id).filter(Boolean);
        let nameMap = {};
        if (cgIds.length) {
          const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', cgIds);
          (profs || []).forEach(p => { if (p.full_name) nameMap[p.id] = p.full_name; });
        }

        const seen = new Set();
        const deduped = (reqs || []).filter(r => {
          const key = r.caregiver_id || r.caregiver_email;
          if (!key || seen.has(key)) return false;
          seen.add(key); return true;
        });
        setCaregivers(deduped.map(r => ({
          ...r,
          _name: cgRelNameMap[r.caregiver_id] || nameMap[r.caregiver_id] || r.caregiver_email || 'Caregiver',
        })));
      } catch (_) { setCaregivers([]); }

      try {
        const { data: ps } = await supabase.from('persons').select('id, name, relationship').eq('user_id', user.id);
        setPersons(ps || []);
      } catch (_) {}
    } catch (_) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openEdit = (rel) => setEditSheet(rel);

  const handleSave = async (rel, personId, perms) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Update caregiver_requests (owner always has access to their own rows)
      const { error } = await supabase
        .from('caregiver_requests')
        .update({ person_id: personId || null, permissions: perms })
        .eq('id', rel.id)
        .eq('owner_id', user.id);
      if (error) throw error;

      // 2. Write to caregiver_relationships so the caregiver portal can read it.
      // If caregiver_id is still null, resolve via find_user_by_email RPC (queries
      // auth.users directly — no role filter, most reliable).
      let effectiveCgId = rel.caregiver_id;
      if (!effectiveCgId && rel.caregiver_email) {
        // Best: find_user_by_email queries auth.users — no profiles/role dependency
        try {
          const { data: uid } = await supabase
            .rpc('find_user_by_email', { p_email: rel.caregiver_email.trim().toLowerCase() });
          effectiveCgId = uid || null;
        } catch (_) {}

        // Fallback 1: search_caregiver_by_email (needs role='caregiver' in profiles)
        if (!effectiveCgId) {
          try {
            const { data: found } = await supabase
              .rpc('search_caregiver_by_email', { p_email: rel.caregiver_email });
            effectiveCgId = found?.[0]?.id || null;
          } catch (_) {}
        }

        // Fallback 2: direct profiles lookup (works if RLS allows)
        if (!effectiveCgId) {
          try {
            const { data: cp } = await supabase
              .from('profiles').select('id').eq('email', rel.caregiver_email).maybeSingle();
            effectiveCgId = cp?.id || null;
          } catch (_) {}
        }

        if (effectiveCgId) {
          await supabase.from('caregiver_requests')
            .update({ caregiver_id: effectiveCgId })
            .eq('id', rel.id)
            .catch(() => {});
        }
      }

      if (!effectiveCgId) {
        Alert.alert(
          'Caregiver not found',
          `Could not link ${rel.caregiver_email || 'this caregiver'} — they may not have created an account yet. Permissions were saved; the connection will activate when they sign up.`
        );
        setEditSheet(null);
        load();
        return;
      }

      if (effectiveCgId && personId) {
        const { data: updated } = await supabase
          .from('caregiver_relationships')
          .update({ person_id: personId, permissions: perms, access_revoked: false })
          .eq('profile_owner_id', user.id)
          .eq('caregiver_id', effectiveCgId)
          .select('id');

        if (!updated || updated.length === 0) {
          await supabase.from('caregiver_relationships').insert({
            caregiver_id: effectiveCgId,
            profile_owner_id: user.id,
            person_id: personId,
            role: rel.role || 'caregiver',
            caregiver_name: rel._name || '',
            caregiver_email: rel.caregiver_email || null,
            permissions: perms,
            access_revoked: false,
          });
        }
      }

      setEditSheet(null);
      load();
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save.');
    }
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
          <Text style={styles.heroSub}>Find caregivers, invite family, manage who can see what.</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => navigation.navigate('FindCaregiver')}>
            <ISearch />
            <Text style={styles.primaryBtnText}>Find caregiver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { flex: 1 }]}
            onPress={() => navigation.navigate('InviteCaregiver', { personId: persons[0]?.id })}
          >
            <IPlus />
            <Text style={styles.secondaryBtnText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Care team */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Your care team</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FindCaregiver')}>
              <Text style={styles.sectionAction}>Find more</Text>
            </TouchableOpacity>
          </View>

          {caregivers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No caregivers yet. Find a professional or invite someone you trust.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('FindCaregiver')}>
                <IconPlus color={colors.forest} />
                <Text style={styles.emptyBtnText}>Find caregiver</Text>
              </TouchableOpacity>
            </View>
          ) : (
            caregivers.map(rel => {
              const assigned = persons.find(p => p.id === rel.person_id);
              const summary = permSummary(rel.permissions);
              return (
                <View key={rel.id} style={styles.teamCard}>
                  {/* Avatar + name */}
                  <View style={[styles.teamAvatar, { backgroundColor: '#3F5D54' }]}>
                    <Text style={styles.teamAvatarText}>{getInitials(rel._name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{rel._name}</Text>
                    <Text style={styles.teamRole}>{rel.role || 'Caregiver'}</Text>
                    {assigned && (
                      <Text style={styles.teamAssigned}>Caring for {assigned.name}</Text>
                    )}
                  </View>

                  {/* Edit button */}
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(rel)}>
                    <IPencil />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>

                  {/* Access summary bar */}
                  <View style={styles.accessBar}>
                    <View style={styles.accessDot} />
                    <Text style={styles.accessSummary}>{summary}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <TabBar active={2} navigation={navigation} />

      <EditSheet
        visible={!!editSheet}
        rel={editSheet}
        persons={persons}
        onClose={() => setEditSheet(null)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 18 },
  emptyBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyBtnText: { fontSize: 13, color: C.forest, fontWeight: '600' },

  // Team card
  teamCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
    padding: 14, marginBottom: 10,
  },
  teamAvatar: { width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 14, left: 14 },
  teamAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 14, fontWeight: '500' },
  teamName: { fontSize: 14.5, fontWeight: '600', color: C.ink, marginLeft: 56 },
  teamRole: { fontSize: 11.5, color: C.mutedSoft, marginLeft: 56, marginTop: 1 },
  teamAssigned: { fontSize: 11.5, color: C.forest, marginLeft: 56, marginTop: 2, fontWeight: '500' },
  editBtn: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9,
    backgroundColor: C.sageSoft, borderWidth: 1, borderColor: '#A8B5A0',
  },
  editBtnText: { fontSize: 12, color: C.forest, fontWeight: '600' },
  accessBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.lineSoft,
    marginLeft: 56,
  },
  accessDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: '#7AB87A' },
  accessSummary: { fontSize: 11.5, color: C.muted },
});

// ── Sheet styles ──────────────────────────────────────────────────────────────

const sh = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 20,
  },
  handle: { width: 38, height: 4, borderRadius: 99, backgroundColor: '#D4CEC5', alignSelf: 'center', marginBottom: 18 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  avatar: { width: 46, height: 46, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 15, fontWeight: '500' },
  name: { fontFamily: 'Georgia', fontSize: 19, color: C.forestDeep, fontWeight: '500' },
  role: { fontSize: 12, color: C.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.lineSoft, marginVertical: 16 },

  sectionLabel: { fontSize: 10.5, fontWeight: '700', color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 },

  personChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', marginRight: 6,
  },
  personChipActive: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  personChipText: { fontSize: 13, fontWeight: '500', color: C.ink },

  // Permission table
  colHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  colLabel: { width: 80, textAlign: 'center', fontSize: 10.5, fontWeight: '700', color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  rowLabel: { fontSize: 13.5, fontWeight: '500', color: C.ink },
  rowDesc: { fontSize: 11, color: C.mutedSoft, marginTop: 2 },

  toggle: {
    width: 80, alignItems: 'center', justifyContent: 'center',
    height: 30, borderRadius: 8,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  toggleOn: { backgroundColor: C.forestDeep, borderColor: C.forestDeep },
  toggleContrib: { backgroundColor: C.terracotta, borderColor: C.terracotta },

  hint: { fontSize: 11, color: C.mutedSoft, marginTop: 14, marginBottom: 6, lineHeight: 16 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, color: C.muted, fontWeight: '500' },
  saveBtn: { flex: 2, height: 50, borderRadius: 14, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});
