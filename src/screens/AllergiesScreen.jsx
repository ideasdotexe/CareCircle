import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ALLERGY_TYPES = ['Food', 'Medication', 'Environmental', 'Other'];
const SEVERITY = ['Mild', 'Moderate', 'Severe', 'Anaphylactic'];
const SEVERITY_COLORS = {
  Mild: '#74C69D',
  Moderate: '#F4A261',
  Severe: '#E76F51',
  Anaphylactic: '#D62828'
};
const COMMON_ALLERGENS = {
  Food: ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Wheat / Gluten', 'Soy', 'Fish', 'Shellfish', 'Sesame'],
  Medication: ['Penicillin', 'Amoxicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine', 'Latex'],
  Environmental: ['Pollen', 'Dust mites', 'Pet dander', 'Mold', 'Cockroach', 'Grass', 'Ragweed'],
  Other: ['Latex', 'Nickel', 'Fragrance', 'Insect stings', 'Sunscreen']
};
function resetForm() {
  return {
    name: '',
    type: 'Food',
    severity: '',
    reaction: ''
  };
}
export default function AllergiesScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const personId = person?.id;
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [form, setForm] = useState(resetForm());
  const load = useCallback(async () => {
    if (!personId) {
      setLoading(false);
      return;
    }
    const {
      data,
      error
    } = await supabase.from('allergies').select('*').eq('person_id', personId).order('created_at', {
      ascending: true
    });
    if (!error && data) setAllergies(data);
    setLoading(false);
  }, [personId]);
  useEffect(() => {
    load();
  }, [load]);
  const openAdd = defaultType => {
    setEditingAllergy(null);
    setForm({
      ...resetForm(),
      type: defaultType ?? 'Food'
    });
    setShowModal(true);
  };
  const openEdit = allergy => {
    setEditingAllergy(allergy);
    setForm({
      name: allergy.name,
      type: allergy.type,
      severity: allergy.severity ?? '',
      reaction: allergy.reaction ?? ''
    });
    setShowModal(true);
  };
  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (!personId) {
      Alert.alert('Error', 'No person selected. Go back and open this screen from a profile.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        severity: form.severity || null,
        reaction: form.reaction.trim() || null
      };
      if (editingAllergy) {
        const {
          error
        } = await supabase.from('allergies').update(payload).eq('id', editingAllergy.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from('allergies').insert({
          ...payload,
          person_id: personId
        });
        if (error) throw error;
      }
      setShowModal(false);
      load();
    } catch (e) {
      const msg = e?.message ?? e?.details ?? JSON.stringify(e) ?? 'Could not save allergy.';
      Alert.alert('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = allergy => {
    Alert.alert('Remove allergy', `Remove "${allergy.name}"?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Remove',
      style: 'destructive',
      onPress: async () => {
        await supabase.from('allergies').delete().eq('id', allergy.id);
        load();
      }
    }]);
  };
  const grouped = ALLERGY_TYPES.reduce((acc, t) => {
    acc[t] = allergies.filter(a => a.type === t);
    return acc;
  }, {
    Food: [],
    Medication: [],
    Environmental: [],
    Other: []
  });
  const canSave = !!form.name.trim();
  const suggestions = COMMON_ALLERGENS[form.type].filter(s => s.toLowerCase().includes(form.name.toLowerCase()) && !allergies.find(a => a.name.toLowerCase() === s.toLowerCase() && a.id !== editingAllergy?.id));
  const showSuggestions = form.name.length > 0 && suggestions.length > 0;
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
          style: styles.topBarTitle,
          children: "Allergies"
        }), person?.name ? /*#__PURE__*/_jsx(Text, {
          style: styles.topBarSub,
          children: person.name
        }) : null]
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: () => openAdd(),
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.addBtn,
          children: "+ Add"
        })
      })]
    }), loading ? /*#__PURE__*/_jsx(ActivityIndicator, {
      style: {
        flex: 1
      },
      color: colors.primary
    }) : /*#__PURE__*/_jsxs(ScrollView, {
      contentContainerStyle: styles.container,
      children: [/*#__PURE__*/_jsxs(View, {
        style: styles.criticalBanner,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.criticalIcon,
          children: "\uD83D\uDEA8"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.criticalText,
          children: "Allergies are visible to all shared care team members at the top of the profile."
        })]
      }), allergies.length === 0 ? /*#__PURE__*/_jsxs(Card, {
        style: styles.empty,
        variant: "outlined",
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.emptyEmoji,
          children: "\u26A0\uFE0F"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyTitle,
          children: "No allergies recorded"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyText,
          children: "Add any known food, medication, or environmental allergies."
        }), /*#__PURE__*/_jsx(Button, {
          label: "Add allergy",
          onPress: () => openAdd(),
          variant: "outline",
          style: {
            marginTop: spacing.md
          }
        })]
      }) : ALLERGY_TYPES.map(type => {
        const list = grouped[type];
        if (list.length === 0) return null;
        return /*#__PURE__*/_jsxs(View, {
          style: {
            marginBottom: spacing.lg
          },
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.sectionRow,
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.sectionTitle,
              children: type
            }), /*#__PURE__*/_jsx(TouchableOpacity, {
              onPress: () => openAdd(type),
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.sectionAdd,
                children: "+ Add"
              })
            })]
          }), list.map(a => /*#__PURE__*/_jsxs(Card, {
            style: styles.allergyCard,
            children: [/*#__PURE__*/_jsxs(View, {
              style: styles.allergyHeader,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.allergyName,
                children: a.name
              }), a.severity ? /*#__PURE__*/_jsx(View, {
                style: [styles.severityBadge, {
                  backgroundColor: SEVERITY_COLORS[a.severity] + '22'
                }],
                children: /*#__PURE__*/_jsx(Text, {
                  style: [styles.severityText, {
                    color: SEVERITY_COLORS[a.severity]
                  }],
                  children: a.severity
                })
              }) : null]
            }), a.reaction ? /*#__PURE__*/_jsxs(Text, {
              style: styles.allergyReaction,
              children: ["Reaction: ", a.reaction]
            }) : null, /*#__PURE__*/_jsxs(View, {
              style: styles.allergyActions,
              children: [/*#__PURE__*/_jsx(TouchableOpacity, {
                onPress: () => openEdit(a),
                children: /*#__PURE__*/_jsx(Text, {
                  style: styles.actionText,
                  children: "Edit"
                })
              }), /*#__PURE__*/_jsx(TouchableOpacity, {
                onPress: () => handleDelete(a),
                children: /*#__PURE__*/_jsx(Text, {
                  style: [styles.actionText, {
                    color: colors.error
                  }],
                  children: "Remove"
                })
              })]
            })]
          }, a.id))]
        }, type);
      }), allergies.length > 0 && /*#__PURE__*/_jsxs(View, {
        style: styles.typeSection,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.sectionTitle,
          children: "Add by category"
        }), ALLERGY_TYPES.map(type => /*#__PURE__*/_jsxs(TouchableOpacity, {
          style: styles.typeRow,
          onPress: () => openAdd(type),
          children: [/*#__PURE__*/_jsx(Text, {
            style: styles.typeText,
            children: type
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.typeAdd,
            children: "+ Add"
          })]
        }, type))]
      })]
    }), /*#__PURE__*/_jsx(Modal, {
      visible: showModal,
      animationType: "slide",
      presentationStyle: "pageSheet",
      children: /*#__PURE__*/_jsxs(SafeAreaView, {
        style: styles.modalSafe,
        children: [/*#__PURE__*/_jsxs(View, {
          style: styles.modalHeader,
          children: [/*#__PURE__*/_jsx(TouchableOpacity, {
            onPress: () => setShowModal(false),
            children: /*#__PURE__*/_jsx(Text, {
              style: styles.modalCancel,
              children: "Cancel"
            })
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.modalTitle,
            children: editingAllergy ? 'Edit Allergy' : 'Add Allergy'
          }), /*#__PURE__*/_jsx(TouchableOpacity, {
            onPress: handleSave,
            disabled: !canSave || saving,
            children: /*#__PURE__*/_jsx(Text, {
              style: [styles.modalDone, (!canSave || saving) && {
                opacity: 0.3
              }],
              children: saving ? 'Saving…' : 'Done'
            })
          })]
        }), /*#__PURE__*/_jsxs(ScrollView, {
          contentContainerStyle: styles.modalContent,
          keyboardShouldPersistTaps: "handled",
          children: [/*#__PURE__*/_jsx(Text, {
            style: styles.fieldLabel,
            children: "TYPE"
          }), /*#__PURE__*/_jsx(View, {
            style: styles.typeChips,
            children: ALLERGY_TYPES.map(t => /*#__PURE__*/_jsx(TouchableOpacity, {
              style: [styles.typeChip, form.type === t && styles.typeChipSelected],
              onPress: () => setForm(f => ({
                ...f,
                type: t,
                name: ''
              })),
              children: /*#__PURE__*/_jsx(Text, {
                style: [styles.typeChipText, form.type === t && styles.typeChipTextSelected],
                children: t
              })
            }, t))
          }), /*#__PURE__*/_jsx(Input, {
            label: "Allergen name",
            placeholder: `e.g. ${COMMON_ALLERGENS[form.type][0]}`,
            value: form.name,
            onChangeText: t => setForm(f => ({
              ...f,
              name: t
            }))
          }), showSuggestions && /*#__PURE__*/_jsx(View, {
            style: styles.suggestions,
            children: suggestions.slice(0, 5).map(s => /*#__PURE__*/_jsx(TouchableOpacity, {
              style: styles.suggestionRow,
              onPress: () => setForm(f => ({
                ...f,
                name: s
              })),
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.suggestionText,
                children: s
              })
            }, s))
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.fieldLabel,
            children: "SEVERITY"
          }), /*#__PURE__*/_jsx(View, {
            style: styles.severityRow,
            children: SEVERITY.map(s => /*#__PURE__*/_jsx(TouchableOpacity, {
              style: [styles.severityChip, form.severity === s && {
                backgroundColor: SEVERITY_COLORS[s] + '22',
                borderColor: SEVERITY_COLORS[s]
              }],
              onPress: () => setForm(f => ({
                ...f,
                severity: f.severity === s ? '' : s
              })),
              children: /*#__PURE__*/_jsx(Text, {
                style: [styles.severityChipText, form.severity === s && {
                  color: SEVERITY_COLORS[s],
                  fontWeight: '600'
                }],
                children: s
              })
            }, s))
          }), /*#__PURE__*/_jsx(Input, {
            label: "Reaction",
            placeholder: "Describe the reaction",
            value: form.reaction,
            onChangeText: t => setForm(f => ({
              ...f,
              reaction: t
            })),
            optional: true
          }), /*#__PURE__*/_jsx(Button, {
            label: saving ? 'Saving…' : editingAllergy ? 'Save Changes' : 'Add Allergy',
            onPress: handleSave,
            disabled: !canSave || saving
          })]
        })]
      })
    })]
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface
  },
  back: {
    ...typography.body,
    color: colors.primary
  },
  topBarTitle: {
    ...typography.h3,
    color: colors.text
  },
  topBarSub: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 1
  },
  addBtn: {
    ...typography.h4,
    color: colors.primary
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  criticalBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error
  },
  criticalIcon: {
    fontSize: 20
  },
  criticalText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
    lineHeight: 20
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center'
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text
  },
  sectionAdd: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600'
  },
  allergyCard: {
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  allergyName: {
    ...typography.h4,
    color: colors.text,
    flex: 1
  },
  severityBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  severityText: {
    ...typography.caption,
    fontWeight: '700'
  },
  allergyReaction: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  allergyActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600'
  },
  typeSection: {
    marginTop: spacing.sm
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  typeText: {
    ...typography.body,
    color: colors.text
  },
  typeAdd: {
    ...typography.bodySmall,
    color: colors.primary
  },
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalCancel: {
    ...typography.body,
    color: colors.textSecondary
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text
  },
  modalDone: {
    ...typography.h4,
    color: colors.primary
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  typeChipSelected: {
    backgroundColor: colors.successLight,
    borderColor: colors.primary
  },
  typeChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary
  },
  typeChipTextSelected: {
    color: colors.primary,
    fontWeight: '600'
  },
  suggestions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  suggestionRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  suggestionText: {
    ...typography.body,
    color: colors.text
  },
  severityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  severityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  severityChipText: {
    ...typography.body,
    color: colors.textSecondary
  }
});