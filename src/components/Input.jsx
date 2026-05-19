import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Input({
  label,
  hint,
  error,
  optional,
  style,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  return /*#__PURE__*/_jsxs(View, {
    style: styles.container,
    children: [label && /*#__PURE__*/_jsxs(View, {
      style: styles.labelRow,
      children: [/*#__PURE__*/_jsx(Text, {
        style: styles.label,
        children: label
      }), optional && /*#__PURE__*/_jsx(Text, {
        style: styles.optional,
        children: "Optional"
      })]
    }), /*#__PURE__*/_jsx(TextInput, {
      style: [styles.input, focused && styles.inputFocused, error && styles.inputError, style],
      placeholderTextColor: colors.textTertiary,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      ...props
    }), hint && !error && /*#__PURE__*/_jsx(Text, {
      style: styles.hint,
      children: hint
    }), error && /*#__PURE__*/_jsx(Text, {
      style: styles.error,
      children: error
    })]
  });
}
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase'
  },
  optional: {
    ...typography.caption,
    color: colors.textTertiary
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    ...typography.body,
    color: colors.text,
    minHeight: 50
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white
  },
  inputError: {
    borderColor: colors.error
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 4
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4
  }
});