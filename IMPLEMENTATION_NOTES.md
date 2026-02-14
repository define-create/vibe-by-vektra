# Zen Precision Implementation Notes

## What Was Done

### 1. Design System Foundation ✅
Created comprehensive design token system in `/src/tokens/`:
- `colors.ts` - Full Zen Precision color palette
- `spacing.ts` - 8px grid system + border radii
- `typography.ts` - Readability-optimized type scale
- `motion.ts` - Calm motion tokens + Framer Motion variants

### 2. Global Styling Updates ✅
- Updated `app/globals.css` with Zen Precision CSS variables
- Refactored `tailwind.config.ts` to use new tokens
- Added safe-area utilities for mobile devices
- Installed `framer-motion` for animations

### 3. Core Components ✅

#### Layout Components (`src/components/layout/`)
- **ScreenContainer** - Main page wrapper with header/actions
- **VerticalStack** - Spacing utility (replaces manual spacing)
- **Grid2Col** - Responsive 2-column grid

#### UI Primitives (`src/components/ui/`)
- **Card** - 3 variants (default/elevated/callout), press feedback
- **Button** - 4 variants (primary/secondary/ghost/destructive)
- **IconButton** - 48x48px tap target, accessible
- **Badge** - 5 variants (default/accent/success/warning/alert)
- **Divider** - Horizontal/vertical separator
- **BottomNav** - New 4-tab navigation (Dashboard/Journeys/Insights/Add)
- **BottomSheet** - Modal with slide-up animation
- **Skeleton** - Loading state with subtle shimmer

#### Domain Components (`src/components/domain/`)
- **MetricStrip** - 3-metric display with semantic deltas
- **HeroJourneyCard** - Animated journey progress card
- **JourneyCardSmall** - Compact journey card for grid
- **ChartCard** - Fixed-height chart container (prevents layout shift)
- **TimelineBlock** - Scroll-reveal timeline items

### 4. Page Refactors ✅

#### New Dashboard (`/dashboard`)
- Metrics summary at top
- Hero journey card with animation
- Trend chart placeholder (ready for Recharts integration)
- Insights preview
- Date filter bottom sheet

#### Journeys Page (`/journeys`)
- Refactored from `/history`
- Featured journey (full-width HeroJourneyCard)
- 2-column grid of recent sessions
- Filter bottom sheet

#### Insights Page (`/insights`)
- Preserved existing AI generation logic
- New timeline narrative UI
- Thesis hero card
- Evidence → Callout → Guidance pattern
- Action recommendations

### 5. Navigation Updates ✅
- Updated `app/(main)/layout.tsx` to use new BottomNav
- New routes: Dashboard, Journeys (replaces History)
- Preserved: Add Session (/), Insights, Settings

## What Needs Integration

### 1. Real Data Wiring
The new pages use **mock data**. You need to:

**Dashboard:**
```tsx
// Replace mock metrics with real data from your backend
const metrics = [
  { label: 'Sessions', value: '24', delta: '+12%', deltaDirection: 'up' },
  // ... fetch from API/state
];

// Replace mock journey with real data
const heroJourney = {
  id: 'recovery-journey',
  // ... fetch from your journey tracking system
};
```

**Journeys:**
```tsx
// Currently using sessions as secondary journeys
// You may want to create a proper "Journey" concept
const secondaryJourneys = sessions.slice(0, 6).map(/* ... */);
```

### 2. Chart Integration
Dashboard has a `ChartCard` placeholder:
```tsx
<ChartCard title="Energy Trends" legend={[...]}>
  {/* Integrate Recharts here */}
  <LineChart data={energyData}>
    {/* ... */}
  </LineChart>
</ChartCard>
```

You already have `recharts` installed. Import and integrate your chart components.

### 3. Filter Bottom Sheets
Both Dashboard and Journeys have filter bottom sheets with placeholder UI:
```tsx
<BottomSheet open={filterOpen} onOpenChange={setFilterOpen} title="Filter">
  {/* Add your filter UI here - checkboxes, date pickers, etc. */}
</BottomSheet>
```

### 4. Journey Concept
Currently "journeys" are mapped from sessions. You may want to:
- Create a proper `Journey` type in your data model
- Add journey CRUD operations
- Track milestones and completion status
- Link sessions to journeys

### 5. Progress Animation Data
`HeroJourneyCard` expects milestone data:
```tsx
milestones: [
  { id: 'm1', label: 'Initial Assessment', isComplete: true },
  { id: 'm2', label: 'Pain-Free Serving', isComplete: true },
  { id: 'm3', label: 'Full Power', isComplete: false },
  { id: 'm4', label: 'Competition Ready', isComplete: false },
]
```

You'll need to define how milestones are created and tracked.

## Preserved Functionality

### ✅ Kept Working
- Session logging (`/` route)
- AI insights generation (API calls preserved)
- Auth system (guest/user modes)
- Quota checking
- Guest locked states
- All existing API routes
- Settings page
- People management
- Signals

### ⚠️ Changed Routing
- `/history` → `/journeys` (navigation label updated)
- Added `/dashboard` (new page)

## Mobile Testing Checklist

Test on actual devices or browser DevTools (375px width):
- [ ] All tap targets are at least 48x48px
- [ ] Text is readable (especially 17px body)
- [ ] Bottom nav doesn't overlap content
- [ ] Safe area insets work on notched devices
- [ ] Cards respond to press with scale feedback
- [ ] Bottom sheets slide up smoothly
- [ ] Scroll performance is smooth
- [ ] No horizontal overflow

## Next Steps

1. **Wire up real data** to Dashboard metrics and hero journey
2. **Integrate charts** using Recharts in ChartCard
3. **Implement filters** in bottom sheets (date ranges, status, tags)
4. **Create Journey model** if you want distinct journeys vs sessions
5. **Test on mobile** devices (iOS Safari, Chrome Android)
6. **Add error states** for API failures
7. **Add empty states** for new users
8. **Performance audit** - check bundle size, lazy load heavy components

## Design System Usage

Import tokens:
```tsx
import { colors, spacing, typography, motion } from '@/src/tokens';
```

Import components:
```tsx
import { Card, Button } from '@/src/components/ui';
import { HeroJourneyCard } from '@/src/components/domain';
import { ScreenContainer } from '@/src/components/layout';
```

Use Tailwind classes with tokens:
```tsx
<div className="bg-surface-1 p-md rounded-lg">
  <h2 className="text-title text-text-primary">Title</h2>
  <p className="text-body text-text-secondary">Body text</p>
</div>
```

## Questions?

The design system is fully documented in `ZEN_PRECISION_README.md`. All components are typed with TypeScript and include JSDoc comments.
