import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { AggregatedData, InsightArtifact } from '@/types';
import { INSIGHT_SYSTEM_PROMPT, buildInsightPrompt, sanitizeInsightLanguage } from './prompt-templates';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Zod schema for validating AI output
const InsightArtifactSchema = z.object({
  title: z.string().min(5).max(80),
  observation_text: z.string().min(10).max(500),
  confidence: z.enum(['low', 'medium', 'high']),
  evidence_summary: z.string().optional(),
  metrics: z.record(z.string(), z.any()).optional(),
});

const InsightsArraySchema = z.array(InsightArtifactSchema).min(3).max(7);

/**
 * Generate AI insights from aggregated session data
 */
export async function generateInsights(
  aggregatedData: AggregatedData
): Promise<Omit<InsightArtifact, 'id' | 'runId' | 'createdAt'>[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  if (aggregatedData.sessionsCount < 3) {
    throw new Error('Minimum 3 sessions required for meaningful insights');
  }

  try {
    const userPrompt = buildInsightPrompt(aggregatedData);

    console.log('[Insights] Generating insights with Claude...');
    console.log(`[Insights] Sessions: ${aggregatedData.sessionsCount}, Window: ${aggregatedData.windowDays} days`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent, factual output
      system: INSIGHT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const rawText = content.text;

    // Parse JSON response
    let insights;
    try {
      // Claude might wrap JSON in markdown code blocks, so strip those
      const jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[Insights] Failed to parse AI response:', rawText);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate with Zod
    const validatedInsights = InsightsArraySchema.parse(insights);

    // Sanitize and format
    const formattedInsights = validatedInsights.map((insight) => ({
      title: sanitizeInsightLanguage(insight.title),
      observationText: sanitizeInsightLanguage(insight.observation_text),
      confidence: insight.confidence,
      evidenceSummary: insight.evidence_summary,
      metrics: insight.metrics,
    }));

    console.log(`[Insights] Generated ${formattedInsights.length} insights successfully`);

    return formattedInsights;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('[Insights] Anthropic API error:', {
        status: error.status,
        message: error.message,
      });

      if (error.status === 429) {
        throw new Error('AI service rate limit reached. Please try again later.');
      }

      if (error.status === 401) {
        throw new Error('AI service authentication failed. Please contact support.');
      }

      throw new Error(`AI service error: ${error.message}`);
    }

    if (error instanceof z.ZodError) {
      console.error('[Insights] Validation error:', error.issues);
      throw new Error('AI returned insights in unexpected format');
    }

    console.error('[Insights] Unexpected error:', error);
    throw error;
  }
}

/**
 * Test function to verify AI integration (development only)
 */
export async function testInsightGeneration(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test function not available in production');
  }

  const mockData: AggregatedData = {
    sessionsCount: 10,
    windowStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date().toISOString(),
    windowDays: 14,
    avgEnergyBefore: 3.2,
    avgEnergyAfter: 4.1,
    energyDeltaAvg: 0.9,
    energyDeltaMin: -1,
    energyDeltaMax: 2,
    avgMoodBefore: 3.5,
    avgMoodAfter: 4.2,
    moodDeltaAvg: 0.7,
    moodDeltaMin: -1,
    moodDeltaMax: 2,
    intensityDistribution: { casual: 4, moderate: 4, competitive: 2 },
    formatDistribution: { singles: 6, doubles: 4 },
    environmentDistribution: { indoor: 8, outdoor: 2 },
    sorenessFrequency: {
      knees: { none: 7, low: 2, moderate: 1, high: 0 },
      shoulder: { none: 9, low: 1, moderate: 0, high: 0 },
      back: { none: 8, low: 2, moderate: 0, high: 0 },
    },
    mentalTagsFrequency: {
      focused: 6,
      'flow-state': 3,
      distracted: 2,
    },
    formatComparisons: {
      singles: { count: 6, avgEnergyDelta: 0.7, avgMoodDelta: 0.5 },
      doubles: { count: 4, avgEnergyDelta: 1.2, avgMoodDelta: 1.0 },
    },
    environmentComparisons: {
      indoor: { count: 8, avgEnergyDelta: 0.9, avgMoodDelta: 0.7 },
      outdoor: { count: 2, avgEnergyDelta: 0.8, avgMoodDelta: 0.6 },
    },
    intensityComparisons: {
      casual: { count: 4, avgEnergyDelta: 1.2, avgMoodDelta: 0.9 },
      moderate: { count: 4, avgEnergyDelta: 0.8, avgMoodDelta: 0.6 },
      competitive: { count: 2, avgEnergyDelta: 0.4, avgMoodDelta: 0.5 },
    },
    avgDurationMinutes: 60,
  };

  const insights = await generateInsights(mockData);
  console.log('[Test] Generated insights:', JSON.stringify(insights, null, 2));
}
