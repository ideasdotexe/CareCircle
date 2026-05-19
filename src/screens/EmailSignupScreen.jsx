import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function EmailSignupScreen({
  navigation
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSignup = async () => {
    if (!name || !email || password.length < 8) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim()
          }
        }
      });
      if (error) throw error;
      // If email confirmation is required, prompt the user
      // Otherwise AuthContext listener fires and switches to AppStack automatically
      Alert.alert('Almost there!', 'If you received a confirmation email, please verify your address. Otherwise you\'re signed in.', [{
        text: 'OK'
      }]);
    } catch (e) {
      Alert.alert('Sign up failed', e.message ?? 'Something went wrong.');
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
        children: [/*#__PURE__*/_jsx(TouchableOpacity, {
          style: styles.back,
          onPress: () => navigation.goBack(),
          children: /*#__PURE__*/_jsx(Text, {
            style: styles.backText,
            children: "\u2190 Back"
          })
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.title,
          children: "Create your account"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.subtitle,
          children: "Takes about 30 seconds"
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.form,
          children: [/*#__PURE__*/_jsx(Input, {
            label: "Your name",
            placeholder: "e.g. Priya Sharma",
            value: name,
            onChangeText: setName,
            autoCapitalize: "words"
          }), /*#__PURE__*/_jsx(Input, {
            label: "Email address",
            placeholder: "priya@example.com",
            value: email,
            onChangeText: setEmail,
            keyboardType: "email-address",
            autoCapitalize: "none"
          }), /*#__PURE__*/_jsx(Input, {
            label: "Password",
            placeholder: "8+ characters",
            value: password,
            onChangeText: setPassword,
            secureTextEntry: true,
            hint: "Minimum 8 characters"
          })]
        }), /*#__PURE__*/_jsx(Button, {
          label: loading ? '' : 'Create Account',
          onPress: handleSignup,
          disabled: loading || !name || !email || password.length < 8
        }), loading && /*#__PURE__*/_jsx(ActivityIndicator, {
          style: {
            marginTop: 8
          },
          color: colors.primary
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.legal,
          children: "By continuing, you agree to our Terms of Service and Privacy Policy. Your data stays in Canada."
        })]
      })
    })
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.md
  },
  back: {
    marginBottom: spacing.lg
  },
  backText: {
    ...typography.body,
    color: colors.primary
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl
  },
  form: {
    marginBottom: spacing.lg
  },
  legal: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18
  }
});