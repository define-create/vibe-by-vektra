/**
 * Micro Chart Component
 * Clean sparkline visualization for timeline insights
 * Week 2 feature: visual evidence for rule-based insights
 */

'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartSeries } from '@/lib/insights/rule-based-generator';
import { colors } from '@/src/tokens/colors';

export interface MicroChartProps {
  series: ChartSeries;
  height?: number;
  className?: string;
}

export function MicroChart({ series, height = 60, className }: MicroChartProps) {
  // Transform ChartSeries to Recharts format
  const data = series.points.map(point => ({
    name: point.x,
    value: point.y,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, delay: 0.18 }}
      className={className}
    >
      <div className="relative" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
          >
            {/* Gradient fill under line */}
            <defs>
              <linearGradient id="microChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent.primary} stopOpacity={0.2} />
                <stop offset="100%" stopColor={colors.accent.primary} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Tooltip on hover */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="px-sm py-xs bg-surface-2 border border-border rounded-md">
                    <p className="text-meta-sm text-text-primary font-medium">
                      {payload[0].payload.name}: {payload[0].value}
                    </p>
                    <p className="text-meta-sm text-text-secondary">
                      {series.name}
                    </p>
                  </div>
                );
              }}
              cursor={{ stroke: colors.text.disabled, strokeWidth: 1 }}
            />

            {/* Line with gradient fill */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.accent.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: colors.accent.primary,
                stroke: colors.bg.primary,
                strokeWidth: 2,
              }}
              fill="url(#microChartGradient)"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Series label */}
        <div className="mt-xs">
          <p className="text-meta-sm text-text-disabled">{series.name}</p>
        </div>
      </div>
    </motion.div>
  );
}
