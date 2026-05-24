import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#FBE3D9', terracottaBorder: '#F2C9B8',
  sageSoft: '#DDE4D6', muted: '#6B6862', mutedSoft: '#9A968F',
  line: '#E8E0D2', lineSoft: '#EFE8DA',
};

function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IPhone() {
  return (
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M2 1h3l1.5 3-1.5 1.5a8 8 0 003.5 3.5L10 7.5l3 1.5v3a1 1 0 01-1 1A11 11 0 011 2a1 1 0 011-1z" stroke={C.forest} strokeWidth={1.3} strokeLinejoin="round" />
    </Svg>
  );
}
function IWarn() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="#fff">
      <Path d="M6 1l5 10H1L6 1z" />
    </Svg>
  );
}

function SectionHead({ title }) {
  return (
    <Text style={s.sectionHead}>{title}</Text>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export default function CaregiverPersonInfoScreen({ navigation, route }) {
  const person = route?.params?.person;
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [careTeam, setCareTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!person?.id) { setLoading(false); return; }
    (async () => {
      const [cond, allergy, ec, ct] = await Promise.allSettled([
        supabase.from('conditions').select('*').eq('person_id', person.id).eq('cured', false),
        supabase.from('allergies').select('*').eq('person_id', person.id),
        supabase.from('emergency_contacts').select('*').eq('person_id', person.id).order('created_at'),
        supabase.from('care_team').select('*').eq('person_id', person.id).order('created_at'),
      ]);
      setConditions(cond.status === 'fulfilled' ? (cond.value.data || []) : []);
      setAllergies(allergy.status === 'fulfilled' ? (allergy.value.data || []) : []);
      setEmergencyContacts(ec.status === 'fulfilled' ? (ec.value.data || []) : []);
      setCareTeam(ct.status === 'fulfilled' ? (ct.value.data || []) : []);
      setLoading(false);
    })();
  }, [person?.id]);

  const dob = person?.date_of_birth;
  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : null;
  const dobFormatted = dob
    ? new Date(dob).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // Parse allergies/conditions from the persons row (fallback if separate table is empty)
  const personAllergies = person?.allergies
    ? (Array.isArray(person.allergies)
        ? person.allergies
        : String(person.allergies).split(',').map(s => s.trim()).filter(Boolean))
    : [];
  const personConditions = person?.conditions
    ? (Array.isArray(person.conditions)
        ? person.conditions
        : String(person.conditions).split(',').map(s => s.trim()).filter(Boolean))
    : [];

  const allAllergyNames = allergies.length
    ? allergies.map(a => a.allergen || a.name)
    : personAllergies;
  const allConditionNames = conditions.length
    ? conditions.map(c => c.name)
    : personConditions;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Mode strip */}
      <View style={{ height: 4, backgroundColor: C.terracotta, opacity: 0.85 }} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={s.topTitle}>{person?.name || 'Person info'}</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Allergies — always first, safety critical ── */}
          {allAllergyNames.length > 0 && (
            <View style={s.allergyBox}>
              <View style={s.allergyIcon}>
                <IWarn />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.allergyLabel}>ALLERGIES</Text>
                <Text style={s.allergyText}>{allAllergyNames.join(' · ')}</Text>
                {allergies.filter(a => a.severity).map((a, i) => (
                  <Text key={i} style={s.allergyDetail}>
                    {a.allergen || a.name}
                    {a.severity ? ` — ${a.severity}` : ''}
                    {a.reaction ? ` · ${a.reaction}` : ''}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* ── Conditions ── */}
          {allConditionNames.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <SectionHead title="CONDITIONS" />
              <Card>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12 }}>
                  {allConditionNames.map((c, i) => (
                    <View key={i} style={s.condChip}>
                      <Text style={s.condChipText}>{c}</Text>
                    </View>
                  ))}
                </View>
                {conditions.filter(c => c.notes).map((c, i) => (
                  <View key={i} style={[s.condNote, i > 0 && { borderTopWidth: 1, borderTopColor: C.lineSoft }]}>
                    <Text style={s.condNoteName}>{c.name}</Text>
                    <Text style={s.condNoteText}>{c.notes}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* ── Basic info ── */}
          <View style={{ marginBottom: 20 }}>
            <SectionHead title="BASIC INFO" />
            <Card>
              <InfoRow label="Full name" value={person?.name} />
              <InfoRow label="Date of birth" value={dobFormatted ? `${dobFormatted}${age ? ` (${age} yrs)` : ''}` : null} />
              <InfoRow label="Relationship" value={person?.relationship} />
              <InfoRow label="Blood type" value={person?.blood_type} />
              <InfoRow label="Address" value={person?.address} />
              <InfoRow label="Health card" value={person?.health_card_number} />
              <InfoRow label="Notes" value={person?.notes} />
            </Card>
          </View>

          {/* ── Emergency contacts ── */}
          {emergencyContacts.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <SectionHead title="EMERGENCY CONTACTS" />
              {emergencyContacts.map((ec, i) => (
                <Card key={ec.id || i} style={{ marginBottom: 8 }}>
                  <View style={s.ecRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.ecName}>{ec.name}</Text>
                      {!!ec.relationship && <Text style={s.ecRel}>{ec.relationship}</Text>}
                    </View>
                    {!!ec.phone && (
                      <TouchableOpacity
                        style={s.callBtn}
                        onPress={() => Linking.openURL(`tel:${ec.phone}`)}
                      >
                        <IPhone />
                        <Text style={s.callBtnText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {!!ec.phone && <Text style={s.ecPhone}>{ec.phone}</Text>}
                  {!!ec.email && <Text style={s.ecDetail}>{ec.email}</Text>}
                  {!!ec.notes && <Text style={s.ecDetail}>{ec.notes}</Text>}
                </Card>
              ))}
            </View>
          )}

          {/* ── Care team ── */}
          {careTeam.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <SectionHead title="CARE TEAM / DOCTORS" />
              {careTeam.map((ct, i) => (
                <Card key={ct.id || i} style={{ marginBottom: 8 }}>
                  <View style={s.ecRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.ecName}>{ct.name || ct.doctor_name}</Text>
                      {!!(ct.role || ct.specialty) && (
                        <Text style={s.ecRel}>{ct.role || ct.specialty}</Text>
                      )}
                      {!!ct.clinic && <Text style={s.ecDetail}>{ct.clinic}</Text>}
                    </View>
                    {!!ct.phone && (
                      <TouchableOpacity
                        style={s.callBtn}
                        onPress={() => Linking.openURL(`tel:${ct.phone}`)}
                      >
                        <IPhone />
                        <Text style={s.callBtnText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {!!ct.phone && <Text style={s.ecPhone}>{ct.phone}</Text>}
                  {!!ct.address && <Text style={s.ecDetail}>{ct.address}</Text>}
                  {!!ct.notes && <Text style={s.ecDetail}>{ct.notes}</Text>}
                </Card>
              ))}
            </View>
          )}

          {allAllergyNames.length === 0 && allConditionNames.length === 0 &&
           emergencyContacts.length === 0 && careTeam.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No info yet</Text>
              <Text style={s.emptyText}>
                The family hasn't added conditions, allergies, emergency contacts or care team members yet.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.cream },
  topBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
  backBtn:    { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  topTitle:   { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.2 },

  sectionHead:{ fontSize: 10, fontWeight: '700', color: C.mutedSoft, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 },

  card:       { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, marginBottom: 0, overflow: 'hidden' },

  infoRow:    { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  infoLabel:  { width: 110, fontSize: 12, color: C.muted, fontWeight: '500' },
  infoValue:  { flex: 1, fontSize: 13, color: C.ink, letterSpacing: -0.1 },

  allergyBox: {
    backgroundColor: C.terracottaSoft, borderRadius: 14, padding: 12,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: C.terracottaBorder, marginBottom: 20,
  },
  allergyIcon:   { width: 26, height: 26, borderRadius: 8, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  allergyLabel:  { fontSize: 9.5, color: '#7A3F2A', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' },
  allergyText:   { fontSize: 14, color: '#5C2A1F', fontWeight: '600', marginTop: 2, lineHeight: 18 },
  allergyDetail: { fontSize: 11.5, color: '#7A3F2A', marginTop: 3, lineHeight: 16 },

  condChip:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line },
  condChipText: { fontSize: 12, color: C.ink, fontWeight: '500' },
  condNote:     { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  condNoteName: { fontSize: 11.5, fontWeight: '600', color: C.forestDeep },
  condNoteText: { fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 16 },

  ecRow:       { flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 6 },
  ecName:      { fontSize: 14, fontWeight: '600', color: C.ink },
  ecRel:       { fontSize: 11.5, color: C.muted, marginTop: 1 },
  ecPhone:     { fontSize: 13, color: C.forest, fontWeight: '500', paddingHorizontal: 12, paddingBottom: 4 },
  ecDetail:    { fontSize: 12, color: C.muted, paddingHorizontal: 12, paddingBottom: 6, lineHeight: 16 },

  callBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: C.sageSoft, borderWidth: 1, borderColor: '#A8B5A0' },
  callBtnText: { fontSize: 12, color: C.forest, fontWeight: '600' },

  empty:      { alignItems: 'center', padding: 40 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500' },
  emptyText:  { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19, marginTop: 8 },
});
