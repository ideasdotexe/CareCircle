import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const COMMON_CONDITIONS = ['Hypertension', 'Type 2 Diabetes', 'COPD', 'Heart Failure', 'Atrial Fibrillation', 'Chronic Kidney Disease', 'Osteoporosis', 'Arthritis', 'Dementia', 'Hypothyroidism', 'Depression', 'Asthma', "Parkinson's Disease", 'Stroke (history)'];
export default function ConditionsScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const personId = person?.id;
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [since, setSince] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState('');
  const load = useCallback(async () => {
    if (!personId) {
      setLoading(false);
      return;
    }
    const {
      data,
      error
    } = await supabase.from('conditions').select('*').eq('person_id', personId).order('created_at', {
      ascending: true
    });
    if (!error && data) setConditions(data);
    setLoading(false);
  }, [personId]);
  useEffect(() => {
    load();
  }, [load]);
  const openModal = () => {
    setEditingCondition(null);
    setSearch('');
    setCustomName('');
    setSince('');
    setNotes('');
    setSelected('');
    setShowModal(true);
  };
  const openEditModal = condition => {
    setEditingCondition(condition);
    const isCommon = COMMON_CONDITIONS.some(c => c.toLowerCase() === condition.name.toLowerCase());
    setSelected(isCommon ? condition.name : '');
    setCustomName(isCommon ? '' : condition.name);
    setSearch(condition.name);
    setSince(condition.since ?? '');
    setNotes(condition.notes ?? '');
    setShowModal(true);
  };
  const handleSave = async () => {
    const conditionName = (selected || customName).trim();
    if (!conditionName) return;
    setSaving(true);
    try {
      if (editingCondition) {
        const {
          error
        } = await supabase.from('conditions').update({
          name: conditionName,
          since: since.trim() || null,
          notes: notes.trim() || null
        }).eq('id', editingCondition.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from('conditions').insert({
          person_id: personId,
          name: conditionName,
          since: since.trim() || null,
          notes: notes.trim() || null,
          cured: false
        });
        if (error) throw error;
      }
      setShowModal(false);
      load();
    } catch (e) {
      Alert.alert('Error', e.message ?? 'Could not save condition.');
    } finally {
      setSaving(false);
    }
  };
  const handleMarkCured = condition => {
    Alert.alert('Mark as cured', `Mark "${condition.name}" as cured? It will move to the Previous conditions section.`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Yes, mark cured',
      onPress: async () => {
        const {
          data,
          error,
          status
        } = await supabase.from('conditions').update({
          cured: true
        }).eq('id', condition.id).select();
        console.log('[markCured]', {
          data,
          error,
          status,
          id: condition.id
        });
        if (error) {
          Alert.alert('Error', error.message ?? JSON.stringify(error));
        } else if (!data || data.length === 0) {
          Alert.alert('Not updated', `No rows matched — check RLS or the condition id.\nID: ${condition.id}`);
        } else {
          setConditions(prev => prev.map(c => c.id === condition.id ? {
            ...c,
            cured: true
          } : c));
        }
      }
    }]);
  };
  const handleMarkActive = condition => {
    Alert.alert('Mark as active', `Move "${condition.name}" back to current conditions?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Mark active',
      onPress: async () => {
        const {
          data,
          error,
          status
        } = await supabase.from('conditions').update({
          cured: false
        }).eq('id', condition.id).select();
        console.log('[markActive]', {
          data,
          error,
          status,
          id: condition.id
        });
        if (error) {
          Alert.alert('Error', error.message ?? JSON.stringify(error));
        } else {
          setConditions(prev => prev.map(c => c.id === condition.id ? {
            ...c,
            cured: false
          } : c));
        }
      }
    }]);
  };
  const handleDelete = condition => {
    Alert.alert('Delete condition', `Permanently delete "${condition.name}"? This cannot be undone.`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const {
          data,
          error,
          status
        } = await supabase.from('conditions').delete().eq('id', condition.id).select();
        console.log('[delete]', {
          data,
          error,
          status,
          id: condition.id
        });
        if (error) {
          Alert.alert('Error', error.message ?? JSON.stringify(error));
        } else if (!data || data.length === 0) {
          Alert.alert('Not deleted', `No rows matched — check RLS or the condition id.\nID: ${condition.id}`);
        } else {
          setConditions(prev => prev.filter(c => c.id !== condition.id));
        }
      }
    }]);
  };
  const active = conditions.filter(c => !c.cured);
  const cured = conditions.filter(c => c.cured);
  const filtered = COMMON_CONDITIONS.filter(c => c.toLowerCase().includes(search.toLowerCase()) && !conditions.find(ex => ex.name.toLowerCase() === c.toLowerCase() && ex.id !== editingCondition?.id));
  const canAdd = !!(selected || customName.trim());
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
          children: "Conditions"
        }), person?.name ? /*#__PURE__*/_jsx(Text, {
          style: styles.topBarSub,
          children: person.name
        }) : null]
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: openModal,
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
    }) : /*#__PURE__*/_jsx(ScrollView, {
      contentContainerStyle: styles.container,
      children: conditions.length === 0 ? /*#__PURE__*/_jsxs(Card, {
        style: styles.empty,
        variant: "outlined",
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.emptyEmoji,
          children: "\uD83E\uDEC0"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyTitle,
          children: "No conditions recorded"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyText,
          children: "Add any diagnosed conditions to keep track of health history."
        }), /*#__PURE__*/_jsx(Button, {
          label: "Add condition",
          onPress: openModal,
          variant: "outline",
          style: {
            marginTop: spacing.md
          }
        })]
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [active.length > 0 && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx(Text, {
            style: styles.sectionTitle,
            children: "Current conditions"
          }), active.map(c => /*#__PURE__*/_jsxs(Card, {
            style: styles.condCard,
            children: [/*#__PURE__*/_jsxs(View, {
              style: styles.condHeader,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.condName,
                children: c.name
              }), c.since ? /*#__PURE__*/_jsxs(Text, {
                style: styles.condSince,
                children: ["Since ", c.since]
              }) : null]
            }), c.notes ? /*#__PURE__*/_jsx(Text, {
              style: styles.condNotes,
              children: c.notes
            }) : null, /*#__PURE__*/_jsxs(View, {
              style: styles.condActions,
              children: [/*#__PURE__*/_jsxs(View, {
                style: styles.condActionsLeft,
                children: [/*#__PURE__*/_jsx(TouchableOpacity, {
                  onPress: () => openEditModal(c),
                  children: /*#__PURE__*/_jsx(Text, {
                    style: styles.actionText,
                    children: "Edit"
                  })
                }), /*#__PURE__*/_jsx(TouchableOpacity, {
                  onPress: () => handleMarkCured(c),
                  children: /*#__PURE__*/_jsx(Text, {
                    style: [styles.actionText, {
                      color: colors.success
                    }],
                    children: "Mark cured"
                  })
                })]
              }), /*#__PURE__*/_jsx(TouchableOpacity, {
                style: styles.deleteBtn,
                onPress: () => handleDelete(c),
                children: /*#__PURE__*/_jsx(Text, {
                  style: styles.deleteBtnText,
                  children: "Delete"
                })
              })]
            })]
          }, c.id))]
        }), cured.length > 0 && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx(Text, {
            style: [styles.sectionTitle, active.length > 0 && {
              marginTop: spacing.lg
            }],
            children: "Previous conditions"
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.sectionSub,
            children: "Conditions that have been resolved or cured."
          }), cured.map(c => /*#__PURE__*/_jsxs(Card, {
            style: [styles.condCard, styles.condCardCured],
            children: [/*#__PURE__*/_jsxs(View, {
              style: styles.condHeader,
              children: [/*#__PURE__*/_jsx(Text, {
                style: [styles.condName, styles.condNameCured],
                children: c.name
              }), /*#__PURE__*/_jsx(View, {
                style: styles.curedBadge,
                children: /*#__PURE__*/_jsx(Text, {
                  style: styles.curedBadgeText,
                  children: "Cured"
                })
              })]
            }), /*#__PURE__*/_jsxs(View, {
              style: styles.curedMeta,
              children: [c.since ? /*#__PURE__*/_jsxs(Text, {
                style: styles.condSince,
                children: ["Diagnosed ", c.since]
              }) : null, c.cured_year ? /*#__PURE__*/_jsxs(Text, {
                style: styles.condSince,
                children: ["  \xB7  Resolved ", c.cured_year]
              }) : null]
            }), c.notes ? /*#__PURE__*/_jsx(Text, {
              style: styles.condNotes,
              children: c.notes
            }) : null, /*#__PURE__*/_jsxs(View, {
              style: styles.condActions,
              children: [/*#__PURE__*/_jsx(View, {
                style: styles.condActionsLeft,
                children: /*#__PURE__*/_jsx(TouchableOpacity, {
                  onPress: () => handleMarkActive(c),
                  children: /*#__PURE__*/_jsx(Text, {
                    style: styles.actionText,
                    children: "Mark active"
                  })
                })
              }), /*#__PURE__*/_jsx(TouchableOpacity, {
                style: styles.deleteBtn,
                onPress: () => handleDelete(c),
                children: /*#__PURE__*/_jsx(Text, {
                  style: styles.deleteBtnText,
                  children: "Delete"
                })
              })]
            })]
          }, c.id))]
        })]
      })
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
            children: editingCondition ? 'Edit Condition' : 'Add Condition'
          }), /*#__PURE__*/_jsx(TouchableOpacity, {
            onPress: handleSave,
            disabled: !canAdd || saving,
            children: /*#__PURE__*/_jsx(Text, {
              style: [styles.modalDone, (!canAdd || saving) && {
                opacity: 0.3
              }],
              children: saving ? 'Saving…' : 'Done'
            })
          })]
        }), /*#__PURE__*/_jsxs(ScrollView, {
          contentContainerStyle: styles.modalContent,
          keyboardShouldPersistTaps: "handled",
          children: [/*#__PURE__*/_jsx(Input, {
            placeholder: "Search conditions\u2026",
            value: search,
            onChangeText: t => {
              setSearch(t);
              setSelected('');
            },
            style: styles.searchInput
          }), filtered.map(c => /*#__PURE__*/_jsxs(TouchableOpacity, {
            style: [styles.conditionOption, selected === c && styles.conditionOptionSelected],
            onPress: () => {
              setSelected(c);
              setCustomName('');
              setSearch(c);
            },
            children: [/*#__PURE__*/_jsx(Text, {
              style: [styles.conditionOptionText, selected === c && styles.conditionOptionTextSelected],
              children: c
            }), selected === c && /*#__PURE__*/_jsx(Text, {
              style: styles.checkmark,
              children: "\u2713"
            })]
          }, c)), /*#__PURE__*/_jsx(Input, {
            label: "Or describe in your own words",
            placeholder: "e.g. low back pain since surgery",
            value: customName,
            onChangeText: t => {
              setCustomName(t);
              setSelected('');
            },
            optional: true,
            style: {
              marginTop: spacing.lg
            }
          }), /*#__PURE__*/_jsx(Input, {
            label: "Year diagnosed",
            placeholder: "e.g. 2021",
            value: since,
            onChangeText: setSince,
            optional: true,
            keyboardType: "numeric"
          }), /*#__PURE__*/_jsx(Input, {
            label: "Notes",
            placeholder: "e.g. managed with Metformin",
            value: notes,
            onChangeText: setNotes,
            optional: true
          }), /*#__PURE__*/_jsx(Button, {
            label: saving ? 'Saving…' : editingCondition ? 'Save Changes' : 'Add Condition',
            onPress: handleSave,
            disabled: !canAdd || saving
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs
  },
  sectionSub: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.sm
  },
  condCard: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  condCardCured: {
    opacity: 0.75,
    backgroundColor: colors.surfaceSecondary
  },
  condHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs
  },
  condName: {
    ...typography.h4,
    color: colors.text,
    flex: 1
  },
  condNameCured: {
    color: colors.textSecondary
  },
  condSince: {
    ...typography.bodySmall,
    color: colors.textTertiary
  },
  condNotes: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  condActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  condActionsLeft: {
    flexDirection: 'row',
    gap: spacing.md
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600'
  },
  deleteBtn: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  deleteBtnText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600'
  },
  curedBadge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  curedBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700'
  },
  curedMeta: {
    flexDirection: 'row',
    marginBottom: spacing.xs
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
  searchInput: {
    marginBottom: spacing.md
  },
  conditionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  conditionOptionSelected: {
    backgroundColor: colors.successLight
  },
  conditionOptionText: {
    ...typography.body,
    color: colors.text
  },
  conditionOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600'
  },
  checkmark: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16
  }
});