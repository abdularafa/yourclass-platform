export const colors = {
  background: {
    base: '#0D0D0F',
    surface: '#141417',
    elevated: '#1C1C21',
    hover: '#1F1F25',
  },
  border: {
    subtle: '#2A2A32',
    strong: '#3D3D4A',
  },
  text: {
    primary: '#F0F0F5',
    secondary: '#8A8A9A',
    disabled: '#4A4A58',
  },
  primary: {
    default: '#7B5CF0',
    hover: '#8B6EF5',
    active: '#6A4DE0',
    disabled: '#3D3158',
    subtle: 'rgba(123, 92, 240, 0.12)',
  },
  accent: {
    teal: '#00D4A8',
    tealSubtle: 'rgba(0, 212, 168, 0.12)',
    tealGlow: '0 0 12px rgba(0, 212, 168, 0.35)',
  },
  status: {
    error: '#E85050',
    warning: '#E8A020',
    success: '#00D4A8',
  },
};

export const typography = {
  fonts: {
    heading: 'Syne, sans-serif',
    body: 'DM Sans, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  sizes: {
    h1: '28px',
    h2: '22px',
    h3: '18px',
    h4: '15px',
    body: '15px',
    caption: '12px',
    label: '13px',
    data: '15px',
    dataLarge: '24px',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    body: 1.65,
    heading: 1.2,
  },
  letterSpacing: {
    heading: '-0.5px',
    heading2: '-0.3px',
    heading3: '-0.2px',
    label: '0.3px',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
  xxxxl: '64px',
};

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
};

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};

export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  wide: `@media (max-width: ${breakpoints.wide})`,
};

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
};

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
};

export const layout = {
  screenPadding: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
  },
  maxContentWidth: '1200px',
  sidebarWidth: '260px',
  headerHeight: '64px',
  bottomNavHeight: '60px',
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  media,
  transitions,
  zIndex,
  layout,
};
