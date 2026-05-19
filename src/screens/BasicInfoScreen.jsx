import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SEX_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
export default function BasicInfoScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const personId = person?.id;
  const [name, setName] = useState(person?.name ?? '');
  const [dob, setDob] = useState(person?.date_of_birth ?? '');
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [healthCard, setHealthCard] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!personId) {
      setLoading(false);
      return;
    }
    supabase.from('persons').select('name, date_of_birth, sex, weight_kg, height_cm, health_card_number').eq('id', personId).single().then(({
      data
    }) => {
      if (data) {
        setName(data.name ?? '');
        setDob(data.date_of_birth ?? '');
        setSex(data.sex ?? '');
        setWeight(data.weight_kg != null ? String(data.weight_kg) : '');
        setHeight(data.height_cm != null ? String(data.height_cm) : '');
        setHealthCard(data.health_card_number ?? '');
      }
      setLoading(false);
    });
  }, [personId]);
  const handleSave = async () => {
    if (!personId) return;
    setSaving(true);
    try {
      const {
        error
      } = await supabase.from('persons').update({
        name: name.trim(),
        date_of_birth: dob.trim() || null,
        sex: sex || null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseFloat(height) : null,
        health_card_number: healthCard.trim() || null
      }).eq('id', personId);
      if (error) throw error;
      Alert.alert('Saved', 'Basic info updated successfully.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /*#__PURE__*/_jsx(SafeAreaView, {
      style: styles.safe,
      children: /*#__PURE__*/_jsx(ActivityIndicator, {
        style: {
          flex: 1
        },
        color: colors.primary
      })
    });
  }
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
          children: "Basic Info"
        }), person?.name ? /*#__PURE__*/_jsx(Text, {
          style: styles.topBarSub,
          children: person.name
        }) : null]
      }), /*#__PURE__*/_jsx(View, {
        style: {
          width: 60
        }
      })]
    }), /*#__PURE__*/_jsx(KeyboardAvoidingView, {
      behavior: Platform.OS === 'ios' ? 'padding' : undefined,
      style: {
        flex: 1
      },
      children: /*#__PURE__*/_jsxs(ScrollView, {
        contentContainerStyle: styles.container,
        children: [/*#__PURE__*/_jsx(Input, {
          label: "Full name",
          placeholder: "Full name",
          value: name,
          onChangeText: setName,
          autoCapitalize: "words"
        }), /*#__PURE__*/_jsx(Input, {
          label: "Date of birth",
          placeholder: "DD / MM / YYYY",
          value: dob,
          onChangeText: setDob,
          keyboardType: "numbers-and-punctuation"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.sexLabel,
          children: "SEX"
        }), /*#__PURE__*/_jsx(View, {
          style: styles.pillRow,
          children: SEX_OPTIONS.map(s => /*#__PURE__*/_jsx(TouchableOpacity, {
            style: [styles.pill, sex === s && styles.pillActive],
            onPress: () => setSex(s),
            children: /*#__PURE__*/_jsx(Text, {
              style: [styles.pillText, sex === s && styles.pillTextActive],
              children: s
            })
          }, s))
        }), /*#__PURE__*/_jsx(Input, {
          label: "Weight",
          placeholder: "e.g. 74",
          value: weight,
          onChangeText: setWeight,
          keyboardType: "decimal-pad",
          hint: "Kilograms (kg)"
        }), /*#__PURE__*/_jsx(Input, {
          label: "Height",
          placeholder: "e.g. 172",
          value: height,
          onChangeText: setHeight,
          keyboardType: "decimal-pad",
          hint: "Centimetres (cm)",
          optional: true
        }), /*#__PURE__*/_jsx(Input, {
          label: "Health card number",
          placeholder: "Ontario OHIP number",
          value: healthCard,
          onChangeText: setHealthCard,
          hint: "Used for emergency reference only",
          optional: true
        }), /*#__PURE__*/_jsx(Button, {
          label: saving ? 'Saving…' : 'Save',
          onPress: handleSave,
          disabled: saving || !name,
          style: {
            marginTop: spacing.md
          }
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
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  sexLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.successLight
  },
  pillText: {
    ...typography.body,
    color: colors.textSecondary
  },
  pillTextActive: {
    color: colors.primary,
    fontWeight: '600'
  }
});