import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Linking, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CaregiverTabBar from '../components/CaregiverTabBar';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#FBE3D9', sageSoft: '#DDE4D6', sage: '#A8B5A0',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ─── Icons ───────────────────────────────────────────────────
function IEye() {
  return (
    <Svg width={14} height={10} viewBox="0 0 14 10" fill="none">
      <Path d="M1 5s2-4 6-4 6 4 6 4-2 4-6 4S1 5 1 5z" stroke={C.forest} strokeWidth={1.3} />
      <Circle cx={7} cy={5} r={1.5} stroke={C.forest} strokeWidth={1.3} />
    </Svg>
  );
}
function IPencil() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12" fill="none">
      <Path d="M8 1l3 3-7 7H1v-3l7-7z" stroke={C.mutedSoft} strokeWidth={1.3} strokeLinejoin="round" />
    </Svg>
  );
}
function IStar() {
  return (
    <Svg width={10} height={10} viewBox="0 0 11 11">
      <Path d="M5.5 1l1.4 2.8 3.1.5-2.3 2.2.5 3.1L5.5 8.1 2.8 9.6l.5-3.1L1 4.3l3.1-.5L5.5 1z" fill="#D49542" />
    </Svg>
  );
}
function IVerified() {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11">
      <Path d="M5.5 1l1.2.8 1.4-.2.4 1.4 1.2.9-.6 1.3.4 1.4-1.3.4-.7 1.3-1.4-.4L5.5 8l-1-1-1.4.4-.7-1.3-1.3-.4.4-1.4L1 3l1.2-.9.4-1.4 1.4.2L5.5 1z" fill="#fff" />
      <Path d="M3.5 5.5l1.5 1.5 3-3" stroke={C.forest} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
function IClose() {
  return (
    <Svg width={8} height={8} viewBox="0 0 10 10">
      <Path d="M2 2l6 6M8 2l-6 6" stroke={C.muted} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function IChevRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke={C.mutedSoft} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Photo tile (striped placeholder) ────────────────────────
function PhotoTile({ name, size = 84, radius = 20 }) {
  const initials = (name || 'CG').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      backgroundColor: C.forestDeep, alignItems: 'flex-end',
      justifyContent: 'flex-end', padding: 6, overflow: 'hidden',
    }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: size * 0.32, color: '#fff', fontWeight: '500', letterSpacing: -0.5 }}>
        {initials}
      </Text>
    </View>
  );
}

// ─── Toggle switch row ────────────────────────────────────────
function ToggleRow({ label, sub, on, onChange }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 }}>{label}</Text>
        {!!sub && <Text style={{ fontSize: 11, color: C.muted, marginTop: 1, lineHeight: 15 }}>{sub}</Text>}
      </View>
      <Switch
        value={on}
        onValueChange={onChange}
        trackColor={{ false: '#E5DDD0', true: C.forestDeep }}
        thumbColor="#fff"
        ios_backgroundColor="#E5DDD0"
        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
      />
    </View>
  );
}

