import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SectionRow({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  onPress,
  completed
}) {
  return /*#__PURE__*/_jsxs(TouchableOpacity, {
    style: styles.row,
    onPress: onPress,
    activeOpacity: 0.7,
    children: [/*#__PURE__*/_jsx(View, {
      style: [styles.iconBox, completed && styles.iconBoxDone],
      children: /*#__PURE__*/_jsx(Text, {
        style: styles.icon,
        children: icon
      })
    }), /*#__PURE__*/_jsxs(View, {
      style: styles.content,
      children: [/*#__PURE__*/_jsx(Text, {
        style: styles.title,
        children: title
      }), subtitle && /*#__PURE__*/_jsx(Text, {
        style: styles.subtitle,
        children: subtitle
      })]
    }), badge && /*#__PURE__*/_jsx(View, {
      style: [styles.badge, {
        backgroundColor: badgeColor || colors.accentLight
      }],
      children: /*#__PURE__*/_jsx(Text, {
        style: [styles.badgeText, {
          color: badgeColor ? colors.white : colors.primary
        }],
        children: badge
      })
    }), completed && /*#__PURE__*/_jsx(View, {
      style: styles.checkBadge,
      children: /*#__PURE__*/_jsx(Text, {
        style: styles.checkText,
        children: "\u2713"
      })
    }), /*#__PURE__*/_jsx(Text, {
      style: styles.chevron,
      children: "\u203A"
    })]
  });
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  iconBoxDone: {
    backgroundColor: colors.successLight
  },
  icon: {
    fontSize: 20
  },
  content: {
    flex: 1
  },
  title: {
    ...typography.h4,
    color: colors.text
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginRight: spacing.sm
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600'
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  checkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  chevron: {
    fontSize: 22,
    color: colors.textTertiary
  }
});