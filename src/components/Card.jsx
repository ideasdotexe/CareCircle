import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { jsx as _jsx } from "react/jsx-runtime";
export default function Card({
  children,
  style,
  variant = 'default'
}) {
  return /*#__PURE__*/_jsx(View, {
    style: [styles.base, styles[variant], style],
    children: children
  });
}
const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md
  },
  default: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3
  },
  elevated: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0
  }
});