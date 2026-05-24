import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius, fonts } from '../theme';
import Card from '../components/Card';
import SectionRow from '../components/SectionRow';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Svg, { Path, Circle, Polygon } from 'react-native-svg';

const IC = '#1F3D38';
const IUser  = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Circle,{cx:'12',cy:'8',r:'4',stroke:IC,strokeWidth:'1.8'}), React.createElement(Path,{d:'M4 20c0-4 3.6-7 8-7s8 3 8 7',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round'}));
const IHeart = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Path,{d:'M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z',stroke:IC,strokeWidth:'1.8',strokeLinejoin:'round'}));
const IWarn  = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Polygon,{points:'12,3 22,21 2,21',stroke:IC,strokeWidth:'1.8',strokeLinejoin:'round'}), React.createElement(Path,{d:'M12 10v4',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round'}), React.createElement(Path,{d:'M12 17.5v.5',stroke:IC,strokeWidth:'2',strokeLinecap:'round'}));
const IPill  = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Path,{d:'M4.5 12.5L12 5a5 5 0 017 7l-7.5 7.5a5 5 0 01-7-7z',stroke:IC,strokeWidth:'1.8',strokeLinejoin:'round'}), React.createElement(Path,{d:'M9 9l6 6',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round'}));
const ITeam  = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Circle,{cx:'9',cy:'8',r:'3',stroke:IC,strokeWidth:'1.8'}), React.createElement(Path,{d:'M3 19c0-3.3 2.7-6 6-6',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round'}), React.createElement(Circle,{cx:'17',cy:'8',r:'3',stroke:IC,strokeWidth:'1.8'}), React.createElement(Path,{d:'M21 19c0-3.3-2.7-6-6-6',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round'}));
const IPhone = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Path,{d:'M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.55.6 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1H7.5a1 1 0 011 1c0 1.25.2 2.45.6 3.55a1 1 0 01-.25 1L6.6 10.8z',stroke:IC,strokeWidth:'1.8',strokeLinejoin:'round'}));
const IFlask = () => React.createElement(Svg, {width:18,height:18,viewBox:'0 0 24 24',fill:'none'}, React.createElement(Path,{d:'M9 3v8L4 19a2 2 0 001.8 2.9h12.4A2 2 0 0020 19l-5-8V3',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round',strokeLinejoin:'round'}), React.createElement(Path,{d:'M7 3h10',stroke:IC,strokeWidth:'1.8',strokeLinecap:'round'}));
async function fetchCounts(personId) {
  const [person, conditions, allergies, medications, careTeam, emergencyContacts, labResults] = await Promise.all([supabase.from('persons').select('sex, weight_kg, height_cm, date_of_birth').eq('id', personId).single(), supabase.from('conditions').select('id', {
    count: 'exact',
    head: true
  }).eq('person_id', personId), supabase.from('allergies').select('id', {
    count: 'exact',
    head: true
  }).eq('person_id', personId), supabase.from('medications').select('id', {
    count: 'exact',
    head: true
  }).eq('person_id', personId), supabase.from('care_team').select('id', {
    count: 'exact',
    head: true
  }).eq('person_id', personId), supabase.from('emergency_contacts').select('id', {
    count: 'exact',
    head: true
  }).eq('person_id', personId), supabase.from('lab_results').select('id', {
    count: 'exact',
    head: true
  }).eq('person_id', personId)]);
  const p = person.data;
  return {
    basicInfo: !!(p?.sex || p?.weight_kg || p?.height_cm || p?.date_of_birth),
    conditions: conditions.count ?? 0,
    allergies: allergies.count ?? 0,
    medications: medications.count ?? 0,
    careTeam: careTeam.count ?? 0,
    emergencyContacts: emergencyContacts.count ?? 0,
    labResults: labResults.count ?? 0
  };
}
function buildSections(counts) {
  return [{
    icon: React.createElement(IUser, null),
    title: 'Basic Info',
    screen: 'BasicInfo',
    completed: counts.basicInfo,
    subtitle: counts.basicInfo ? 'Added' : 'DOB, sex, weight, height'
  }, {
    icon: React.createElement(IHeart, null),
    title: 'Conditions',
    screen: 'Conditions',
    completed: counts.conditions > 0,
    subtitle: counts.conditions > 0 ? `${counts.conditions} condition${counts.conditions !== 1 ? 's' : ''}` : 'Not added yet'
  }, {
    icon: React.createElement(IWarn, null),
    title: 'Allergies',
    screen: 'Allergies',
    completed: counts.allergies > 0,
    subtitle: counts.allergies > 0 ? `${counts.allergies} allerg${counts.allergies !== 1 ? 'ies' : 'y'}` : 'Not added yet'
  }, {
    icon: React.createElement(IPill, null),
    title: 'Medications',
    screen: 'Medications',
    completed: counts.medications > 0,
    subtitle: counts.medications > 0 ? `${counts.medications} medication${counts.medications !== 1 ? 's' : ''}` : 'Not added yet'
  }, {
    icon: React.createElement(ITeam, null),
    title: 'Care Team',
    screen: 'CareTeam',
    completed: counts.careTeam > 0,
    subtitle: counts.careTeam > 0 ? `${counts.careTeam} member${counts.careTeam !== 1 ? 's' : ''}` : 'Not added yet'
  }, {
    icon: React.createElement(IPhone, null),
    title: 'Emergency Contacts',
    screen: 'EmergencyContacts',
    completed: counts.emergencyContacts > 0,
    subtitle: counts.emergencyContacts > 0 ? `${counts.emergencyContacts} contact${counts.emergencyContacts !== 1 ? 's' : ''}` : 'Not added yet'
  }, {
    icon: React.createElement(IFlask, null),
    title: 'Lab Results',
    screen: 'LabResults',
    completed: counts.labResults > 0,
    subtitle: counts.labResults > 0 ? `${counts.labResults} report${counts.labResults !== 1 ? 's' : ''}` : 'Upload a lab PDF or photo'
  }];
}
export default function ProfileScreen({
  navigation,
  route
}) {
  // Support both { person } (full object) and { personId } (bare ID from PeopleScreen / DashboardScreen)
  const routePerson = route?.params?.person;
  const routePersonId = route?.params?.personId;

  const [resolvedPerson, setResolvedPerson] = useState(routePerson ?? null);

  useEffect(() => {
    if (routePerson) {
      setResolvedPerson(routePerson);
      return;
    }
    if (routePersonId) {
      supabase
        .from('persons').select('*').eq('id', routePersonId).maybeSingle()
        .then(({ data }) => { if (data) setResolvedPerson(data); });
      return;
    }
    // No params — fetch the current user's first person automatically
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('persons').select('*').eq('user_id', user.id).limit(1).maybeSingle()
        .then(({ data }) => { if (data) setResolvedPerson(data); });
    });
  }, [routePerson, routePersonId]);

  const person = resolvedPerson;
  const personId = person?.id ?? routePersonId;
  const name = person?.name ?? '';
  const relationship = person?.relationship ?? '';
  const dob = person?.date_of_birth ?? null;
  const [sections, setSections] = useState(buildSections({
    basicInfo: false,
    conditions: 0,
    allergies: 0,
    medications: 0,
    careTeam: 0,
    emergencyContacts: 0,
    labResults: 0
  }));
  const [loadingCounts, setLoadingCounts] = useState(true);
  const refresh = useCallback(async () => {
    if (!personId) {
      setLoadingCounts(false);
      return;
    }
    const counts = await fetchCounts(personId);
    setSections(buildSections(counts));
    setLoadingCounts(false);
  }, [personId]);
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-fetch when navigating back to this screen
  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);
  const completedCount = sections.filter(s => s.completed).length;
  const pct = Math.round(completedCount / sections.length * 100);
  const allergiesAdded = sections.find(s => s.screen === 'Allergies')?.completed ?? false;
  const initial = name.charAt(0).toUpperCase();
  const dobDisplay = dob ? new Date(dob).toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : null;
  const navigate = screen => navigation.navigate(screen, {
    person
  });
  return /*#__PURE__*/_jsx(SafeAreaView, {
    style: styles.safe,
    children: /*#__PURE__*/_jsxs(ScrollView, {
      showsVerticalScrollIndicator: false,
      children: [/*#__PURE__*/_jsx(View, {
        style: styles.header,
        children: /*#__PURE__*/_jsx(TouchableOpacity, {
          onPress: () => navigation.goBack(),
          children: /*#__PURE__*/_jsx(Text, {
            style: styles.back,
            children: "\u2190 Dashboard"
          })
        })
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.hero,
        children: [/*#__PURE__*/_jsx(View, {
          style: styles.heroAvatar,
          children: /*#__PURE__*/_jsx(Text, {
            style: styles.heroAvatarText,
            children: initial
          })
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.heroName,
          children: name
        }), /*#__PURE__*/_jsxs(Text, {
          style: styles.heroRelation,
          children: [relationship, dobDisplay ? ` · Born ${dobDisplay}` : '']
        }), loadingCounts ? /*#__PURE__*/_jsx(ActivityIndicator, {
          color: colors.primary,
          style: {
            marginTop: spacing.md
          }
        }) : /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.progressRow,
            children: [/*#__PURE__*/_jsx(View, {
              style: styles.progressBar,
              children: /*#__PURE__*/_jsx(View, {
                style: [styles.progressFill, {
                  width: `${pct}%`
                }]
              })
            }), /*#__PURE__*/_jsxs(Text, {
              style: styles.progressPct,
              children: [pct, "%"]
            })]
          }), /*#__PURE__*/_jsxs(Text, {
            style: styles.progressLabel,
            children: [completedCount, " of ", sections.length, " sections complete"]
          })]
        })]
      }), !allergiesAdded && !loadingCounts && /*#__PURE__*/_jsx(View, {
        style: styles.section,
        children: /*#__PURE__*/_jsx(Card, {
          style: styles.allergyAlert,
          variant: "outlined",
          children: /*#__PURE__*/_jsxs(View, {
            style: styles.allergyRow,
            children: [/*#__PURE__*/_jsx(View, {
              style: styles.allergyIcon,
              children: React.createElement(IWarn, null)
            }), /*#__PURE__*/_jsxs(View, {
              style: styles.allergyContent,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.allergyTitle,
                children: "Allergies not added"
              }), /*#__PURE__*/_jsx(Text, {
                style: styles.allergyText,
                children: "Add allergies so care team members can see them at a glance."
              })]
            }), /*#__PURE__*/_jsx(TouchableOpacity, {
              onPress: () => navigate('Allergies'),
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.allergyAdd,
                children: "Add"
              })
            })]
          })
        })
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.section,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.sectionTitle,
          children: "Profile sections"
        }), /*#__PURE__*/_jsx(Card, {
          style: styles.sectionsCard,
          variant: "outlined",
          children: sections.map(s => /*#__PURE__*/_jsx(SectionRow, {
            icon: s.icon,
            title: s.title,
            subtitle: s.subtitle,
            onPress: () => navigate(s.screen),
            completed: s.completed
          }, s.screen))
        })]
      }), /*#__PURE__*/_jsxs(View, {
        style: [styles.section, {
          marginBottom: spacing.xxl
        }],
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.sectionTitle,
          children: "Sharing"
        }), /*#__PURE__*/_jsxs(Card, {
          style: styles.shareCard,
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.shareRow,
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.shareIcon,
              children: "\uD83D\uDD17"
            }), /*#__PURE__*/_jsxs(View, {
              style: styles.shareContent,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.shareTitle,
                children: "Share read-only access"
              }), /*#__PURE__*/_jsxs(Text, {
                style: styles.shareText,
                children: ["Share ", name, "'s medications & allergies with a PSW or family member."]
              })]
            })]
          }), /*#__PURE__*/_jsx(TouchableOpacity, {
            style: styles.shareBtn,
            onPress: () => {},
            children: /*#__PURE__*/_jsx(Text, {
              style: styles.shareBtnText,
              children: "Send invite link"
            })
          })]
        })]
      })]
    })
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md
  },
  back: {
    ...typography.body,
    color: colors.primary
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  heroAvatarText: {
    fontSize: 36,
    fontFamily: fonts.serif,
    color: colors.white,
    fontWeight: '400'
  },
  heroName: {
    fontFamily: fonts.serif,
    fontSize: 26,
    fontWeight: '400',
    color: colors.text,
    letterSpacing: -0.4
  },
  heroRelation: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    marginBottom: 4
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden'
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full
  },
  progressPct: {
    ...typography.label,
    color: colors.primary,
    minWidth: 36,
    textAlign: 'right'
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm
  },
  allergyAlert: {
    padding: spacing.md,
    borderColor: colors.warning
  },
  allergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  allergyIcon: {
    fontSize: 24
  },
  allergyContent: {
    flex: 1
  },
  allergyTitle: {
    ...typography.h4,
    color: colors.text
  },
  allergyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2
  },
  allergyAdd: {
    ...typography.h4,
    color: colors.primary
  },
  sectionsCard: {
    padding: 0,
    overflow: 'hidden'
  },
  shareCard: {
    padding: spacing.md,
    gap: spacing.md
  },
  shareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start'
  },
  shareIcon: {
    fontSize: 24
  },
  shareContent: {
    flex: 1
  },
  shareTitle: {
    ...typography.h4,
    color: colors.text
  },
  shareText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2
  },
  shareBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  shareBtnText: {
    ...typography.h4,
    color: colors.primary
  }
});