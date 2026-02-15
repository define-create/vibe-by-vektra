# PRD: Add Hands to Soreness Tracking

## 1. Introduction/Overview

This feature adds the ability to track soreness levels for "Hands" to the existing Soreness card, complementing the current tracking for Knees, Shoulder, and Back. The feature enables users to log and monitor hand soreness across their pickleball sessions, providing a more comprehensive view of physical well-being.

**Problem it solves:** Users currently cannot track hand soreness (from gripping the paddle, falls, etc.) even though hands are a critical body part affected by pickleball activities.

**Goal:** Enable users to track hand soreness using the same proven interface and data model as existing body parts.

## 2. Goals

1. Add "Hands" as a trackable body part in the Soreness card
2. Position Hands at the top of the soreness list for easy access
3. Maintain visual and functional consistency with existing soreness tracking (Knees, Shoulder, Back)
4. Ensure the feature works seamlessly across the entire data pipeline (UI → database → analytics)

## 3. User Stories

**As a pickleball player**, I want to track my hand soreness levels after each session so that I can monitor grip-related fatigue and potential injury risks.

**As a user reviewing my session history**, I want to see hand soreness data displayed consistently with other body parts so that I can easily compare trends across different areas.

**As a user viewing insights**, I want hand soreness to be included in aggregated data and analytics so that I can understand patterns related to hand strain.

## 4. Functional Requirements

### 4.1 UI Component Updates

1. The `SorenessInput` component must include "Hands" as a body area option
2. "Hands" must appear **first** in the list (before Knees, Shoulder, Back)
3. The Hands soreness selector must display the same 4 levels: None (0), Low (1), Moderate (2), High (3)
4. The Hands selector must use the same color-coding system:
   - None: `border-border bg-secondary`
   - Low: `border-yellow-500/30 bg-yellow-500/10 text-yellow-500`
   - Moderate: `border-orange-500/30 bg-orange-500/10 text-orange-500`
   - High: `border-red-500/30 bg-red-500/10 text-red-500`
5. The component must accept `hands` prop and `onHandsChange` handler following the same pattern as other body parts

### 4.2 Data Model Updates

6. Add `sorenessHands: SorenessLevel` field to the `SessionLog` interface
7. Add `sorenessHands: SorenessLevel` field to the `SessionLogFormData` interface
8. Add `hands: Record<string, number>` to the `sorenessFrequency` object in `AggregatedData` interface
9. Database schema must include a `soreness_hands` column with the same constraints as other soreness columns (likely a smallint or similar type)

### 4.3 Component Integration

10. The `QuickLogForm` component (or wherever `SorenessInput` is used) must:
    - Include state for hands soreness value
    - Pass the hands value and change handler to `SorenessInput`
    - Include hands data when saving session logs

### 4.4 Data Aggregation

11. The aggregation logic must include hands soreness frequency in the same manner as knees, shoulder, and back
12. Any analytics or insights generation must treat hands soreness equally to other body parts

## 5. Non-Goals (Out of Scope)

- **No changes to soreness levels**: The existing 4-level scale (0-3) remains unchanged
- **No left/right hand distinction**: Unlike some tracking systems, this feature tracks overall hand soreness, not individual hands
- **No UI redesign**: The Soreness card layout, styling, and interaction patterns remain the same
- **No changes to historical data**: Existing sessions without hands data will simply show null/0 for hands
- **No special analytics for hands**: Hands will be treated the same as other body parts in insights generation

## 6. Design Considerations

### Visual Consistency
- Hands must use the exact same button style, layout (4-column grid), and color scheme as other body parts
- The label "Hands" should use the same text styling (`text-sm text-muted-foreground`)
- Spacing between Hands and other body areas should match existing spacing (likely `space-y-3`)

### Accessibility
- The Hands buttons must include proper `aria-label` attributes (e.g., "Hands None", "Hands Low")
- Focus states must match existing implementation

## 7. Technical Considerations

### Files to Modify

1. **[components/session-log/SorenessInput.tsx](components/session-log/SorenessInput.tsx)**
   - Add `hands` to `SorenessInputProps` interface
   - Add `onHandsChange` to `SorenessInputProps` interface
   - Update `BODY_AREAS` array to include `{ key: 'hands', label: 'Hands' }` at index 0
   - Update the `values` and `handlers` objects to include hands

2. **[types/index.ts](types/index.ts)**
   - Add `sorenessHands: SorenessLevel;` to `SessionLog` interface (line ~34)
   - Add `sorenessHands: SorenessLevel;` to `SessionLogFormData` interface (line ~95)
   - Add `hands: Record<string, number>;` to `sorenessFrequency` in `AggregatedData` interface (line ~129)

3. **[components/session-log/QuickLogForm.tsx](components/session-log/QuickLogForm.tsx)** (or similar form component)
   - Add state management for hands soreness
   - Pass hands props to `SorenessInput` component
   - Include hands data in form submission

4. **Database Migration**
   - Create migration to add `soreness_hands` column to session logs table
   - Should mirror the data type and constraints of `soreness_knees`, `soreness_shoulder`, `soreness_back`

5. **Aggregation Logic** ([lib/ai/aggregator.ts](lib/ai/aggregator.ts) or similar)
   - Update soreness frequency calculations to include hands

### Data Migration
- No backfill required for historical data (hands soreness will be null/0 for old sessions)
- Default value should be 0 (None) for new sessions

### Testing Considerations
- Test that hands soreness can be selected and saved
- Verify hands appears first in the UI
- Confirm hands data persists to database correctly
- Check that aggregated data includes hands in soreness frequency
- Validate TypeScript types compile without errors

## 8. Success Metrics

1. **Functional Success**: Users can successfully log hands soreness values (0-3) in new session logs
2. **Data Integrity**: Hands soreness data is correctly stored in the database and retrieved in session history
3. **UI Consistency**: Hands appears first in the soreness list and matches the styling of other body parts
4. **Analytics Integration**: Aggregated data includes hands in sorenessFrequency calculations
5. **Zero Regressions**: Existing soreness tracking for Knees, Shoulder, and Back continues to work identically

## 9. Open Questions

1. **Database Column Name**: Should the database column be `soreness_hands` (consistent with snake_case) or `sorenessHands` (consistent with TypeScript)?
   - *Assumption*: Use `soreness_hands` to match existing columns (`soreness_knees`, `soreness_shoulder`, `soreness_back`)

2. **Default Value**: What should the default hands soreness value be for new sessions?
   - *Recommendation*: Default to 0 (None) to match likely user expectation

3. **Form Validation**: Should hands soreness be required, or can it remain unselected?
   - *Assumption*: Optional like other soreness fields (defaults to 0 if not explicitly set)

4. **Icon/Emoji**: Do the current body areas use icons? Should hands have a specific icon?
   - *Note*: Based on the code review, no icons are currently used—only text labels. Keep it consistent.

---

**Target Implementation Audience**: Junior Developer
**Estimated Complexity**: Low (straightforward addition following existing patterns)
**Dependencies**: None (self-contained feature addition)
