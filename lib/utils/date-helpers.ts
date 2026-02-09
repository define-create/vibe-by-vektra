import { format, formatDistance, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export const dateHelpers = {
  // Format dates for display
  formatSessionDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM d, yyyy');
  },

  formatSessionDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM d, yyyy h:mm a');
  },

  formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true });
  },

  // Get date ranges for insights
  getDateRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = subDays(end, days);
    return { start, end };
  },

  getDateRangeStrings(days: number): { start: string; end: string } {
    const { start, end } = this.getDateRange(days);
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  },

  // Get start and end of day (for quota checks)
  getTodayRange(): { start: Date; end: Date } {
    const now = new Date();
    return {
      start: startOfDay(now),
      end: endOfDay(now)
    };
  },

  // Get start and end of current month (for quota checks)
  getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  },

  // Calculate minutes since a timestamp
  minutesSince(timestamp: Date | string): number {
    const d = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
  },

  // Check if date is today
  isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  },

  // Get ISO string for current time
  now(): string {
    return new Date().toISOString();
  }
};
