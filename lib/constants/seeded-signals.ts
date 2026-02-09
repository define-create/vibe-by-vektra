// Default Supporting Inputs (Context Signals)
// These are seeded for new users on first session or account creation

export const SEEDED_SUPPORTING_INPUTS = [
  {
    name: 'Good sleep the night before',
    description: 'Got adequate, quality sleep (7+ hours)',
    isEnabled: true
  },
  {
    name: 'Hydrated well',
    description: 'Drank sufficient water before and during',
    isEnabled: true
  },
  {
    name: 'Ate heavy meal within 2 hours',
    description: 'Had a large or heavy meal shortly before playing',
    isEnabled: true
  },
  {
    name: 'Stressful day at work',
    description: 'Experienced work-related stress or pressure',
    isEnabled: true
  },
  {
    name: 'Warmed up properly',
    description: 'Completed adequate warm-up routine',
    isEnabled: true
  },
  {
    name: 'Stretched after',
    description: 'Did post-session stretching or cool-down',
    isEnabled: true
  }
] as const;
