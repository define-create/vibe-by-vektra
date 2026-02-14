/**
 * Zen Precision Color Tokens
 * Dark-first, ultra-clean, professional, minimalist palette
 */

export const colors = {
  bg: {
    primary: '#0F1115',
  },
  surface: {
    1: '#1A1C20',
    2: '#23262C',
    3: {
      callout: '#2A2E36',
    },
  },
  text: {
    primary: '#ECEFF4',
    secondary: '#A0A6B0',
    disabled: '#6B7280',
  },
  accent: {
    primary: '#82AAFF',
  },
  semantic: {
    success: '#4FD1C5',
    warning: '#F2B57B',
    alert: '#E07A5F',
  },
  divider: 'rgba(255, 255, 255, 0.06)',
  overlay: {
    press: 'rgba(255, 255, 255, 0.03)',
    backdrop: 'rgba(0, 0, 0, 0.40)',
  },
} as const;

// CSS variable names for use in Tailwind
export const cssVarNames = {
  bg: {
    primary: '--bg-primary',
  },
  surface: {
    1: '--surface-1',
    2: '--surface-2',
    3: '--surface-3-callout',
  },
  text: {
    primary: '--text-primary',
    secondary: '--text-secondary',
    disabled: '--text-disabled',
  },
  accent: {
    primary: '--accent-primary',
  },
  semantic: {
    success: '--semantic-success',
    warning: '--semantic-warning',
    alert: '--semantic-alert',
  },
  divider: '--divider',
  overlay: {
    press: '--overlay-press',
    backdrop: '--overlay-backdrop',
  },
} as const;
