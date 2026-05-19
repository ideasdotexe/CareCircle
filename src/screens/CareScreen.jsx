import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';
import { IconPlus, IconArrow } from '../components/Icons';
import TabBar from '../components/TabBar';
import { supabase } from '../lib/supabase';

export default function CareScreen({ navigation }) {
  const [caregivers, setCaregivers] = useState([]);
  const [marketplace, setMarketplace] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const { data } = await supabase.from('caregiver_relationships').select('*, caregiver:caregiver_id(*)').eq('owner_id', user.id);
        setCaregivers(data || []);
      } catch (_) { setCaregivers([]); }
      try {
        const { data } = await supabase.from('caregiver_profiles').select('*').limit(3);
        setMarketplace(data || []);
      } catch (_) { setMarketplace([]); }
    } catch (_) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.title}>Care</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={styles.hero}>The people{'\n'}who help.</Text>
          <Text style={styles.heroSub}>Find caregivers, invite family, manage who can do what.</Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => navigation.navigate('FindCaregiver')}>
            <SearchIcon />
            <Text style={styles.primaryBtnText}>Find caregiver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => navigation.navigate('ManageCaregivers')}>
            <Text style={styles.secondaryBtnText}>Manage team</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Your care team</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ManageCaregivers')}>
              <Text style={styles.sectionAction}>Manage</Text>
            </TouchableOpacity>
          </View>
          {caregivers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No caregivers yet. Invite family or find a professional.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('InviteCaregiver')}>
                <IconPlus color={colors.forest} />
                <Text style={styles.emptyBtnText}>Invite someone</Text>
              </TouchableOpacity>
            </View>
          ) : (
            caregivers.map(c => (
              <View key={c.id} style={styles.cgCard}>
                <View style={[styles.avatar, { backgroundColor: '#3F5D54' }]}>
                  <Text style={styles.avatarText}>{getInitials(c.caregiver?.full_name || c.caregiver_email || '?')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cgName}>{c.caregiver?.full_name || c.caregiver_email || 'Caregiver'}</Text>
                  <Text style={styles.cgMeta}>{c.role || 'Family'} · {c.status || 'active'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Caregivers near you</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FindCaregiver')}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          {marketplace.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Browse verified professionals across Canada.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('FindCaregiver')}>
                <Text style={styles.emptyBtnText}>Open directory</Text>
                <IconArrow color={colors.forest} />
              </TouchableOpacity>
            </View>
          ) : (
            marketplace.map(c => (
              <TouchableOpacity key={c.id} style={styles.cgCard} onPress={() => navigation.navigate('CaregiverPublicProfile', { id: c.id })}>
                <View style={[styles.avatar, { backgroundColor: '#C66E4E' }]}>
                  <Text style={styles.avatarText}>{getInitials(c.full_name || '')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cgName}>{c.full_name}</Text>
                  <Text style={styles.cgMeta}>{c.title || ''} · {c.city || ''}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TabBar active={2} navigation={navigation} />
    </SafeAreaView>
  );
}

function SearchIcon() {
  return (
    <Svg width="14" height="14" viewBox="0 0 14 14">
      <Circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.6" fill="none" />
      <Path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Georgia', fontSize: 17, color: colors.forestDeep, fontWeight: '500' },
  hero: { fontFamily: 'Georgia', fontSize: 28, lineHeight: 32, color: colors.forestDeep, fontWeight: '400', letterSpacing: -0.6 },
  heroSub: { marginTop: 8, fontSize: 13, color: colors.muted, lineHeight: 18 },
  btnRow: { padding: 20, paddingTop: 18, flexDirection: 'row', gap: 8 },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '500' },
  secondaryBtn: { height: 52, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: colors.forestDeep, fontSize: 14.5, fontWeight: '500' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, color: colors.forestDeep, fontWeight: '500' },
  sectionAction: { fontSize: 12, color: colors.forest, fontWeight: '500' },
  empty: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 22, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  emptyBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyBtnText: { fontSize: 13, color: colors.forest, fontWeight: '600' },
  cgCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 14, fontWeight: '500' },
  cgName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  cgMeta: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
});
