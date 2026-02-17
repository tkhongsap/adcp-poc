import type { InsightCategory } from '../types/data.js';
import { addInsight } from '../data/userProfileStore.js';

interface ExtractionPattern {
  category: InsightCategory;
  patterns: RegExp[];
  extractor: (match: RegExpMatchArray) => string;
  confidence: number;
}

const EXTRACTION_PATTERNS: ExtractionPattern[] = [
  // Role detection
  {
    category: 'role',
    patterns: [
      /\bi(?:'m| am) (?:a |the )?(.+?(?:buyer|manager|director|planner|analyst|strategist|coordinator|specialist|executive|vp|cmo|cto|head of)[^,.\n]*)/i,
      /\bmy role is (.+?)(?:\.|,|$)/i,
      /\bi work as (?:a |the )?(.+?)(?:\.|,|$)/i,
    ],
    extractor: (match) => match[1].trim(),
    confidence: 0.8,
  },

  // Brand focus detection
  {
    category: 'brand_focus',
    patterns: [
      /\bi(?:'m| am) (?:working on|managing|responsible for|focused on|handling) (?:the )?(.+?)(?:'s| campaign| campaigns| account| brand)?(?:\.|,|$)/i,
      /\bmy (?:main |primary )?(?:brand|client|account) is (.+?)(?:\.|,|$)/i,
    ],
    extractor: (match) => match[1].trim(),
    confidence: 0.75,
  },

  // Metric preference detection
  {
    category: 'metric_preference',
    patterns: [
      /\bi (?:care about|focus on|track|watch|monitor|prioritize|look at) (?:mainly |mostly |primarily )?(.+?)(?:\.|,|$)/i,
      /\b(?:most important|key) (?:metric|kpi|indicator)s? (?:for me |to me )?(?:is|are) (.+?)(?:\.|,|$)/i,
      /\bshow me (?:the )?(.+?)(?:\.|,| for|$)/i,
    ],
    extractor: (match) => match[1].trim(),
    confidence: 0.65,
  },

  // Platform preference detection
  {
    category: 'platform_preference',
    patterns: [
      /\bi (?:mainly |mostly |primarily )?(?:use|work with|manage|run) (.+?)(?:\.|,|$)/i,
      /\bmy (?:main |primary )?platform is (.+?)(?:\.|,|$)/i,
    ],
    extractor: (match) => match[1].trim(),
    confidence: 0.7,
  },

  // Concern detection
  {
    category: 'concern',
    patterns: [
      /\bi(?:'m| am) (?:worried|concerned|anxious) about (.+?)(?:\.|,|$)/i,
      /\bmy (?:main |biggest )?concern is (.+?)(?:\.|,|$)/i,
      /\bwe(?:'re| are) (?:struggling|having issues|having trouble) with (.+?)(?:\.|,|$)/i,
    ],
    extractor: (match) => match[1].trim(),
    confidence: 0.7,
  },

  // Goal detection
  {
    category: 'goal',
    patterns: [
      /\bi (?:want|need|am trying) to (.+?)(?:\.|,|$)/i,
      /\bour goal is to (.+?)(?:\.|,|$)/i,
      /\bwe(?:'re| are) (?:trying|aiming|looking) to (.+?)(?:\.|,|$)/i,
    ],
    extractor: (match) => match[1].trim(),
    confidence: 0.6,
  },

  // Communication style detection
  {
    category: 'communication_style',
    patterns: [
      /\b(?:give me|i (?:want|prefer|like)) (?:the )?(?:short|brief|concise|detailed|comprehensive|simple|executive)(?:\s+(?:summary|version|overview|answer))?/i,
      /\bjust (?:the )?(?:numbers|data|highlights|summary|bottom line)/i,
    ],
    extractor: (match) => match[0].trim(),
    confidence: 0.6,
  },
];

/**
 * Extract insights from a user message and persist them.
 * Returns the list of newly extracted insights (category + value pairs).
 */
export function extractInsights(
  userMessage: string,
  userId: string,
  conversationId: string
): Array<{ category: InsightCategory; value: string }> {
  const extracted: Array<{ category: InsightCategory; value: string }> = [];

  for (const pattern of EXTRACTION_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = userMessage.match(regex);
      if (match) {
        const value = pattern.extractor(match);
        // Skip very short or very long extractions (likely noise)
        if (value.length >= 3 && value.length <= 100) {
          addInsight(userId, pattern.category, value, conversationId, pattern.confidence);
          extracted.push({ category: pattern.category, value });
        }
        // Only match the first pattern per category to avoid duplicates
        break;
      }
    }
  }

  return extracted;
}
