/**
 * Main Layout - Updated with Zen Precision BottomNav
 */

import { BottomNav } from '@/src/components/ui/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
