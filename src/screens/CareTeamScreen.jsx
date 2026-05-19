import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const ROLES = ['Family Doctor (GP)', 'Cardiologist', 'Endocrinologist', 'Neurologist', 'Oncologist', 'Pharmacist', 'Physiotherapist', 'Nurse', 'Specialist', 'Other'];
const DOCTOR_ROLES = new Set(['Family Doctor (GP)', 'Cardiologist', 'Endocrinologist', 'Neurologist', 'Oncologist', 'Specialist']);
function formatName(name, role) {
  const trimmed = name.trim();
  if (!DOCTOR_ROLES.has(role)) return trimmed;
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}
function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}
function emptyForm() {
  return {
    name: '',
    role: '',
    phone: '',
    location: '',
    notes: ''
  };
}
const NOMINATIM_HEADERS = {
  'User-Agent': 'CareCircle/1.0 (carecircle-app)'
};
async function nominatimSearch(query) {
  const q = encodeURIComponent(query);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=ca&format=json&limit=10&addressdetails=1`, {
    headers: NOMINATIM_HEADERS
  });
  if (!res.ok) return [];
  return res.json();
}
async function fetchFacilityNames(query) {
  if (query.length < 2) return [];
  try {
    const json = await nominatimSearch(query);
    const seen = new Set();
    return json.map(r => {
      const name = r.name || r.display_name.split(',')[0].trim();
      const city = r.address?.city ?? r.address?.town ?? r.address?.village ?? '';
      return city ? `${name}, ${city}` : name;
    }).filter(n => n && !seen.has(n) && seen.add(n)).slice(0, 7);
  } catch {
    return [];
  }
}
export default function CareTeamScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const personId = person?.id;
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const locationTimer = useRef(null);
  const load = useCallback(async () => {
    if (!personId) {
      setLoading(false);
      return;
    }
    const {
      data,
      error
    } = await supabase.from('care_team').select('*').eq('person_id', personId).order('created_at', {
      ascending: true
    });
    if (!error && data) setTeam(data);
    setLoading(false);
  }, [personId]);
  useEffect(() => {
    load();
  }, [load]);
  const openAdd = (defaultRole = '') => {
    setEditingMember(null);
    setForm({
      ...emptyForm(),
      role: defaultRole
    });
    setLocationSuggestions([]);
    setShowModal(true);
  };
  const openEdit = member => {
    setEditingMember(member);
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone ?? '',
      location: member.location ?? '',
      notes: member.notes ?? ''
    });
    setLocationSuggestions([]);
    setShowModal(true);
  };
  const handleLocationChange = text => {
    setForm(f => ({
      ...f,
      location: text
    }));
    setLocationSuggestions([]);
    if (locationTimer.current) clearTimeout(locationTimer.current);
    if (text.length < 2) return;
    setSearchingLocation(true);
    locationTimer.current = setTimeout(async () => {
      const results = await fetchFacilityNames(text);
      setLocationSuggestions(results);
      setSearchingLocation(false);
    }, 400);
  };
  const handleSave = async () => {
    if (!form.name.trim() || !form.role) return;
    setSaving(true);
    try {
      const payload = {
        name: formatName(form.name, form.role),
        role: form.role,
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        notes: form.notes.trim() || null
      };
      if (editingMember) {
        const {
          error
        } = await supabase.from('care_team').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        setTeam(prev => prev.map(m => m.id === editingMember.id ? {
          ...m,
          ...payload
        } : m));
      } else {
        const {
          data,
          error
        } = await supabase.from('care_team').insert({
          ...payload,
          person_id: personId
        }).select().single();
        if (error) throw error;
        if (data) setTeam(prev => [...prev, data]);
      }
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', e.message ?? JSON.stringify(e));
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = member => {
    Alert.alert('Remove member', `Remove "${member.name}" from the care team?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const {
          error
        } = await supabase.from('care_team').delete().eq('id', member.id);
        if (error) Alert.alert('Error', error.message);else setTeam(prev => prev.filter(m => m.id !== member.id));
      }
    }]);
  };
  const canSave = !!form.name.trim() && !!form.role;
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
          children: "Care Team"
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
    }) : /*#__PURE__*/_jsx(ScrollView, {
      contentContainerStyle: styles.container,
      children: team.length === 0 ? /*#__PURE__*/_jsxs(Card, {
        style: styles.empty,
        variant: "outlined",
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.emptyEmoji,
          children: "\uD83E\uDE7A"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyTitle,
          children: "No care team members"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyText,
          children: "Add doctors, specialists, and other healthcare providers."
        }), /*#__PURE__*/_jsx(Button, {
          label: "Add member",
          onPress: () => openAdd(),
          variant: "outline",
          style: {
            marginTop: spacing.md
          }
        })]
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.sectionTitle,
          children: "Care team members"
        }), team.map(member => /*#__PURE__*/_jsxs(Card, {
          style: styles.memberCard,
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.memberHeader,
            children: [/*#__PURE__*/_jsx(View, {
              style: styles.avatar,
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.avatarText,
                children: initials(member.name)
              })
            }), /*#__PURE__*/_jsxs(View, {
              style: styles.memberInfo,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.memberName,
                children: member.name
              }), /*#__PURE__*/_jsx(Text, {
                style: styles.memberRole,
                children: member.role
              }), member.location ? /*#__PURE__*/_jsx(Text, {
                style: styles.memberLocation,
                children: member.location
              }) : null, member.notes ? /*#__PURE__*/_jsx(Text, {
                style: styles.memberNotes,
                children: member.notes
              }) : null]
            })]
          }), /*#__PURE__*/_jsxs(View, {
            style: styles.cardActions,
            children: [/*#__PURE__*/_jsxs(View, {
              style: styles.cardActionsLeft,
              children: [member.phone ? /*#__PURE__*/_jsxs(Text, {
                style: styles.phoneText,
                children: ["\uD83D\uDCDE ", member.phone]
              }) : null, /*#__PURE__*/_jsx(TouchableOpacity, {
                onPress: () => openEdit(member),
                children: /*#__PURE__*/_jsx(Text, {
                  style: styles.actionText,
                  children: "Edit"
                })
              })]
            }), /*#__PURE__*/_jsx(TouchableOpacity, {
              style: styles.deleteBtn,
              onPress: () => handleDelete(member),
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.deleteBtnText,
                children: "Delete"
              })
            })]
          })]
        }, member.id))]
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
            children: editingMember ? 'Edit Member' : 'Add Care Team Member'
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
            children: "ROLE"
          }), /*#__PURE__*/_jsx(ScrollView, {
            horizontal: true,
            showsHorizontalScrollIndicator: false,
            style: {
              marginBottom: spacing.lg
            },
            children: /*#__PURE__*/_jsx(View, {
              style: styles.roleChips,
              children: ROLES.map(r => /*#__PURE__*/_jsx(TouchableOpacity, {
                style: [styles.roleChip, form.role === r && styles.roleChipActive],
                onPress: () => setForm(f => ({
                  ...f,
                  role: r
                })),
                children: /*#__PURE__*/_jsx(Text, {
                  style: [styles.roleChipText, form.role === r && styles.roleChipTextActive],
                  children: r
                })
              }, r))
            })
          }), /*#__PURE__*/_jsx(Input, {
            label: "Full name",
            placeholder: "e.g. Jane Smith",
            value: form.name,
            onChangeText: t => setForm(f => ({
              ...f,
              name: t
            }))
          }), /*#__PURE__*/_jsx(Input, {
            label: "Phone number",
            placeholder: "e.g. 416-555-0101",
            value: form.phone,
            onChangeText: t => setForm(f => ({
              ...f,
              phone: t
            })),
            keyboardType: "phone-pad",
            optional: true
          }), /*#__PURE__*/_jsx(Input, {
            label: "Clinic or hospital",
            placeholder: "e.g. Sunnybrook Medical",
            value: form.location,
            onChangeText: handleLocationChange,
            optional: true
          }), searchingLocation && /*#__PURE__*/_jsx(ActivityIndicator, {
            size: "small",
            color: colors.primary,
            style: styles.searchSpinner
          }), locationSuggestions.length > 0 && /*#__PURE__*/_jsx(View, {
            style: styles.suggestionBox,
            children: locationSuggestions.map((s, i) => /*#__PURE__*/_jsx(TouchableOpacity, {
              style: [styles.suggestionRow, i < locationSuggestions.length - 1 && styles.suggestionBorder],
              onPress: () => {
                setForm(f => ({
                  ...f,
                  location: s
                }));
                setLocationSuggestions([]);
              },
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.suggestionText,
                children: s
              })
            }, i))
          }), /*#__PURE__*/_jsx(Input, {
            label: "Notes",
            placeholder: "e.g. Sees patient every 6 months",
            value: form.notes,
            onChangeText: t => setForm(f => ({
              ...f,
              notes: t
            })),
            optional: true
          }), /*#__PURE__*/_jsx(Button, {
            label: saving ? 'Saving…' : editingMember ? 'Save Changes' : 'Add to Care Team',
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
    marginBottom: spacing.sm
  },
  memberCard: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  memberHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700'
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    ...typography.h4,
    color: colors.text
  },
  memberRole: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2
  },
  memberLocation: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 1
  },
  memberNotes: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
    fontStyle: 'italic'
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  cardActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  phoneText: {
    ...typography.bodySmall,
    color: colors.primary
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
  roleChips: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.successLight
  },
  roleChipText: {
    ...typography.body,
    color: colors.textSecondary
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: '600'
  },
  searchSpinner: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  suggestionRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  suggestionText: {
    ...typography.body,
    color: colors.text
  }
});