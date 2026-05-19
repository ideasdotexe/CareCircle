import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  icon
}) {
  const containerStyle = [styles.base, styles[variant], styles[`size_${size}`], disabled && styles.disabled, style];
  const textStyle = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]];
  return /*#__PURE__*/_jsx(TouchableOpacity, {
    style: containerStyle,
    onPress: onPress,
    disabled: disabled || loading,
    activeOpacity: 0.8,
    children: loading ? /*#__PURE__*/_jsx(ActivityIndicator, {
      color: variant === 'primary' ? colors.white : colors.primary
    }) : /*#__PURE__*/_jsxs(Text, {
      style: textStyle,
      children: [icon ? `${icon}  ` : '', label]
    })
  });
}
const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.accentLight
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  disabled: {
    opacity: 0.45
  },
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36
  },
  size_md: {
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    minHeight: 50
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56
  },
  text: {
    ...typography.h4
  },
  text_primary: {
    color: colors.white
  },
  text_secondary: {
    color: colors.primary
  },
  text_outline: {
    color: colors.primary
  },
  text_ghost: {
    color: colors.primary
  },
  textSize_sm: {
    fontSize: 13
  },
  textSize_md: {
    fontSize: 15
  },
  textSize_lg: {
    fontSize: 16
  }
});