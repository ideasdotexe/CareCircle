import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import { IconChevronLeft, IconArrow } from '../components/Icons';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const RELATIONSHIPS = ['Mother', 'Father', 'Spouse', 'Parent', 'Myself', 'Other'];
export default function AddPersonScreen({
  navigation,
  route
}) {
  const isOnboarding = !route?.params?.fromDashboard;
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const handleCreate = async () => {
    if (!name || !relationship) return;
    setLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const {
        error
      } = await supabase.from('persons').insert({
        user_id: user.id,
        name: name.trim(),
        relationship,
        date_of_birth: dob.trim() || null
      });
      if (error) throw error;

      // Mark onboarding done so returning logins skip this screen
      await supabase.auth.updateUser({
        data: {
          onboarding_complete: true
        }
      });
      navigation.navigate('Dashboard');
    } catch (e) {
      Alert.alert('Error', e.message ?? 'Could not save. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/_jsx(SafeAreaView, {
    style: styles.safe,
    children: /*#__PURE__*/_jsx(KeyboardAvoidingView, {
      behavior: Platform.OS === 'ios' ? 'padding' : undefined,
      style: {
        flex: 1
      },
      children: /*#__PURE__*/_jsxs(ScrollView, {
        contentContainerStyle: styles.container,
        keyboardShouldPersistTaps: "handled",
        children: [/*#__PURE__*/_jsxs(View, {
          style: styles.topBar,
          children: [/*#__PURE__*/_jsx(TouchableOpacity, {
            style: styles.backBtn,
            onPress: () => navigation.goBack(),
            children: /*#__PURE__*/_jsx(IconChevronLeft, {
              color: colors.ink
            })
          }), isOnboarding && /*#__PURE__*/_jsx(Text, {
            style: styles.stepLabel,
            children: "Step 2 of 2"
          }), /*#__PURE__*/_jsx(View, {
            style: {
              width: 36
            }
          })]
        }), isOnboarding && /*#__PURE__*/_jsxs(View, {
          style: styles.progressRow,
          children: [/*#__PURE__*/_jsx(View, {
            style: [styles.progressSegment, styles.progressDone]
          }), /*#__PURE__*/_jsx(View, {
            style: [styles.progressSegment, styles.progressDone]
          })]
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.headingArea,
          children: [/*#__PURE__*/_jsx(Text, {
            style: styles.heading,
            children: 'Who are you\ncaring for?'
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.subheading,
            children: "Just a name and how you know them. You can add medications, doctors, and the rest at your own pace."
          })]
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.form,
          children: [/*#__PURE__*/_jsxs(View, {
            style: styles.fieldGroup,
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.fieldLabel,
              children: "Their name"
            }), /*#__PURE__*/_jsx(TextInput, {
              style: styles.input,
              value: name,
              onChangeText: setName,
              autoCapitalize: "words",
              placeholderTextColor: colors.mutedSoft
            })]
          }), /*#__PURE__*/_jsxs(View, {
            style: styles.fieldGroup,
            children: [/*#__PURE__*/_jsx(Text, {
              style: styles.fieldLabel,
              children: "Your relationship"
            }), /*#__PURE__*/_jsx(View, {
              style: styles.pillRow,
              children: RELATIONSHIPS.map(r => /*#__PURE__*/_jsx(TouchableOpacity, {
                style: [styles.pill, relationship === r && styles.pillActive],
                onPress: () => setRelationship(r),
                children: /*#__PURE__*/_jsx(Text, {
                  style: [styles.pillText, relationship === r && styles.pillTextActive],
                  children: r
                })
              }, r))
            })]
          }), /*#__PURE__*/_jsxs(View, {
            style: styles.fieldGroup,
            children: [/*#__PURE__*/_jsxs(View, {
              style: styles.fieldLabelRow,
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.fieldLabel,
                children: "Date of birth"
              }), /*#__PURE__*/_jsx(Text, {
                style: styles.optional,
                children: "Optional"
              })]
            }), /*#__PURE__*/_jsx(TextInput, {
              style: styles.input,
              value: dob,
              onChangeText: setDob,
              placeholder: "MM / DD / YYYY",
              placeholderTextColor: colors.mutedSoft,
              keyboardType: "numbers-and-punctuation"
            })]
          })]
        }), /*#__PURE__*/_jsx(View, {
          style: {
            flex: 1
          }
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.ctaArea,
          children: [/*#__PURE__*/_jsx(TouchableOpacity, {
            style: [styles.ctaBtn, (!name || !relationship || loading) && styles.ctaBtnDisabled],
            onPress: handleCreate,
            disabled: !name || !relationship || loading,
            activeOpacity: 0.88,
            children: loading ? /*#__PURE__*/_jsx(ActivityIndicator, {
              color: "#fff"
            }) : /*#__PURE__*/_jsxs(_Fragment, {
              children: [/*#__PURE__*/_jsx(Text, {
                style: styles.ctaBtnText,
                children: "Create profile"
              }), /*#__PURE__*/_jsx(IconArrow, {
                color: "#fff"
              })]
            })
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.ctaNote,
            children: "You can edit anything later, anytime."
          })]
        })]
      })
    })
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepLabel: {
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase'
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    marginTop: 14
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 99
  },
  progressDone: {
    backgroundColor: colors.forestDeep
  },
  headingArea: {
    paddingHorizontal: 28,
    paddingTop: 40
  },
  heading: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -0.8,
    color: colors.forestDeep
  },
  subheading: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    maxWidth: 300
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 24
  },
  fieldGroup: {},
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  optional: {
    fontSize: 12,
    color: colors.mutedSoft
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.ink,
    letterSpacing: -0.2
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillActive: {
    borderColor: colors.forestDeep,
    backgroundColor: colors.forestDeep
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.1
  },
  pillTextActive: {
    color: '#fff'
  },
  ctaArea: {
    paddingHorizontal: 24,
    paddingTop: 32
  },
  ctaBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.forestDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  ctaBtnDisabled: {
    opacity: 0.4
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.1
  },
  ctaNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.mutedSoft,
    marginTop: 14
  }
});