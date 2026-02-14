/**
 * Zen Precision Typography Tokens
 * Optimized for 40+ readability
 */

export const typography = {
  display: {
    fontSize: '28px',
    fontWeight: 600, // semibold
    lineHeight: 1.4,
  },
  title: {
    fontSize: '22px',
    fontWeight: 500, // medium
    lineHeight: 1.4,
  },
  section: {
    fontSize: '18px',
    fontWeight: 500, // medium
    lineHeight: 1.5,
  },
  body: {
    fontSize: '17px',
    fontWeight: 400, // regular
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '16px',
    fontWeight: 400, // regular
    lineHeight: 1.6,
  },
  meta: {
    fontSize: '15px',
    fontWeight: 500, // medium
    lineHeight: 1.5,
  },
  metaSmall: {
    fontSize: '14px',
    fontWeight: 500, // medium
    lineHeight: 1.5,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
