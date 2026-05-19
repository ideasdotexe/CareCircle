// Design tokens — sourced from CareCircle.html design file
// Warm Canadian family caregiving aesthetic: cream base, deep forest primary,
// terracotta accent, sage status, charcoal text. No emoji, SVG icons only.

export const colors = {
  // Base surfaces
  cream: '#F6F1EA',
  paper: '#FBF7F1',
  white: '#FFFFFF',
  // Text
  ink: '#1A1F1D',
  muted: '#6B6862',
  mutedSoft: '#9A968F',
  // Brand
  forest: '#1F3D38',
  forestDeep: '#15302C',
  // Accent
  terracotta: '#C66E4E',
  terracottaSoft: '#E9CFC1',
  // Status
  sage: '#A8B5A0',
  sageSoft: '#DDE4D6',
  // Lines / borders
  line: '#E8E0D2',
  lineSoft: '#EFE8DA',
  // Aliases used across existing screens
  background: '#F6F1EA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F6F1EA',
  border: '#E8E0D2',
  text: '#1A1F1D',
  textSecondary: '#6B6862',
  textTertiary: '#9A968F',
  primary: '#1F3D38',
  primaryLight: '#A8B5A0',
  primaryDark: '#15302C',
  accent: '#C66E4E',
  accentLight: '#E9CFC1',
  error: '#C0392B',
  errorLight: '#FDEDEC',
  warning: '#C66E4E',
  warningLight: '#E9CFC1',
  success: '#1F3D38',
  successLight: '#DDE4D6',
  shadow: 'rgba(31,61,56,0.08)',
  black: '#000000'
};
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 999
};
export const fonts = {
  serif: 'Georgia'
};
export const typography = {
  // Serif headings (display intent)
  display: {
    fontSize: 44,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -1.2
  },
  h1: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -0.8
  },
  h2: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: -0.6
  },
  h3: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: -0.4
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: -0.3
  },
  // Sans UI
  h4: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.1
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.1
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2
  }
};