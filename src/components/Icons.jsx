// SVG icon components — ported from the CareCircle design file (screens.jsx)
// No emoji. All icons are SVG paths.

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const f = colors.forest;
const m = colors.muted;
const ink = colors.ink;
export const CCLogo = ({
  size = 28,
  color = colors.forest
}) => /*#__PURE__*/_jsxs(Svg, {
  width: size,
  height: size,
  viewBox: "0 0 32 32",
  children: [/*#__PURE__*/_jsx(Circle, {
    cx: "16",
    cy: "16",
    r: "13",
    stroke: color,
    strokeWidth: "1.5",
    fill: "none"
  }), /*#__PURE__*/_jsx(Circle, {
    cx: "16",
    cy: "16",
    r: "7.5",
    stroke: color,
    strokeWidth: "1.5",
    fill: "none"
  }), /*#__PURE__*/_jsx(Circle, {
    cx: "16",
    cy: "8.5",
    r: "2",
    fill: color
  })]
});
export const IconApple = ({
  color = '#fff'
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "18",
  height: "20",
  viewBox: "0 0 18 20",
  children: [/*#__PURE__*/_jsx(Path, {
    d: "M14.55 10.6c0-2.6 2.1-3.85 2.2-3.9-1.2-1.75-3.05-2-3.7-2-1.6-.15-3.1.95-3.9.95-.85 0-2.05-.95-3.4-.9-1.7.05-3.3 1-4.2 2.55-1.85 3.15-.45 7.85 1.3 10.4.85 1.25 1.85 2.65 3.2 2.6 1.3-.05 1.8-.85 3.35-.85s2 .85 3.35.85c1.4 0 2.3-1.25 3.15-2.55.65-.95 1.05-1.95 1.4-2.95-1.7-.65-2.75-2.3-2.75-4.2z",
    fill: color
  }), /*#__PURE__*/_jsx(Path, {
    d: "M11.95 3c.7-.85 1.2-2.05 1.05-3.25-1.05.05-2.3.7-3.05 1.55-.65.75-1.25 1.95-1.1 3.15 1.15.1 2.4-.6 3.1-1.45z",
    fill: color
  })]
});
export const IconGoogle = () => /*#__PURE__*/_jsxs(Svg, {
  width: "18",
  height: "18",
  viewBox: "0 0 18 18",
  children: [/*#__PURE__*/_jsx(Path, {
    d: "M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z",
    fill: "#4285F4"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z",
    fill: "#34A853"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z",
    fill: "#FBBC05"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z",
    fill: "#EA4335"
  })]
});
export const IconMail = ({
  color = colors.forest
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "18",
  height: "14",
  viewBox: "0 0 18 14",
  children: [/*#__PURE__*/_jsx(Rect, {
    x: "1",
    y: "1",
    width: "16",
    height: "12",
    rx: "2",
    stroke: color,
    strokeWidth: "1.5",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M1.5 2L9 8l7.5-6",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    fill: "none"
  })]
});
export const IconShield = ({
  color = colors.muted
}) => /*#__PURE__*/_jsx(Svg, {
  width: "12",
  height: "14",
  viewBox: "0 0 12 14",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M6 .5L1 2.5v4c0 3 2 5.5 5 6.5 3-1 5-3.5 5-6.5v-4l-5-2z",
    stroke: color,
    strokeWidth: "1.2",
    strokeLinejoin: "round",
    fill: "none"
  })
});
export const IconBell = ({
  color = colors.ink
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "18",
  height: "20",
  viewBox: "0 0 18 20",
  children: [/*#__PURE__*/_jsx(Path, {
    d: "M9 2v1.5M3 8a6 6 0 1112 0v3l1.5 3h-15L3 11V8z",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M7 17a2 2 0 004 0",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    fill: "none"
  })]
});
export const IconPlus = ({
  color = colors.forest
}) => /*#__PURE__*/_jsx(Svg, {
  width: "14",
  height: "14",
  viewBox: "0 0 14 14",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M7 1v12M1 7h12",
    stroke: color,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    fill: "none"
  })
});
export const IconArrow = ({
  color = colors.forest
}) => /*#__PURE__*/_jsx(Svg, {
  width: "14",
  height: "12",
  viewBox: "0 0 14 12",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M1 6h12m0 0L8 1m5 5L8 11",
    stroke: color,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  })
});
export const IconHeart = ({
  color = colors.terracotta
}) => /*#__PURE__*/_jsx(Svg, {
  width: "14",
  height: "12",
  viewBox: "0 0 14 12",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M7 11s-5.5-3-5.5-7A2.5 2.5 0 016 2c.5 0 .8.2 1 .5.2-.3.5-.5 1-.5a2.5 2.5 0 014.5 2c0 4-5.5 7-5.5 7z",
    fill: color
  })
});
export const IconDrop = ({
  color = colors.forest
}) => /*#__PURE__*/_jsx(Svg, {
  width: "12",
  height: "14",
  viewBox: "0 0 12 14",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M6 1c0 4-5 5-5 8.5a5 5 0 0010 0C11 6 6 5 6 1z",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinejoin: "round",
    fill: "none"
  })
});
export const IconPulse = ({
  color = colors.forest
}) => /*#__PURE__*/_jsx(Svg, {
  width: "16",
  height: "14",
  viewBox: "0 0 16 14",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M1 7h3l2-5 4 10 2-5h3",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  })
});
export const IconScale = ({
  color = colors.forest
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "14",
  height: "14",
  viewBox: "0 0 14 14",
  children: [/*#__PURE__*/_jsx(Rect, {
    x: "1",
    y: "1",
    width: "12",
    height: "12",
    rx: "3",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M5 5l2-2 2 2",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinecap: "round",
    fill: "none"
  })]
});
export const IconPill = ({
  color = colors.forest
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "16",
  height: "16",
  viewBox: "0 0 16 16",
  children: [/*#__PURE__*/_jsx(Rect, {
    x: "1",
    y: "5",
    width: "14",
    height: "6",
    rx: "3",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M8 5v6",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  })]
});
export const IconDoc = ({
  color = colors.forest
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "14",
  height: "16",
  viewBox: "0 0 14 16",
  children: [/*#__PURE__*/_jsx(Path, {
    d: "M2 1h7l4 4v10H2V1z",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinejoin: "round",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M9 1v4h4",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  })]
});
export const IconHome = ({
  color = colors.forest
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "18",
  height: "18",
  viewBox: "0 0 18 18",
  children: [/*#__PURE__*/_jsx(Path, {
    d: "M2 8l7-6 7 6v8H2V8z",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M7 16v-5h4v5",
    stroke: color,
    strokeWidth: "1.5",
    fill: "none"
  })]
});
export const IconPeople = ({
  color = colors.muted
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "20",
  height: "16",
  viewBox: "0 0 20 16",
  children: [/*#__PURE__*/_jsx(Circle, {
    cx: "6",
    cy: "5",
    r: "3",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M1 15c0-3 2-5 5-5s5 2 5 5",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinecap: "round",
    fill: "none"
  }), /*#__PURE__*/_jsx(Circle, {
    cx: "14",
    cy: "6",
    r: "2.5",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M11 14c0-2 1.5-3.5 3.5-3.5S19 12 19 14",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinecap: "round",
    fill: "none"
  })]
});
export const IconUser = ({
  color = colors.muted
}) => /*#__PURE__*/_jsxs(Svg, {
  width: "16",
  height: "18",
  viewBox: "0 0 16 18",
  children: [/*#__PURE__*/_jsx(Circle, {
    cx: "8",
    cy: "5",
    r: "3.5",
    stroke: color,
    strokeWidth: "1.4",
    fill: "none"
  }), /*#__PURE__*/_jsx(Path, {
    d: "M2 17c0-3 3-5 6-5s6 2 6 5",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinecap: "round",
    fill: "none"
  })]
});
export const IconCheck = ({
  color = colors.forest
}) => /*#__PURE__*/_jsx(Svg, {
  width: "12",
  height: "10",
  viewBox: "0 0 12 10",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M1 5l3 3 7-7",
    stroke: color,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  })
});
export const IconChevronRight = ({
  color = colors.muted
}) => /*#__PURE__*/_jsx(Svg, {
  width: "7",
  height: "12",
  viewBox: "0 0 7 12",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M1 1l5 5-5 5",
    stroke: color,
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  })
});
export const IconChevronLeft = ({
  color = colors.ink
}) => /*#__PURE__*/_jsx(Svg, {
  width: "8",
  height: "14",
  viewBox: "0 0 8 14",
  children: /*#__PURE__*/_jsx(Path, {
    d: "M7 1L1 7l6 6",
    stroke: color,
    strokeWidth: "1.6",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })
});