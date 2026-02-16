# PRD: Dashboard v1.1 — Deterministic Briefing Surface

## Introduction/Overview

The current Dashboard in Vibe by Vektra shows basic metrics (sessions count, average energy, recovery percentage) and recommendation outcomes, but lacks temporal comparison capabilities. Users cannot quickly understand what has meaningfully changed in their recent volleyball performance.

**Dashboard v1.1** transforms the Dashboard into a deterministic briefing surface that answers one primary question:

> **"What has meaningfully changed recently?"**

The feature compares recent activity (last 14 days by default) against a baseline period (previous 14 days) and automatically detects notable shifts in energy, mood, soreness, and session patterns using threshold-based rules. All language is neutral and observational—no coaching or prescriptive statements.

**Problem Statement**: Users have to manually review individual sessions to identify trends and changes in their performance data. There is no aggregated view that highlights meaningful shifts.

**Solution**: A data-driven dashboard that automatically computes metrics across time windows, compares periods, detects notable changes, and surfaces the most important insights first.

---

## Goals

1. **Enable rapid pattern recognition**: Users should understand "what changed recently" in under 5 seconds of viewing the Dashboard
2. **Provide deterministic insights**: Use threshold-based detection (not AI) for reliable, explainable shift detection
3. **Maintain neutral tone**: All language must be observational ("increased", "decreased") not prescriptive ("improved", "should")
4. **Handle low-data scenarios gracefully**: Provide meaningful views even with 1-3 sessions, degrade features based on sample size
5. **Support temporal flexibility**: Allow users to switch between 7, 14, and 28-day analysis windows
6. **Reduce cognitive load**: Show only the top 3-4 most notable shifts, keep interface scannable

---

## User Stories

**As a volleyball player**, I want to:

1. **See what changed recently** so that I can understand if my training approach is having an effect
   - Acceptance: Within 5 seconds of opening Dashboard, I can identify 2-4 notable shifts in my performance

2. **Compare my recent sessions to my baseline** so that I can spot trends in energy, recovery, and session patterns
   - Acceptance: Dashboard shows clear before/after metrics with deltas for energy, mood, and soreness

3. **Understand soreness trends across body areas** so that I can monitor injury risk and recovery
   - Acceptance: Recovery Signals section shows soreness frequency for hands, knees, shoulder, and back with percentage changes

4. **See how different session types affect me** so that I can optimize my training mix
   - Acceptance: Context Comparisons show energy and soreness differences between Singles vs Doubles, and Casual vs Competitive intensity

5. **Adjust my analysis timeframe** so that I can look at shorter or longer trends
   - Acceptance: Time window selector allows switching between 7, 14, and 28-day periods

6. **Get meaningful insights even with limited data** so that I'm not blocked from using the Dashboard as a new user
   - Acceptance: Dashboard shows helpful views even with 1-3 sessions, with clear messaging about when comparisons will be available

---

## Functional Requirements

### 1. Time Window Management

**FR-1.1** The system must support three analysis window sizes: 7, 14, and 28 days (default: 14 days)

**FR-1.2** The system must divide sessions into two periods:
- **Recent window**: Last N days (where N = 7, 14, or 28)
- **Baseline window**: Previous N days (immediately before the recent window)

**FR-1.3** If total sessions < 10, the system must use dynamic splitting:
- Recent = last N/2 sessions
- Baseline = previous N/2 sessions

**FR-1.4** If total sessions < 4, the system must show a simplified view with no comparisons

**FR-1.5** The system must provide a time window selector UI (bottom sheet or modal) accessible from the Dashboard header

### 2. Sample Size Gating

**FR-2.1** The system must not show window comparisons unless BOTH conditions are met:
- Recent window has ≥ 3 sessions
- Baseline window has ≥ 3 sessions

**FR-2.2** For category comparisons (Singles vs Doubles, Intensity levels), the system must not show a comparison unless each subgroup has ≥ 3 sessions

**FR-2.3** The system must display appropriate messaging when sample size is insufficient:
- "More history needed to detect meaningful shifts" (for comparisons)
- "Log 3+ singles and 3+ doubles to compare formats" (for category comparisons)

### 3. Metric Computation

**FR-3.1** For each window (Recent and Baseline), the system must compute:

**Energy metrics**:
- avg_energy_before (mean of energyBefore field)
- avg_energy_after (mean of energyAfter field)
- avg_energy_delta (mean of energyAfter - energyBefore per session)

**Mood metrics**:
- avg_mood_before
- avg_mood_after
- avg_mood_delta

