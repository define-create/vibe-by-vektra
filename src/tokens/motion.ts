/**
 * Zen Precision Motion Tokens
 * Calm, premium animations with no bounce
 */

export const motion = {
  duration: {
    fast: 180,    // ms
    base: 240,    // ms
    slow: 320,    // ms
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
} as const;

// Framer Motion variants
export const transitions = {
  fast: {
    duration: motion.duration.fast / 1000,
    ease: [0.2, 0.8, 0.2, 1],
  },
  base: {
    duration: motion.duration.base / 1000,
    ease: [0.2, 0.8, 0.2, 1],
  },
  slow: {
    duration: motion.duration.slow / 1000,
    ease: [0.2, 0.8, 0.2, 1],
  },
  decelerate: {
    duration: motion.duration.base / 1000,
    ease: [0.0, 0.0, 0.2, 1],
  },
  accelerate: {
    duration: motion.duration.base / 1000,
    ease: [0.4, 0.0, 1, 1],
  },
} as const;

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const scalePress = {
  initial: { scale: 1 },
  pressed: { scale: 0.98 },
};
