import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, fonts, typography, radius } from '../theme';
import { supabase } from '../lib/supabase';
import TabBar from '../components/TabBar';
import { IconDoc } from '../components/Icons';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function DocsHomeScreen({
  navigation
}) {
  const [persons, setPersons] = useState([]);
  const [activePerson, setActivePerson] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async person => {
    const {
      data: personsData
    } = await supabase.from('persons').select('id, name, relationship').order('created_at', {
      ascending: true
    });
    if (!personsData?.length) {
      setLoading(false);
      return;
    }
    setPersons(personsData);
    const target = person ?? personsData[0];
    setActivePerson(target);
    const {
      data: labData
    } = await supabase.from('lab_results').select('id, report_date, extracted_data, created_at').eq('person_id', target.id).order('created_at', {
      ascending: false
    });
    setReports(labData ?? []);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => load());
    return unsub;
  }, [navigation, load]);
  const switchPerson = p => {
    setActivePerson(p);
    setLoading(true);
    load(p);
  };
  return /*#__PURE__*/_jsxs(SafeAreaView, {
    style: styles.safe,
    children: [/*#__PURE__*/_jsx(View, {
      style: styles.topBar,
      children: /*#__PURE__*/_jsx(Text, {
        style: styles.topTitle,
        children: "Documents"
      })
    }), persons.length > 1 && /*#__PURE__*/_jsx(ScrollView, {
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      contentContainerStyle: styles.switcher,
      children: persons.map(p => /*#__PURE__*/_jsx(TouchableOpacity, {
        style: [styles.chip, activePerson?.id === p.id && styles.chipActive],
        onPress: () => switchPerson(p),
        activeOpacity: 0.8,
        children: /*#__PURE__*/_jsx(Text, {
          style: [styles.chipText, activePerson?.id === p.id && styles.chipTextActive],
          children: p.name
        })
      }, p.id))
    }), /*#__PURE__*/_jsxs(ScrollView, {
      contentContainerStyle: styles.content,
      showsVerticalScrollIndicator: false,
      children: [/*#__PURE__*/_jsxs(TouchableOpacity, {
        style: styles.uploadCard,
        onPress: () => navigation.navigate('DocumentUpload', {
          person: activePerson
        }),
        activeOpacity: 0.85,
        children: [/*#__PURE__*/_jsx(View, {
          style: styles.uploadIcon,
          children: /*#__PURE__*/_jsx(IconDoc, {
            color: colors.forest
          })
        }), /*#__PURE__*/_jsxs(View, {
          style: {
            flex: 1
          },
          children: [/*#__PURE__*/_jsx(Text, {
            style: styles.uploadTitle,
            children: "Scan a prescription or lab report"
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.uploadSub,
            children: "AI reads it and pre-fills your profile"
          })]
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.uploadArrow,
          children: "\u203A"
        })]
      }), /*#__PURE__*/_jsxs(Text, {
        style: styles.sectionTitle,
        children: ["Lab results", activePerson ? ` · ${activePerson.name}` : '']
      }), loading ? /*#__PURE__*/_jsx(ActivityIndicator, {
        color: colors.forestDeep,
        style: {
          marginTop: spacing.xl
        }
      }) : reports.length === 0 ? /*#__PURE__*/_jsx(View, {
        style: styles.empty,
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.emptyText,
          children: "No lab reports yet. Upload one above."
        })
      }) : reports.map(r => {
        const date = r.report_date ?? new Date(r.created_at).toLocaleDateString('en-CA', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const count = r.extracted_data?.tests?.length ?? 0;
        const abnormal = r.extracted_data?.tests?.filter(t => t.flag && t.flag !== 'normal').length ?? 0;
        return /*#__PURE__*/_jsxs(TouchableOpacity, {
          style: styles.reportCard,
          onPress: () => navigation.navigate('LabResults', {
            person: activePerson
          }),
          activeOpacity: 0.85,
          children: [/*#__PURE__*/_jsxs(View, {
            style: {
              flex: 1
            },
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.reportDate,
              children: date
            }), r.extracted_data?.lab_name && /*#__PURE__*/_jsx(Text, {
              style: styles.reportLab,
              children: r.extracted_data.lab_name
            }), /*#__PURE__*/_jsxs(Text, {
              style: styles.reportCount,
              children: [count, " result", count !== 1 ? 's' : '', abnormal > 0 ? ` · ${abnormal} out of range` : '']
            })]
          }), abnormal > 0 && /*#__PURE__*/_jsx(View, {
            style: styles.alertDot
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.cardChevron,
            children: "\u203A"
          })]
        }, r.id);
      })]
    }), /*#__PURE__*/_jsx(TabBar, {
      active: 2,
      navigation: navigation,
      params: activePerson ? {
        person: activePerson
      } : undefined
    })]
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm
  },
  topTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.forestDeep,
    letterSpacing: -0.6
  },
  switcher: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 8
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  chipActive: {
    backgroundColor: colors.forestDeep,
    borderColor: colors.forestDeep
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink
  },
  chipTextActive: {
    color: '#fff'
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120
  },
  uploadCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.xl
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.sageSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.1
  },
  uploadSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2
  },
  uploadArrow: {
    fontSize: 20,
    color: colors.muted,
    fontWeight: '300'
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.forestDeep,
    letterSpacing: -0.3,
    marginBottom: spacing.md
  },
  reportCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  reportDate: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.forestDeep,
    letterSpacing: -0.2
  },
  reportLab: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2
  },
  reportCount: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 3
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.terracotta
  },
  cardChevron: {
    fontSize: 20,
    color: colors.muted,
    fontWeight: '300'
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xl
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center'
  }
});