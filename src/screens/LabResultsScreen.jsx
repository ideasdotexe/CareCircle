import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, fonts, typography, radius } from '../theme';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const FLAG_COLOR = {
  high: colors.terracotta,
  low: colors.terracotta,
  critical: '#C0392B',
  normal: colors.sage
};
function FlagBadge({
  flag
}) {
  if (!flag || flag === 'normal') return null;
  const color = FLAG_COLOR[flag] ?? colors.muted;
  return /*#__PURE__*/_jsx(View, {
    style: [styles.flag, {
      backgroundColor: color + '22',
      borderColor: color
    }],
    children: /*#__PURE__*/_jsx(Text, {
      style: [styles.flagText, {
        color
      }],
      children: flag.toUpperCase()
    })
  });
}
function ReportCard({
  report,
  onDelete
}) {
  const [expanded, setExpanded] = useState(false);
  const data = report.extracted_data;
  const dateLabel = report.report_date ?? new Date(report.created_at).toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const abnormal = data.tests.filter(t => t.flag && t.flag !== 'normal');
  const confirmDelete = () => {
    Alert.alert('Delete report', 'Permanently delete this lab report?', [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: () => onDelete(report.id)
    }]);
  };
  return /*#__PURE__*/_jsxs(View, {
    style: styles.card,
    children: [/*#__PURE__*/_jsxs(TouchableOpacity, {
      style: styles.cardHeader,
      onPress: () => setExpanded(e => !e),
      activeOpacity: 0.8,
      children: [/*#__PURE__*/_jsxs(View, {
        style: {
          flex: 1
        },
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.cardDate,
          children: dateLabel
        }), data.lab_name ? /*#__PURE__*/_jsx(Text, {
          style: styles.cardLab,
          children: data.lab_name
        }) : null, /*#__PURE__*/_jsxs(Text, {
          style: styles.cardCount,
          children: [data.tests.length, " result", data.tests.length !== 1 ? 's' : '', abnormal.length > 0 ? ` · ${abnormal.length} out of range` : '']
        })]
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.cardRight,
        children: [abnormal.length > 0 && /*#__PURE__*/_jsx(View, {
          style: styles.alertDot
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.expandChevron,
          children: expanded ? '▲' : '▼'
        })]
      })]
    }), expanded && /*#__PURE__*/_jsxs(View, {
      style: styles.cardBody,
      children: [data.tests.map((test, i) => /*#__PURE__*/_jsxs(View, {
        style: [styles.testRow, i < data.tests.length - 1 && styles.testRowBorder],
        children: [/*#__PURE__*/_jsxs(View, {
          style: styles.testLeft,
          children: [/*#__PURE__*/_jsx(Text, {
            style: styles.testName,
            children: test.name
          }), test.reference_range && /*#__PURE__*/_jsxs(Text, {
            style: styles.testRange,
            children: ["Range: ", test.reference_range, " ", test.unit ?? '']
          })]
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.testRight,
          children: [/*#__PURE__*/_jsxs(Text, {
            style: [styles.testValue, test.flag && test.flag !== 'normal' && {
              color: FLAG_COLOR[test.flag] ?? colors.ink
            }],
            children: [test.value, test.unit ? ` ${test.unit}` : '']
          }), /*#__PURE__*/_jsx(FlagBadge, {
            flag: test.flag
          })]
        })]
      }, i)), /*#__PURE__*/_jsx(TouchableOpacity, {
        style: styles.deleteBtn,
        onPress: confirmDelete,
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.deleteBtnText,
          children: "Delete report"
        })
      })]
    })]
  });
}
export default function LabResultsScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const personId = person?.id;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!personId) {
      setLoading(false);
      return;
    }
    const {
      data,
      error
    } = await supabase.from('lab_results').select('*').eq('person_id', personId).order('created_at', {
      ascending: false
    });
    if (!error && data) setReports(data);
    setLoading(false);
  }, [personId]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);
  const handleDelete = async id => {
    const {
      error
    } = await supabase.from('lab_results').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setReports(prev => prev.filter(r => r.id !== id));
  };
  return /*#__PURE__*/_jsxs(SafeAreaView, {
    style: styles.safe,
    children: [/*#__PURE__*/_jsxs(View, {
      style: styles.topBar,
      children: [/*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: () => navigation.goBack(),
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.back,
          children: "\u2190 Back"
        })
      }), /*#__PURE__*/_jsxs(View, {
        style: {
          alignItems: 'center'
        },
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.topTitle,
          children: "Lab Results"
        }), person?.name && /*#__PURE__*/_jsx(Text, {
          style: styles.topSub,
          children: person.name
        })]
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: () => navigation.navigate('DocumentUpload', {
          person,
          defaultKind: 'lab_report'
        }),
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.addBtn,
          children: "+ Add"
        })
      })]
    }), loading ? /*#__PURE__*/_jsx(ActivityIndicator, {
      style: {
        flex: 1
      },
      color: colors.forestDeep
    }) : reports.length === 0 ? /*#__PURE__*/_jsxs(View, {
      style: styles.empty,
      children: [/*#__PURE__*/_jsx(Text, {
        style: styles.emptyTitle,
        children: "No lab reports yet"
      }), /*#__PURE__*/_jsx(Text, {
        style: styles.emptySub,
        children: "Upload a lab PDF or photo from the Documents section on your dashboard."
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        style: styles.uploadBtn,
        onPress: () => navigation.navigate('DocumentUpload', {
          person,
          defaultKind: 'lab_report'
        }),
        activeOpacity: 0.85,
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.uploadBtnText,
          children: "Upload a lab report"
        })
      })]
    }) : /*#__PURE__*/_jsx(ScrollView, {
      contentContainerStyle: styles.list,
      showsVerticalScrollIndicator: false,
      children: reports.map(r => /*#__PURE__*/_jsx(ReportCard, {
        report: r,
        onDelete: handleDelete
      }, r.id))
    })]
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white
  },
  back: {
    ...typography.body,
    color: colors.forest,
    width: 60
  },
  topTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.forestDeep,
    letterSpacing: -0.3
  },
  topSub: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 1
  },
  addBtn: {
    ...typography.h4,
    color: colors.forestDeep,
    width: 60,
    textAlign: 'right'
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 60
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm
  },
  cardDate: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.forestDeep,
    letterSpacing: -0.2
  },
  cardLab: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2
  },
  cardCount: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 4
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.terracotta
  },
  expandChevron: {
    fontSize: 10,
    color: colors.muted
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: spacing.md
  },
  testRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft
  },
  testLeft: {
    flex: 1,
    paddingRight: spacing.sm
  },
  testName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.1
  },
  testRange: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2
  },
  testRight: {
    alignItems: 'flex-end',
    gap: 4
  },
  testValue: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.forestDeep,
    fontWeight: '400'
  },
  flag: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  flagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  deleteBtn: {
    margin: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.terracottaSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.terracotta
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.forestDeep,
    letterSpacing: -0.4,
    marginBottom: spacing.sm
  },
  emptySub: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22
  },
  uploadBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.forestDeep,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  }
});