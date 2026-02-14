/**
 * Session Logging Page - Updated with Zen Precision styling
 */

import { QuickLogForm } from '@/components/session-log/QuickLogForm';
import { ScreenContainer } from '@/src/components/layout/ScreenContainer';

export default function HomePage() {
  return (
    <ScreenContainer
      title="Log Session"
      subtitle="Quick post-session reflection"
    >
      <QuickLogForm />
    </ScreenContainer>
  );
}
