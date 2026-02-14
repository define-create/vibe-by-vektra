/**
 * Zen Precision Bottom Navigation
 * 4 tabs: Dashboard, Journeys, Insights, Add
 * Height 56-64px, labels always visible, min 48px tap targets
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Lightbulb, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/journeys', icon: Target, label: 'Journeys' },
  { href: '/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/', icon: Plus, label: 'Add' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-1 border-t border-divider z-50 safe-area-inset">
      <div className="flex items-center justify-around h-16 max-w-4xl mx-auto px-xs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-xs flex-1 min-h-tap-target transition-colors duration-fast ease-standard',
                isActive
                  ? 'text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-meta-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
