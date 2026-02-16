# Tasks: Add Hands to Soreness Tracking

## Relevant Files

- `types/index.ts` - Contains TypeScript interfaces for SessionLog, SessionLogFormData, and AggregatedData that need to include hands
- `components/session-log/SorenessInput.tsx` - Main UI component for soreness tracking that needs hands added
- `components/session-log/QuickLogForm.tsx` - Form component that uses SorenessInput and manages state
- `lib/db/local-db.ts` - Local database schema definition (IndexedDB/Dexie)
- `lib/ai/aggregator.ts` - Data aggregation logic that calculates soreness frequency
- `supabase/migrations/` - Database migration files for Supabase schema changes

### Notes

- This feature follows existing patterns for Knees, Shoulder, and Back
- Hands should appear **first** in the soreness list
- No unit tests currently exist in the project (based on codebase exploration)
- Run `npm run build` locally before pushing to catch TypeScript errors

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch (e.g., `git checkout -b feature/hands-soreness-tracking`)

- [x] 1.0 Update TypeScript type definitions
  - [x] 1.1 Read `types/index.ts` to understand current structure
  - [x] 1.2 Add `sorenessHands: SorenessLevel` to `SessionLog` interface (around line 34)
  - [x] 1.3 Add `sorenessHands: SorenessLevel` to `SessionLogFormData` interface (around line 95)
  - [x] 1.4 Add `hands: Record<string, number>` to `sorenessFrequency` object in `AggregatedData` interface (around line 129)

- [x] 2.0 Update SorenessInput component
  - [x] 2.1 Read `components/session-log/SorenessInput.tsx` to understand current implementation
  - [x] 2.2 Add `hands: SorenessLevel` to `SorenessInputProps` interface
  - [x] 2.3 Add `onHandsChange: (value: SorenessLevel) => void` to `SorenessInputProps` interface
  - [x] 2.4 Update `BODY_AREAS` type to include `'hands'` in the key union type
  - [x] 2.5 Add `{ key: 'hands', label: 'Hands' }` to `BODY_AREAS` array at index 0 (first position)
  - [x] 2.6 Add `hands` to the destructured props in function signature
  - [x] 2.7 Add `onHandsChange` to the destructured props in function signature
  - [x] 2.8 Add `hands` to the `values` object
  - [x] 2.9 Add `hands: onHandsChange` to the `handlers` object

- [x] 3.0 Update QuickLogForm component
  - [x] 3.1 Read `components/session-log/QuickLogForm.tsx` to understand current state management
  - [x] 3.2 Add state variable for `sorenessHands` with initial value of 0
  - [x] 3.3 Add `hands={sorenessHands}` prop to `SorenessInput` component usage
  - [x] 3.4 Add `onHandsChange={setSorenessHands}` handler prop to `SorenessInput` component usage
  - [x] 3.5 Include `sorenessHands` in the form data object when saving session logs

- [x] 4.0 Create database migration
  - [x] 4.1 Read existing migration files in `supabase/migrations/` to understand schema structure and naming convention
  - [x] 4.2 Create new migration file with appropriate naming (e.g., `XXX_add_soreness_hands.sql`)
  - [x] 4.3 Add `soreness_hands` column to `session_logs` table with same type as other soreness columns
  - [x] 4.4 Set default value to 0 and add NOT NULL constraint if applicable
  - [x] 4.5 Read `lib/db/local-db.ts` to understand IndexedDB schema
  - [x] 4.6 Update local database schema to include `sorenessHands` field in the sessions table definition

- [x] 5.0 Update data aggregation logic
  - [x] 5.1 Read `lib/ai/aggregator.ts` to understand how soreness frequency is calculated
  - [x] 5.2 Add hands to the soreness frequency calculation loop/logic
  - [x] 5.3 Ensure `hands: Record<string, number>` is included in the returned `sorenessFrequency` object
  - [x] 5.4 Verify the aggregation follows the same pattern as knees, shoulder, and back

- [ ] 6.0 Test the implementation
  - [ ] 6.1 Start the development server and navigate to the session logging page
  - [ ] 6.2 Verify "Hands" appears first in the soreness list (before Knees, Shoulder, Back)
  - [ ] 6.3 Verify all 4 soreness levels (None, Low, Moderate, High) are selectable for Hands
  - [ ] 6.4 Verify color coding matches other body parts (yellow, orange, red)
  - [ ] 6.5 Create a new session log with hands soreness set to a non-zero value
  - [ ] 6.6 Verify the session saves successfully
  - [ ] 6.7 View the saved session in history and confirm hands soreness displays correctly
  - [ ] 6.8 Check browser console and database to verify hands data is persisted
  - [ ] 6.9 Verify aggregated data includes hands in soreness frequency (check insights or analytics)

- [ ] 7.0 Build and deploy
  - [x] 7.1 Run `npm run build` locally to check for TypeScript errors
  - [x] 7.2 Fix any TypeScript compilation errors if they occur
  - [x] 7.3 Verify build completes successfully with no errors
  - [x] 7.4 Stage changes: `git add .`
  - [x] 7.5 Commit changes with descriptive message (e.g., "feat: add hands to soreness tracking")
  - [x] 7.6 Push to Git to trigger Vercel deployment
  - [ ] 7.7 Monitor Vercel deployment and verify it succeeds
