# Zen Precision Design System Implementation

## Overview

Vibe by Vektra has been refactored with the **Zen Precision** design system - a dark-first, ultra-clean, professional, minimalist design language optimized for mobile-first experiences and 40+ readability.

## 🎨 Design Tokens

All design tokens are centralized in `/src/tokens/`:

### Colors (`src/tokens/colors.ts`)
- **Background**: `#0F1115` (bg.primary)
- **Surfaces**: `#1A1C20`, `#23262C`, `#2A2E36` (callout variant)
- **Text**: Primary `#ECEFF4`, Secondary `#A0A6B0`, Disabled `#6B7280`
- **Accent**: `#82AAFF` (primary blue)
- **Semantic**: Success `#4FD1C5`, Warning `#F2B57B`, Alert `#E07A5F`

### Spacing (`src/tokens/spacing.ts`)
8px grid system:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

### Typography (`src/tokens/typography.ts`)
Optimized for 40+ readability:
- **Display**: 28px, semibold
- **Title**: 22px, medium
- **Section**: 18px, medium
- **Body**: 16-17px, regular (line-height 1.6)
- **Meta**: 14-15px, medium

### Motion (`src/tokens/motion.ts`)
Calm, premium animations with **no bounce**:
- **Fast**: 180ms
- **Base**: 240ms
- **Slow**: 320ms
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` (standard)

## 📦 Component Architecture

### Layout Components (`src/components/layout/`)
- **ScreenContainer**: Main layout container with header, subtitle, and right actions
- **VerticalStack**: Consistent vertical spacing (sm/md/lg/xl)
- **Grid2Col**: 2-column responsive grid for secondary content

### UI Primitives (`src/components/ui/`)
- **Card**: Variants (default/elevated/callout), premium press feedback
- **Button**: Variants (primary/secondary/ghost), min 48px tap targets
- **IconButton**: Optimized tap targets (48x48px)
- **Badge**: Status indicators with semantic colors
- **Divider**: Horizontal/vertical separators
- **BottomNav**: 4-tab navigation (Dashboard, Journeys, Insights, Add)
- **BottomSheet**: Modal dialogs with slide-up animation
- **Skeleton**: Loading placeholders with low-contrast shimmer

### Domain Components (`src/components/domain/`)
- **MetricStrip**: 3-column metrics with deltas
- **HeroJourneyCard**: Featured journey with animated progress
- **JourneyCardSmall**: Compact journey cards for grid
- **ChartCard**: Chart container with fixed height (prevents layout shift)
- **TimelineBlock**: Timeline items with scroll-reveal animation

## 🗺️ Screen Structure

### 1. Dashboard (`/dashboard`)
**Narrative Stack + Hero Journey Emphasis**

Structure:
1. Header + date filter
2. Key metrics summary (MetricStrip)
3. Hero journey card with progress animation
4. Trend chart card
5. Insights preview

### 2. Journeys (`/journeys`)
**Featured Narrative + Secondary Grid**

Structure:
1. Header + filter
2. Featured HeroJourneyCard (full width)
3. Secondary 2-col grid of JourneyCardSmall

### 3. Insights (`/insights`)
**Guided Narrative Timeline**

Structure:
1. Header + range controls
2. Insight thesis hero
3. Guided timeline (evidence → callout → guidance pattern)
4. Action recommendations

### 4. Add Session (`/`)
**Quick session logging** (preserved from original)

## 🎬 Motion Implementation

### Card Press Feedback
```tsx
<Card clickable asMotion>
  {/* Scale to 0.98 on tap */}
</Card>
```

### Progress Animation
- HeroJourneyCard: 600-900ms fill animation
- Milestone dots: Staggered reveal with 220ms duration
- Active dot: Single pulse on completion

### Scroll Reveal
TimelineBlock components fade in with translateY(10px) at 220ms as they enter viewport

## 🎯 Accessibility & Mobile

- ✅ **Tap targets**: Minimum 48x48px
- ✅ **Mobile-first**: Optimized for 375px width
- ✅ **Readability**: 17px body text, 1.6 line-height
- ✅ **No layout shift**: Reserved heights for charts/hero blocks
- ✅ **Safe areas**: Proper insets for notches/home indicators

## 🔄 Migration Notes

### Old Components → New Components
- `components/layout/MobileNav.tsx` → `src/components/ui/BottomNav.tsx`
- `components/ui/card.tsx` → `src/components/ui/Card.tsx` (new variants)
- `components/ui/button.tsx` → `src/components/ui/Button.tsx` (new styling)

### Routes
- `/` - Session logging (preserved)
- `/dashboard` - **NEW** Main dashboard
- `/journeys` - Refactored from `/history`
- `/insights` - Refactored with timeline view
- `/settings` - Preserved

### Legacy Compatibility
CSS variables maintain backward compatibility:
- `--background` → `--bg-primary`
- `--card` → `--surface-1`
- `--primary` → `--accent-primary`

## 🚀 Usage Examples

### Using Layout Components
```tsx
import { ScreenContainer, VerticalStack } from '@/src/components/layout';

<ScreenContainer title="Page Title" subtitle="Description">
  <VerticalStack spacing="lg">
    {/* Your content */}
  </VerticalStack>
</ScreenContainer>
```

### Using Domain Components
```tsx
import { HeroJourneyCard } from '@/src/components/domain';

<HeroJourneyCard
  journey={{
    title: "Recovery Journey",
    status: "in-progress",
    completionPercent: 72,
    milestones: [...]
  }}
  onPress={() => {}}
  onPrimaryCta={() => {}}
/>
```

### Using Motion Tokens
```tsx
import { transitions } from '@/src/tokens';
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={transitions.base}
>
  Content
</motion.div>
```

## ✅ Validation Checklist

- [x] Colors used via tokens/CSS vars only
- [x] 8px spacing grid adhered to
- [x] Typography scale matches readability goals
- [x] Hero Journey is dominant on Dashboard and Journeys
- [x] Insight timeline reads as guided narrative
- [x] Motion is subtle and consistent (no bounce)
- [x] No layout shift during loading
- [x] Bottom navigation labels visible and reachable
- [x] Works on iPhone width; scroll behavior is smooth

## 🎨 Design Philosophy

**Zen Precision** is characterized by:
- Dark-first, professional aesthetic
- No neon, no heavy shadows, no noisy gradients
- Calm, premium motion (no spring overshoot)
- Mobile-first responsive design
- 40+ readability optimization
- Consistent 8px spacing system
- Semantic color usage
- Premium press feedback

## 📚 Resources

- Design Tokens: `/src/tokens/`
- UI Components: `/src/components/ui/`
- Domain Components: `/src/components/domain/`
- Layout Components: `/src/components/layout/`
- Global Styles: `/app/globals.css`
- Tailwind Config: `/tailwind.config.ts`