**Soreness frequency** (for each area: hands, knees, shoulder, back):
- soreness_frequency = (# sessions with soreness ≠ 0) / total sessions in window
- Expressed as percentage (0-100%)

**Session load**:
- avg_duration_minutes (mean of durationMinutes field)
- intensity_distribution: percentage of sessions that are casual/moderate/competitive
- format_distribution: percentage of sessions that are singles/doubles

**Mental state distribution**:
- Frequency of each mental tag across sessions (focused, distracted, confident, anxious, frustrated, flow-state, fatigued)
- Show only top 2-3 most frequent tags

**FR-3.2** The system must skip sessions with missing values when computing averages (e.g., if durationMinutes is null, exclude from avg_duration calculation)

### 4. Comparison Logic

**FR-4.1** The system must compute deltas between Recent and Baseline windows for all metrics

**FR-4.2** For each metric, the comparison must include:
- Recent value
- Baseline value
- Delta (recent - baseline)
- Percent change ((delta / baseline) × 100)

**FR-4.3** Deltas must be computed for:
- Energy: avg_energy_before, avg_energy_after, avg_energy_delta
- Mood: avg_mood_before, avg_mood_after, avg_mood_delta
- Soreness frequency: for each of 4 body areas
- Distribution shifts: intensity and format percentage-point changes

### 5. Notable Shifts Detection

**FR-5.1** The system must flag a shift as "notable" if it meets any of these thresholds:

**Energy/Mood thresholds** (any one triggers "notable"):
- |Δ avg_energy_after| ≥ 0.4 (on 1-5 scale)
- |Δ avg_energy_delta| ≥ 0.3
- |Δ avg_mood_after| ≥ 0.4
- |Δ avg_mood_delta| ≥ 0.3

**Soreness threshold**:
- |Δ soreness_frequency| ≥ 0.15 (15 percentage points)

**Distribution shift threshold**:
- |Δ intensity_share| ≥ 0.20 (20 percentage points for any intensity level)
- |Δ format_share| ≥ 0.20 (20 percentage points for singles or doubles)

**FR-5.2** If more than 4 notable shifts are detected, the system must rank them by magnitude and display only the top 3-4

**FR-5.3** Each notable shift must be formatted as:
- `"[Metric] [direction] by [magnitude] (vs prior period)"`
- Example: `"Post-session energy increased by +0.6 (vs prior period)"`
- Example: `"Shoulder soreness frequency increased by +18% (vs prior period)"`

**FR-5.4** The system must use only neutral language:
- ✅ Allowed: "increased", "decreased", "higher", "lower", "shifted", "changed"
- ❌ Forbidden: "improved", "worse", "better", "bad", "should", "recommend", "great"

### 6. Dashboard Layout

**FR-6.1** The Dashboard must display the following sections in order (A-G):

**Section A: Header**
- Title: "Dashboard"
- Subtitle: Time window label (e.g., "Last 14 days")
- Comparison note: "Compared to prior 14 days" (only if baseline available)
- Right action: Time window selector button (calendar icon)

**Section B: Recent Activity Summary**
- Compact card showing:
  - Session count (recent window)
  - Average duration in minutes
  - Session mix (e.g., "62% doubles, 50% competitive")
- Example: `"8 sessions · avg 78 min · 62% doubles"`

**Section C: Notable Shifts** (PRIMARY VALUE)
- Card with bulleted list of 2-4 notable shifts
- If baseline available and shifts detected: Show formatted shift statements
- If baseline available but no shifts: "No material changes detected in the last [N] days"
- If baseline not available: "More history needed to detect meaningful shifts"

**Section D: Energy Response**
- Three metrics displayed:
  - Avg energy before
  - Avg energy after
  - Avg energy delta
- If baseline available: Show delta chip next to each (e.g., "+0.4 vs prior")
- Optional: Small sparkline chart of last 8-12 sessions (after-energy)

**Section E: Recovery Signals**
- 2x2 grid showing soreness frequency for:
  - Hands
  - Knees
  - Shoulder
  - Back
- Each cell format: `"[Area]: [count]/[total] ([percentage]%)"`
- If baseline available: Show arrow and change (e.g., "↑ +18%")

**Section F: Context Comparisons** (CONDITIONAL)
- Only show if sample size supports (≥3 sessions per subgroup)
- Card 1: Singles vs Doubles
  - Avg post-energy for each
  - Avg soreness frequency for each
- Card 2: Intensity breakdown
  - Avg energy delta by casual/moderate/competitive
- Max 2 comparison cards total

**Section G: Recent Sessions**
- List of 1-3 most recent sessions showing:
  - Date/time
  - Format + intensity
  - After-energy value
  - Quick soreness indicator icons
- Tappable to open session detail/edit

**FR-6.2** The system must preserve existing Dashboard features:
- Recommendation banner (if active, with 5s auto-dismiss)
- Outcome cards (celebratory feedback for followed recommendations)

### 7. Empty States

**FR-7.1** **0 sessions**: Display onboarding card with:
- Message: "Log your first session to start building a history"
- CTA button: "Log Session" (navigates to /history or session form)

**FR-7.2** **1-3 sessions**: Display:
- Recent Activity Summary (sessions count, duration, mix)
- Energy Response (recent metrics only, no comparison)
- Notable Shifts card showing: "More history needed (log 3+ sessions for comparisons)"
- Recent Sessions list

**FR-7.3** **4-9 sessions**: Display full layout with:
- Dynamic split comparison (recent = last N/2, baseline = previous N/2)
- All sections A-G
- Note in Notable Shifts card: "Using session-based split (log more for time-based trends)"

### 8. Data Model Extension

**FR-8.1** The system must add a `sorenessHands` field to the session data model:
- Type: SorenessLevel (0 | 1 | 2 | 3)
- Default value: 0 (none)
- Labels: 0=None, 1=Low, 2=Moderate, 3=High

**FR-8.2** The session log form must include a hands soreness input control (radio buttons or slider) in the soreness section

**FR-8.3** Database schema must be updated:
- IndexedDB (Dexie): Add `sorenessHands` field, run migration to set default value 0 for existing records
- Supabase: Add `soreness_hands` column (INTEGER, default 0, check constraint 0-3)

**FR-8.4** Validation schema must enforce: `sorenessHands` is required, integer, 0-3 range

---

## Non-Goals (Out of Scope)

1. **AI-generated insights alongside notable shifts** - v1.1 is deterministic only; AI hybrid mode is future enhancement
2. **Custom threshold configuration** - Thresholds are fixed in v1.1; user preferences for thresholds are out of scope
3. **Historical dashboard snapshots** - Viewing past dashboard states (e.g., "View Feb 1-14 snapshot") is not included
4. **Push notifications for notable shifts** - No proactive notifications; users must open Dashboard
5. **Soreness severity tracking** - v1.1 tracks frequency only (% sessions with soreness), not average severity level
6. **Export dashboard data** - No PDF/image/CSV export in v1.1
7. **Social features** - No sharing of dashboard metrics with other users
8. **Coaching recommendations** - Dashboard shows data only; no prescriptive guidance or "you should" statements

---

## Design Considerations

### UI/UX Requirements

1. **Scannability**: Dashboard should be answerable in <5 seconds
   - Use visual hierarchy (Notable Shifts is primary card)
   - Limit to 2-4 bullet points in Notable Shifts
   - Use icons, badges, and color sparingly for emphasis

2. **Neutral aesthetic**: Avoid semantic colors for metrics (no green="good", red="bad")
   - Use arrows for direction (↑/↓)
   - Use neutral grays for delta chips
   - Highlight only when comparing windows

3. **Progressive disclosure**: Don't show everything at once
   - Hide Context Comparisons if sample size insufficient
   - Show empty states with clear next steps
   - Collapse less-important sections

4. **Consistency**: Reuse existing UI components
   - Card variants: default/elevated/callout
   - MetricStrip for 3-column layouts
   - Badge for delta chips
   - BottomSheet for time window selector

### Component Reuse

**Existing components to leverage**:
- `Card` - Section containers
- `MetricStrip` - 3-column metric display
- `Badge` - Delta indicators
- `VerticalStack` - Layout spacing
- `MicroChart` - Sparkline visualization (Recharts)
- `BottomSheet` - Time window selector
- `IconButton` - Header actions

**New components to create**:
- `NotableShiftsCard` - Primary insight display
- `EnergyResponseCard` - 3-metric display with deltas
- `RecoverySignalsCard` - 2x2 soreness grid
- `ContextComparisonsCard` - Category breakdowns
- `RecentSessionsList` - Latest sessions preview
- `DeltaChip` - Micro-component for comparison badges

---

## Technical Considerations

### Architecture

1. **Single aggregation module**: Create `lib/analytics/dashboard-metrics.ts` with:
   - `getDashboardData(sessions, daysBack)` - Main function
   - `calculateTimeWindows()` - Window calculation with sample-size logic
   - `computeWindowMetrics()` - Metric computation for one window
   - `compareWindows()` - Delta calculation between windows
   - `detectNotableShifts()` - Threshold-based shift detection

2. **Computation strategy**: Use `useMemo` in Dashboard component to cache computed data
   - Recompute only when `sessions` or `daysBack` changes
   - Early returns for empty states (< 4 sessions)

3. **Code reuse**: Leverage existing patterns from:
   - `lib/ai/aggregator.ts` - Distribution computation, soreness frequency calculation
   - `lib/insights/rule-based-generator.ts` - Window comparisons, `avg()`, `directionFromDelta()`

### Data Flow

```
useSessionLogs()
  → LocalSessionLog[]
    → useMemo(() => getDashboardData(sessions, daysBack))
      → DashboardData
        → Pass to child components via props
```

### Performance

1. **Efficient filtering**: Filter sessions once at start of `getDashboardData`, pass filtered arrays to sub-functions
2. **Lazy computation**: Skip category breakdowns if sample size insufficient (don't compute if not shown)
3. **Memoization**: Cache `avg()` results, reuse within `computeWindowMetrics`

### Database Schema Changes

**IndexedDB (Dexie)**:
- Bump version to 3
- Add `sorenessHands: SorenessLevel` to `LocalSessionLog` interface
- Migration: Set `sorenessHands = 0` for all existing records

**Supabase**:
- Add column: `soreness_hands INTEGER DEFAULT 0 CHECK (soreness_hands >= 0 AND soreness_hands <= 3)`
- Update type mappings in `lib/db/supabase.ts`: `soreness_hands ↔ sorenessHands`

### Dependencies

- **date-fns** (or custom helpers): `subDays()`, `isBetween()`, `formatDateRange()`
- **Recharts**: Sparkline visualization in Energy Response (already installed)
- **Framer Motion**: Optional entrance animations for cards (already used in app)

---

## Success Metrics

1. **Primary metric**: Users can answer "What changed recently?" in <5 seconds
   - Measured via usability testing (target: 90% success rate)

2. **Engagement**: Dashboard becomes the most-visited page
   - Track page views: expect 40%+ of sessions to include Dashboard view

3. **Data quality**: Users log more sessions to unlock comparisons
   - Measure: % of users with ≥10 sessions increases from X% to Y%

4. **Insight clarity**: Users don't ask "What does this mean?"
   - If confusion persists, Notable Shifts detection logic is too weak or hidden
   - Track: support questions or in-app feedback about Dashboard

5. **Time window usage**: Users engage with time window selector
   - Track: % of Dashboard views that switch from default 14-day window

---

## Open Questions

1. **Sparkline data resolution**: Should sparkline show last 8, 10, or 12 sessions? (Decision: Start with 10, adjust based on visual density)

2. **Mental tags display**: Top 2 or top 3 tags in Recent Activity Summary? (Decision: Top 2 to keep compact)

3. **Category comparison priority**: If both Singles/Doubles and Intensity comparisons are available but we show max 2 cards, which takes priority? (Decision: Show both if space allows, otherwise prioritize format comparison)

4. **Empty state CTA**: Should "Log Session" button open QuickLogForm modal or navigate to /history page? (Decision: Navigate to /history for consistency)

5. **Baseline messaging**: When using dynamic split (< 10 sessions), should we say "vs previous sessions" instead of "vs prior period"? (Decision: Yes, be explicit about split type)

6. **Notable shifts limit**: If exactly 4 shifts detected, show all 4 or limit to 3? (Decision: Show all 4 if tied for 4th place, otherwise top 3)

---

## Acceptance Criteria

### User can answer these questions in <5 seconds:

✅ **"Did anything change recently?"** → Notable Shifts card answers this with 2-4 bullet points

✅ **"How did I respond to play (energy delta)?"** → Energy Response shows before/after/delta with comparison to baseline

✅ **"Any recovery signals trending up/down?"** → Recovery Signals shows soreness frequency changes by body area

### Technical acceptance:

✅ All TypeScript builds pass with no type errors

✅ Dashboard renders correctly in all empty states (0, 1-3, 4-9, 10+ sessions)

✅ Sample-size gating works: comparisons hidden when recent < 3 or baseline < 3

✅ Notable shifts detection triggers correctly for test data (manufactured energy spike, soreness change, format shift)

✅ Time window selector switches between 7/14/28 days and metrics recalculate

✅ Neutral language audit passes: no instances of "improved", "worse", "should" in UI text

✅ Hands soreness field added to data model, form, and database schema

✅ IndexedDB migration runs successfully, existing sessions get `sorenessHands = 0`

---

## Implementation Phases (High-Level)

1. **Phase 1**: Data model extension (add hands soreness field)
2. **Phase 2**: Core analytics module (`lib/analytics/dashboard-metrics.ts`)
3. **Phase 3**: UI components (NotableShiftsCard, EnergyResponseCard, etc.)
4. **Phase 4**: Dashboard page refactor (integrate new components)
5. **Phase 5**: Polish & testing (sparkline, neutral language audit, edge cases)

**Estimated effort**: 12-17 hours for a mid-level developer

---

## References

- Existing Dashboard: `app/(main)/dashboard/page.tsx`
- Data aggregation patterns: `lib/ai/aggregator.ts`, `lib/insights/rule-based-generator.ts`
- Session data model: `types/index.ts`, `lib/db/local-db.ts`
- UI components: `src/components/domain/`, `src/components/ui/`
