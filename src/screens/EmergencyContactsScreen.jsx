import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const CONTACT_CHANNELS = ['Phone call', 'Text message', 'Email', 'WhatsApp'];
function emptyForm() {
  return {
    name: '',
    relation: '',
    phone: '',
    email: '',
    preferred_channel: ''
  };
}
export default function EmergencyContactsScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const personId = person?.id;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const load = useCallback(async () => {
    if (!personId) {
      setLoading(false);
      return;
    }
    const {
      data,
      error
    } = await supabase.from('emergency_contacts').select('*').eq('person_id', personId).order('created_at', {
      ascending: true
    });
    if (!error && data) setContacts(data);
    setLoading(false);
  }, [personId]);
  useEffect(() => {
    load();
  }, [load]);
  const openAdd = () => {
    setEditingContact(null);
    setForm(emptyForm());
    setShowModal(true);
  };
  const openEdit = contact => {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      relation: contact.relation ?? '',
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      preferred_channel: contact.preferred_channel ?? ''
    });
    setShowModal(true);
  };
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        relation: form.relation.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        preferred_channel: form.preferred_channel || null
      };
      if (editingContact) {
        const {
          error
        } = await supabase.from('emergency_contacts').update(payload).eq('id', editingContact.id);
        if (error) throw error;
        setContacts(prev => prev.map(c => c.id === editingContact.id ? {
          ...c,
          ...payload
        } : c));
      } else {
        const {
          data,
          error
        } = await supabase.from('emergency_contacts').insert({
          ...payload,
          person_id: personId
        }).select().single();
        if (error) throw error;
        if (data) setContacts(prev => [...prev, data]);
      }
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', e.message ?? JSON.stringify(e));
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = contact => {
    Alert.alert('Remove contact', `Remove "${contact.name}" from emergency contacts?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const {
          error
        } = await supabase.from('emergency_contacts').delete().eq('id', contact.id);
        if (error) Alert.alert('Error', error.message);else setContacts(prev => prev.filter(c => c.id !== contact.id));
      }
    }]);
  };
  const canSave = !!form.name.trim();
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
          children: "Emergency Contacts"
        }), person?.name ? /*#__PURE__*/_jsx(Text, {
          style: styles.topBarSub,
          children: person.name
        }) : null]
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: openAdd,
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
        style: styles.infoBanner,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.infoIcon,
          children: "\u2139\uFE0F"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.infoText,
          children: "Emergency contacts are displayed prominently on the profile and visible to any shared care team members."
        })]
      }), contacts.length === 0 ? /*#__PURE__*/_jsxs(Card, {
        style: styles.empty,
        variant: "outlined",
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.emptyEmoji,
          children: "\uD83D\uDCDE"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyTitle,
          children: "No emergency contacts"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.emptyText,
          children: "Add family members or trusted people to contact in an emergency."
        }), /*#__PURE__*/_jsx(Button, {
          label: "Add contact",
          onPress: openAdd,
          variant: "outline",
          style: {
            marginTop: spacing.md
          }
        })]
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.sectionTitle,
          children: "Emergency contacts"
        }), contacts.map(contact => /*#__PURE__*/_jsxs(Card, {
          style: styles.contactCard,
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.contactHeader,
            children: [/*#__PURE__*/_jsx(View, {
              style: styles.avatar,
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.avatarText,
                children: contact.name[0].toUpperCase()
              })
            }), /*#__PURE__*/_jsxs(View, {
              style: styles.contactInfo,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.contactName,
                children: contact.name
              }), contact.relation ? /*#__PURE__*/_jsx(Text, {
                style: styles.contactRelation,
                children: contact.relation
              }) : null, contact.phone ? /*#__PURE__*/_jsx(Text, {
                style: styles.contactPhone,
                children: contact.phone
              }) : null, contact.email ? /*#__PURE__*/_jsx(Text, {
                style: styles.contactEmail,
                children: contact.email
              }) : null, contact.preferred_channel ? /*#__PURE__*/_jsxs(Text, {
                style: styles.contactChannel,
                children: ["Preferred: ", contact.preferred_channel]
              }) : null]
            })]
          }), /*#__PURE__*/_jsxs(View, {
            style: styles.cardActions,
            children: [/*#__PURE__*/_jsx(View, {
              style: styles.cardActionsLeft,
              children: /*#__PURE__*/_jsx(TouchableOpacity, {
                onPress: () => openEdit(contact),
                children: /*#__PURE__*/_jsx(Text, {
                  style: styles.actionText,
                  children: "Edit"
                })
              })
            }), /*#__PURE__*/_jsx(TouchableOpacity, {
              style: styles.deleteBtn,
              onPress: () => handleDelete(contact),
              children: /*#__PURE__*/_jsx(Text, {
                style: styles.deleteBtnText,
                children: "Delete"
              })
            })]
          })]
        }, contact.id))]
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
            children: editingContact ? 'Edit Contact' : 'Add Emergency Contact'
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
          children: [/*#__PURE__*/_jsx(Input, {
            label: "Full name",
            placeholder: "e.g. Priya Sharma",
            value: form.name,
            onChangeText: t => setForm(f => ({
              ...f,
              name: t
            }))
          }), /*#__PURE__*/_jsx(Input, {
            label: "Relationship",
            placeholder: "e.g. Daughter, Spouse, Sibling",
            value: form.relation,
            onChangeText: t => setForm(f => ({
              ...f,
              relation: t
            })),
            optional: true
          }), /*#__PURE__*/_jsx(Input, {
            label: "Phone number",
            placeholder: "e.g. 647-555-0192",
            value: form.phone,
            onChangeText: t => setForm(f => ({
              ...f,
              phone: t
            })),
            keyboardType: "phone-pad",
            optional: true
          }), /*#__PURE__*/_jsx(Input, {
            label: "Email",
            placeholder: "e.g. priya@example.com",
            value: form.email,
            onChangeText: t => setForm(f => ({
              ...f,
              email: t
            })),
            keyboardType: "email-address",
            optional: true
          }), /*#__PURE__*/_jsxs(Text, {
            style: styles.fieldLabel,
            children: ["PREFERRED CONTACT METHOD ", /*#__PURE__*/_jsx(Text, {
              style: styles.optionalTag,
              children: "(optional)"
            })]
          }), /*#__PURE__*/_jsx(View, {
            style: styles.channelGrid,
            children: CONTACT_CHANNELS.map(ch => /*#__PURE__*/_jsx(TouchableOpacity, {
              style: [styles.channelChip, form.preferred_channel === ch && styles.channelChipActive],
              onPress: () => setForm(f => ({
                ...f,
                preferred_channel: f.preferred_channel === ch ? '' : ch
              })),
              children: /*#__PURE__*/_jsx(Text, {
                style: [styles.channelText, form.preferred_channel === ch && styles.channelTextActive],
                children: ch
              })
            }, ch))
          }), /*#__PURE__*/_jsx(Button, {
            label: saving ? 'Saving…' : editingContact ? 'Save Changes' : 'Add Contact',
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
    paddingBottom: spacing.xxl,
    gap: spacing.md
  },
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md
  },
  infoIcon: {
    fontSize: 18
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text
  },
  contactCard: {
    padding: spacing.md
  },
  contactHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700'
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    ...typography.h4,
    color: colors.text
  },
  contactRelation: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2
  },
  contactPhone: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: 2
  },
  contactEmail: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 1
  },
  contactChannel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 1
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
  optionalTag: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '400',
    letterSpacing: 0
  },
  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  channelChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  channelChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.successLight
  },
  channelText: {
    ...typography.body,
    color: colors.textSecondary
  },
  channelTextActive: {
    color: colors.primary,
    fontWeight: '600'
  }
});