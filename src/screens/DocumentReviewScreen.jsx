import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, fonts, typography, radius } from '../theme';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// ─── Prescription review ──────────────────────────────────

function MedRow({
  med,
  index,
  onChange,
  onRemove
}) {
  return /*#__PURE__*/_jsxs(View, {
    style: styles.medRow,
    children: [/*#__PURE__*/_jsxs(View, {
      style: styles.medRowHeader,
      children: [/*#__PURE__*/_jsx(Text, {
        style: styles.medRowTitle,
        children: med.name || `Medication ${index + 1}`
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: () => onRemove(index),
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.removeBtn,
          children: "Remove"
        })
      })]
    }), [{
      field: 'name',
      label: 'Medication name',
      placeholder: 'e.g. Metoprolol'
    }, {
      field: 'brand',
      label: 'Brand name',
      placeholder: 'Optional'
    }, {
      field: 'dose',
      label: 'Dose',
      placeholder: 'e.g. 50mg'
    }, {
      field: 'frequency',
      label: 'Frequency',
      placeholder: 'e.g. Once daily'
    }, {
      field: 'prescriber',
      label: 'Prescriber',
      placeholder: 'e.g. Dr. Patel'
    }, {
      field: 'start_date',
      label: 'Date',
      placeholder: 'e.g. May 10, 2026'
    }].map(({
      field,
      label,
      placeholder
    }) => /*#__PURE__*/_jsxs(View, {
      style: styles.fieldWrap,
      children: [/*#__PURE__*/_jsx(Text, {
        style: styles.fieldLabel,
        children: label.toUpperCase()
      }), /*#__PURE__*/_jsx(TextInput, {
        style: styles.fieldInput,
        value: med[field] ?? '',
        onChangeText: v => onChange(index, field, v),
        placeholder: placeholder,
        placeholderTextColor: colors.muted
      })]
    }, field))]
  });
}

// ─── Lab result row ───────────────────────────────────────

const FLAG_COLORS = {
  high: colors.terracotta,
  low: colors.terracotta,
  critical: '#C0392B',
  normal: colors.sage
};
function TestRow({
  test,
  index,
  onChange
}) {
  const flagColor = FLAG_COLORS[test.flag ?? 'normal'] ?? colors.muted;
  return /*#__PURE__*/_jsxs(View, {
    style: styles.testRow,
    children: [/*#__PURE__*/_jsxs(View, {
      style: styles.testRowTop,
      children: [/*#__PURE__*/_jsx(Text, {
        style: styles.testName,
        children: test.name
      }), test.flag && test.flag !== 'normal' && /*#__PURE__*/_jsx(View, {
        style: [styles.flagBadge, {
          backgroundColor: flagColor + '22',
          borderColor: flagColor
        }],
        children: /*#__PURE__*/_jsx(Text, {
          style: [styles.flagText, {
            color: flagColor
          }],
          children: test.flag.toUpperCase()
        })
      })]
    }), /*#__PURE__*/_jsx(View, {
      style: styles.testRowFields,
      children: [{
        field: 'name',
        label: 'Test name'
      }, {
        field: 'value',
        label: 'Result'
      }, {
        field: 'unit',
        label: 'Unit'
      }, {
        field: 'reference_range',
        label: 'Normal range'
      }].map(({
        field,
        label
      }) => /*#__PURE__*/_jsxs(View, {
        style: styles.testFieldWrap,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.fieldLabel,
          children: label.toUpperCase()
        }), /*#__PURE__*/_jsx(TextInput, {
          style: styles.fieldInputCompact,
          value: test[field] ?? '',
          onChangeText: v => onChange(index, field, v),
          placeholder: "\u2014",
          placeholderTextColor: colors.muted
        })]
      }, field))
    })]
  });
}

// ─── Main screen ──────────────────────────────────────────