// ─── Editable stat tile ───────────────────────────────────────
function StatEditable({ big, label, onChange, prefix }) {
  return (
    <View style={st.statCard}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
        {!!prefix && <Text style={st.statPrefix}>{prefix}</Text>}
        <TextInput
          value={String(big ?? '')}
          onChangeText={v => onChange(v.replace(/[^\d.]/g, ''))}
          style={st.statBig}
          keyboardType="numeric"
          selectTextOnFocus
        />
      </View>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}
function StatStatic({ big, label, stars }) {
  return (
    <View style={[st.statCard, { backgroundColor: C.cream, borderColor: C.lineSoft }]}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={st.statBig}>{big}</Text>
        {stars && <IStar />}
      </View>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Info card (editable field) ───────────────────────────────
function InfoEditable({ label, value, onChange }) {
  return (
    <View style={st.infoCard}>
      <Text style={st.infoLabel}>{label}</Text>
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        style={st.infoValue}
        selectTextOnFocus
      />
    </View>
  );
}

// ─── Contact row ─────────────────────────────────────────────
function ContactRow({ label, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 }}>
      <Text style={{ width: 56, fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', flexShrink: 0 }}>{label}</Text>
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        style={{ flex: 1, fontSize: 13.5, color: C.ink, letterSpacing: -0.1 }}
        autoCapitalize="none"
        keyboardType={label === 'Email' ? 'email-address' : 'phone-pad'}
      />
      <IPencil />
    </View>
  );
}

// ─── Chips editor ─────────────────────────────────────────────
function ChipsEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !items.includes(t)) onChange([...(items || []), t]);
    setDraft('');
  };
  const remove = i => onChange((items || []).filter((_, j) => j !== i));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {(items || []).map((it, i) => (
        <View key={i} style={st.chip}>
          <Text style={st.chipText}>{it}</Text>
          <TouchableOpacity onPress={() => remove(i)} style={st.chipX} activeOpacity={0.7}>
            <IClose />
          </TouchableOpacity>
        </View>
      ))}
      <View style={st.chipAdd}>
        <IPlus />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          onBlur={add}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          style={st.chipInput}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

// ─── Section title ────────────────────────────────────────────
function SectionTitle({ title, accent }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 }}>{title}</Text>
      {!!accent && <Text style={{ fontSize: 11, color: C.muted, letterSpacing: 0.2 }}>{accent}</Text>}
    </View>
  );
}

