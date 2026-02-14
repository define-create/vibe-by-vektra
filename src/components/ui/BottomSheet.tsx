/**
 * Zen Precision Bottom Sheet
 * For filters/date pickers
 * Backdrop 40%, slide up/down transitions
 */

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  snapPoint?: '40%' | '90%';
}

export function BottomSheet({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  snapPoint = '40%',
}: BottomSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Backdrop */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-overlay-backdrop z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
              />
            </DialogPrimitive.Overlay>

            {/* Sheet */}
            <DialogPrimitive.Content asChild>
              <motion.div
                className={cn(
                  'fixed bottom-0 left-0 right-0 z-50',
                  'bg-surface-2 rounded-t-lg',
                  'max-w-4xl mx-auto'
                )}
                style={{
                  height: snapPoint === '40%' ? '40vh' : '90vh',
                  minHeight: snapPoint === '40%' ? '300px' : '500px',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-sm pb-xs">
                  <div className="w-10 h-1 bg-divider rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-md pb-md border-b border-divider">
                  {title && (
                    <DialogPrimitive.Title className="text-section text-text-primary">
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  <DialogPrimitive.Close asChild>
                    <IconButton icon={<X size={20} />} label="Close" />
                  </DialogPrimitive.Close>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-md" style={{ maxHeight: 'calc(100% - 80px)' }}>
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