export default function DocumentReviewScreen({
  navigation,
  route
}) {
  const {
    person,
    docKind,
    extracted,
    filename
  } = route?.params ?? {};
  const personId = person?.id;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Prescription state
  const [meds, setMeds] = useState(docKind === 'prescription' ? extracted ?? [] : []);

  // Lab report state
  const initLab = docKind === 'lab_report' ? extracted : null;
  const [collectionDate, setCollectionDate] = useState(initLab?.collection_date ?? '');
  const [labName, setLabName] = useState(initLab?.lab_name ?? '');
  const [tests, setTests] = useState(initLab?.tests ?? []);
  const updateMed = (idx, field, value) => {
    setMeds(prev => prev.map((m, i) => i === idx ? {
      ...m,
      [field]: value
    } : m));
  };
  const removeMed = idx => {
    setMeds(prev => prev.filter((_, i) => i !== idx));
  };
  const updateTest = (idx, field, value) => {
    setTests(prev => prev.map((t, i) => i === idx ? {
      ...t,
      [field]: value
    } : t));
  };
  const savePrescription = async () => {
    const valid = meds.filter(m => m.name?.trim());
    if (!valid.length) {
      Alert.alert('No medications to save');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const rows = valid.map(m => ({
        person_id: personId,
        name: m.name.trim(),
        brand: m.brand?.trim() || null,
        dose: m.dose?.trim() || null,
        frequency: m.frequency?.trim() || null,
        prescriber: m.prescriber?.trim() || null,
        start_date: m.start_date?.trim() || null,
        active: true
      }));
      const {
        error
      } = await supabase.from('medications').insert(rows);
      if (error) throw error;
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Dashboard'
        }]
      });
    } catch (e) {
      setSaveError(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };
  const saveLabReport = async () => {
    const validTests = tests.filter(t => t.name?.trim() && t.value?.trim());
    if (!validTests.length) {
      Alert.alert('No test results to save');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      const extractedData = {
        collection_date: collectionDate || undefined,
        lab_name: labName || undefined,
        tests: validTests
      };
      const {
        error
      } = await supabase.from('lab_results').insert({
        person_id: personId,
        user_id: user?.id,
        report_date: collectionDate || null,
        source_filename: filename ?? null,
        extracted_data: extractedData
      });
      if (error) throw error;
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Dashboard'
        }]
      });
    } catch (e) {
      setSaveError(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };
  const handleSave = docKind === 'prescription' ? savePrescription : saveLabReport;
  const saveLabel = docKind === 'prescription' ? `Save ${meds.filter(m => m.name?.trim()).length} medication${meds.length !== 1 ? 's' : ''} to profile` : `Save ${tests.filter(t => t.name?.trim() && t.value?.trim()).length} results to profile`;
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
      }), /*#__PURE__*/_jsx(Text, {
        style: styles.topTitle,
        children: docKind === 'prescription' ? 'Review prescription' : 'Review lab report'
      }), /*#__PURE__*/_jsx(View, {
        style: {
          width: 60
        }
      })]
    }), /*#__PURE__*/_jsxs(ScrollView, {
      contentContainerStyle: styles.content,
      showsVerticalScrollIndicator: false,
      keyboardShouldPersistTaps: "handled",
      children: [/*#__PURE__*/_jsxs(View, {
        style: styles.banner,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.bannerTitle,
          children: "AI extracted the following"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.bannerSub,
          children: "Review and correct before saving. Wrong fields? Edit them now."
        })]
      }), docKind === 'prescription' ? /*#__PURE__*/_jsx(_Fragment, {
        children: meds.length === 0 ? /*#__PURE__*/_jsx(View, {
          style: styles.empty,
          children: /*#__PURE__*/_jsx(Text, {
            style: styles.emptyText,
            children: "No medications were extracted. Go back and try a clearer photo."
          })
        }) : meds.map((med, idx) => /*#__PURE__*/_jsx(MedRow, {
          med: med,
          index: idx,
          onChange: updateMed,
          onRemove: removeMed
        }, idx))
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsxs(View, {
          style: styles.labMeta,
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.fieldWrap,
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.fieldLabel,
              children: "COLLECTION DATE"
            }), /*#__PURE__*/_jsx(TextInput, {
              style: styles.fieldInput,
              value: collectionDate,
              onChangeText: setCollectionDate,
              placeholder: "e.g. May 10, 2026",
              placeholderTextColor: colors.muted
            })]
          }), /*#__PURE__*/_jsxs(View, {
            style: styles.fieldWrap,
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.fieldLabel,
              children: "LAB / HOSPITAL"
            }), /*#__PURE__*/_jsx(TextInput, {
              style: styles.fieldInput,
              value: labName,
              onChangeText: setLabName,
              placeholder: "e.g. LifeLabs",
              placeholderTextColor: colors.muted
            })]
          })]
        }), /*#__PURE__*/_jsxs(Text, {
          style: styles.resultCount,
          children: [tests.length, " test result", tests.length !== 1 ? 's' : '', " found"]
        }), tests.map((test, idx) => /*#__PURE__*/_jsx(TestRow, {
          test: test,
          index: idx,
          onChange: updateTest
        }, idx))]
      }), saveError && /*#__PURE__*/_jsxs(View, {
        style: styles.errorBox,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.errorTitle,
          children: "Could not save"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.errorMsg,
          children: saveError
        })]
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        style: [styles.saveBtn, saving && {
          opacity: 0.6
        }],
        onPress: handleSave,
        disabled: saving,
        activeOpacity: 0.85,
        children: saving ? /*#__PURE__*/_jsx(ActivityIndicator, {
          color: "#fff"
        }) : /*#__PURE__*/_jsx(Text, {
          style: styles.saveBtnText,
          children: saveLabel
        })
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        style: styles.discardBtn,
        onPress: () => navigation.navigate('Dashboard'),
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.discardBtnText,
          children: "Discard and go back"
        })
      })]
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
  content: {
    padding: spacing.lg,
    paddingBottom: 60
  },
  banner: {
    backgroundColor: colors.sageSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestDeep,
    letterSpacing: -0.1
  },
  bannerSub: {
    fontSize: 12,
    color: colors.forest,
    marginTop: 3,
    lineHeight: 17
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center'
  },
  medRow: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  medRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  medRowTitle: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.forestDeep,
    flex: 1
  },
  removeBtn: {
    fontSize: 12,
    color: colors.terracotta,
    fontWeight: '600'
  },
  labMeta: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  resultCount: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.md
  },
  testRow: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  testRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  testName: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.forestDeep,
    flex: 1
  },
  flagBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  flagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  testRowFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  testFieldWrap: {
    width: '47%'
  },
  fieldWrap: {
    marginBottom: spacing.sm
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.cream
  },
  fieldInputCompact: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.cream
  },
  errorBox: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#C0392B22'
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C0392B',
    marginBottom: 4
  },
  errorMsg: {
    fontSize: 12,
    color: '#7B1B1B',
    lineHeight: 17
  },
  saveBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.forestDeep,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1
  },
  discardBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.md
  },
  discardBtnText: {
    fontSize: 13,
    color: colors.muted
  }
});