// ─── Menu row (for settings links) ───────────────────────────
function MenuRow({ label, sub, onPress, last, danger }) {
  return (
    <TouchableOpacity style={[st.menuRow, !last && st.menuBorder]} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={[st.menuLabel, danger && { color: C.terracotta }]}>{label}</Text>
        {!!sub && <Text style={st.menuSub}>{sub}</Text>}
      </View>
      {!danger && <IChevRight />}
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────
export default function CaregiverProfileScreen({ navigation }) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '',
    title: '', years_exp: '', bio: '', available: '',
    city: '', region: '', province: '', rate: '',
    specialties: [], languages: [],
    visible_in_search: true, accepting_clients: true,
  });

  const set = (k, v) => { setProfile(p => ({ ...p, [k]: v })); setDirty(true); };

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile({
        full_name: data?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: data?.phone || '',
        title: data?.title || '',
        years_exp: data?.years_exp != null ? String(data.years_exp) : '',
        bio: data?.bio || '',
        available: data?.available || '',
        city: data?.city || '',
        region: data?.region || '',
        province: data?.province || '',
        rate: data?.rate || '',
        specialties: data?.specialties || [],
        languages: data?.languages || [],
        visible_in_search: data?.visible_in_search !== false,
        accepting_clients: data?.accepting_clients !== false,
      });
    } catch (_) {}
    finally { setLoading(false); setDirty(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: user.id,
        full_name: profile.full_name,
        title: profile.title,
        years_exp: profile.years_exp ? parseInt(profile.years_exp, 10) : null,
        bio: profile.bio,
        available: profile.available,
        city: profile.city,
        region: profile.region,
        province: profile.province,
        rate: profile.rate,
        specialties: profile.specialties,
        languages: profile.languages,
        visible_in_search: profile.visible_in_search,
        accepting_clients: profile.accepting_clients,
        phone: profile.phone,
      };
      let { error } = await supabase.from('profiles').upsert(payload);
      if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        // Migration 022 not yet run — save without new columns
        const { visible_in_search, accepting_clients, phone, ...base } = payload;
        ({ error } = await supabase.from('profiles').upsert(base));
      }
      if (error) throw error;
      setDirty(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save profile.');
    }
    setSaving(false);
  };

  const handlePasswordReset = () => {
    Alert.alert('Change password', `A reset link will be sent to ${profile.email}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send link', onPress: async () => {
        await supabase.auth.resetPasswordForEmail(profile.email);
        Alert.alert('Email sent', 'Check your inbox for the reset link.');
      }},
    ]);
  };

  const name = profile.full_name || 'Caregiver';
  const ratingDisplay = '4.9';
  const reviewCount = 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.modeStrip} />

      {/* Top bar */}
      <View style={s.topBar}>
        <Text style={s.modeLabel}>Your profile</Text>
        <TouchableOpacity
          style={[s.previewBtn, { opacity: saving ? 0.5 : 1 }]}
          onPress={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            navigation.navigate('CaregiverPublicProfile', { caregiverId: user?.id });
          }}
          activeOpacity={0.8}
        >
          <IEye />
          <Text style={s.previewText}>Preview</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Hero ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
            <View style={{ position: 'relative' }}>
              <PhotoTile name={name} size={84} radius={20} />
              <View style={s.editPhotoBtn}>
                <IPencil />
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <TextInput
                value={profile.full_name}
                onChangeText={v => set('full_name', v)}
                style={s.heroName}
                selectTextOnFocus
              />
              <TextInput
                value={profile.title}
                onChangeText={v => set('title', v)}
                placeholder="Your professional title"
                placeholderTextColor={C.mutedSoft}
                style={s.heroTitle}
                selectTextOnFocus
              />
              <View style={s.verifiedBadge}>
                <IVerified />
                <Text style={s.verifiedText}>Verified pro</Text>
              </View>
            </View>
          </View>

          {/* ── Visibility toggles ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View style={s.card}>
              <ToggleRow
                label="Visible in search"
                sub="Families can find you when searching for caregivers."
                on={profile.visible_in_search}
                onChange={v => set('visible_in_search', v)}
              />
              <View style={s.cardDivider} />
              <ToggleRow
                label="Accepting new clients"
                sub="Shows a green 'available now' tag on your profile."
                on={profile.accepting_clients}
                onChange={v => set('accepting_clients', v)}
              />
            </View>
          </View>

          {/* ── Stat strip ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', gap: 8 }}>
            <StatEditable big={profile.years_exp} label="Years exp." onChange={v => set('years_exp', v)} />
            <StatStatic big={ratingDisplay} label={`${reviewCount} reviews`} stars />
            <StatEditable big={profile.rate} label="Rate ($/hr)" onChange={v => set('rate', v)} prefix="$" />
          </View>

          {/* ── Bio ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
            <SectionTitle title="About" accent={`${(profile.bio || '').length}/500`} />
            <TextInput
              value={profile.bio}
              onChangeText={v => set('bio', v.slice(0, 500))}
              multiline
              numberOfLines={5}
              style={s.bioInput}
              placeholder="Describe your experience, approach, and what makes you a great caregiver..."
              placeholderTextColor={C.mutedSoft}
              textAlignVertical="top"
            />
          </View>

          {/* ── Specialties ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <SectionTitle title="Specialties" accent="add up to 6" />
            <ChipsEditor
              items={profile.specialties}
              onChange={v => set('specialties', v)}
              placeholder="Add specialty"
            />
          </View>

          {/* ── Languages ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <SectionTitle title="Languages" />
            <ChipsEditor
              items={profile.languages}
              onChange={v => set('languages', v)}
              placeholder="Add language"
            />
          </View>

          {/* ── Location & availability ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ width: '47%' }}>
              <InfoEditable label="Region" value={profile.region} onChange={v => set('region', v)} />
            </View>
            <View style={{ width: '47%' }}>
              <InfoEditable label="City" value={profile.city} onChange={v => set('city', v)} />
            </View>
            <View style={{ width: '47%' }}>
              <InfoEditable label="Province" value={profile.province} onChange={v => set('province', v)} />
            </View>
            <View style={{ width: '47%' }}>
              <InfoEditable label="Available" value={profile.available} onChange={v => set('available', v)} />
            </View>
          </View>

          {/* ── Contact ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
            <SectionTitle title="Contact" accent="never shown publicly" />
            <View style={s.card}>
              <ContactRow label="Email" value={profile.email} onChange={() => {}} />
              <View style={s.cardDivider} />
              <ContactRow label="Phone" value={profile.phone} onChange={v => set('phone', v)} />
            </View>
          </View>

          {/* ── Reviews note ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
            <SectionTitle title="Reviews from families" accent={`★ ${ratingDisplay} average`} />
            <View style={[s.card, { padding: 14 }]}>
              <Text style={{ fontSize: 12, color: C.muted, lineHeight: 17 }}>
                Reviews are written by families you've cared for and can't be edited or removed by you.
              </Text>
            </View>
          </View>

          {/* ── Settings ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
            <SectionTitle title="Account" />
            <View style={s.card}>
              <MenuRow label="Change password" sub="Send a reset link to your email" onPress={handlePasswordReset} />
              <View style={s.cardDivider} />
              <MenuRow label="Terms & Conditions" onPress={() => Linking.openURL('https://carecircle.app/terms')} />
              <View style={s.cardDivider} />
              <MenuRow label="Privacy Policy" onPress={() => Linking.openURL('https://carecircle.app/privacy')} last />
            </View>
          </View>

          {/* ── Sign out ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
            <View style={s.card}>
              <MenuRow label="Sign out" onPress={signOut} last danger />
            </View>
          </View>

          <Text style={{ textAlign: 'center', fontSize: 11, color: C.mutedSoft, paddingTop: 16, paddingBottom: 4 }}>
            Changes go live within 30 seconds.
          </Text>
        </ScrollView>
      )}

      {/* ── Save button ── */}
      {dirty && !loading && (
        <View style={s.saveBar}>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : (
              <Text style={s.saveBtnText}>Save profile</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <CaregiverTabBar active={1} navigation={navigation} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  modeStrip: { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modeLabel: { fontSize: 10, color: C.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: '700' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line },
  previewText: { fontSize: 11.5, color: C.forestDeep, fontWeight: '600' },
  heroName: { fontFamily: 'Georgia', fontSize: 22, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.4, lineHeight: 26, padding: 0 },
  heroTitle: { fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 17, padding: 0 },
  editPhotoBtn: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  verifiedBadge: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: C.forest },
  verifiedText: { fontSize: 9.5, fontWeight: '700', color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  cardDivider: { height: 1, backgroundColor: C.lineSoft, marginHorizontal: 14 },
  bioInput: { width: '100%', padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, fontSize: 13.5, color: C.ink, lineHeight: 19, letterSpacing: -0.05, minHeight: 110 },
  saveBar: { position: 'absolute', bottom: 98, left: 20, right: 20 },
  saveBtn: { height: 52, borderRadius: 16, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center', shadowColor: C.forestDeep, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  menuLabel: { fontSize: 14, fontWeight: '500', color: C.ink },
  menuSub: { fontSize: 11, color: C.muted, marginTop: 2 },
});

const st = StyleSheet.create({
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  statPrefix: { fontFamily: 'Georgia', fontSize: 16, color: C.muted, fontWeight: '500' },
  statBig: { fontFamily: 'Georgia', fontSize: 22, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.4, lineHeight: 26, padding: 0, flex: 1 },
  statLabel: { fontSize: 10, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  infoLabel: { fontSize: 10, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '700' },
  infoValue: { fontSize: 13.5, fontWeight: '500', color: C.ink, letterSpacing: -0.1, marginTop: 4, padding: 0 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 11, paddingRight: 5, paddingVertical: 5, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line },
  chipText: { fontSize: 12, color: C.ink, fontWeight: '500', letterSpacing: -0.1 },
  chipX: { width: 18, height: 18, borderRadius: 99, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  chipAdd: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },
  chipInput: { fontSize: 12, color: C.ink, width: 90, padding: 0 },
});
