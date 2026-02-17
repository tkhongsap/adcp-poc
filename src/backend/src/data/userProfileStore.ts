import * as fs from 'fs';
import * as path from 'path';
import type { UserProfile, UserInsight, InsightCategory } from '../types/data.js';

// Path to user profiles directory - relative to workspace root
const PROFILES_DIR = path.resolve(process.cwd(), '../../data/user_profiles');

/**
 * Ensure the user profiles directory exists
 */
export function initProfilesDirectory(): void {
  try {
    if (!fs.existsSync(PROFILES_DIR)) {
      fs.mkdirSync(PROFILES_DIR, { recursive: true });
      console.log(`Created user profiles directory: ${PROFILES_DIR}`);
    }
  } catch (error) {
    console.error('Failed to create user profiles directory:', error);
  }
}

/**
 * Get the file path for a user profile
 */
function getProfilePath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(PROFILES_DIR, `${safeId}.json`);
}

/**
 * Load a user profile from disk
 */
export function loadProfile(userId: string): UserProfile | null {
  try {
    const filePath = getProfilePath(userId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as UserProfile;
  } catch (error) {
    console.error(`Failed to load profile ${userId}:`, error);
    return null;
  }
}

/**
 * Save a user profile to disk
 */
export function saveProfile(profile: UserProfile): void {
  try {
    initProfilesDirectory();
    const filePath = getProfilePath(profile.userId);
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save profile ${profile.userId}:`, error);
  }
}

/**
 * Get or create a user profile
 */
export function getOrCreateProfile(userId: string): UserProfile {
  const existing = loadProfile(userId);
  if (existing) return existing;

  const profile: UserProfile = {
    userId,
    insights: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveProfile(profile);
  return profile;
}

/**
 * Add or reinforce an insight in a user profile.
 * If an insight with the same category and value already exists,
 * its confidence and reinforcement count are increased.
 */
export function addInsight(
  userId: string,
  category: InsightCategory,
  value: string,
  conversationId: string,
  confidence: number = 0.7
): UserProfile {
  const profile = getOrCreateProfile(userId);
  const normalizedValue = value.toLowerCase().trim();

  // Check for existing insight with same category and value
  const existing = profile.insights.find(
    (i) => i.category === category && i.value.toLowerCase().trim() === normalizedValue
  );

  if (existing) {
    // Reinforce: bump confidence (cap at 1.0), increment count
    existing.confidence = Math.min(1.0, existing.confidence + 0.1);
    existing.lastReinforcedAt = new Date().toISOString();
    existing.reinforcementCount += 1;
  } else {
    const insight: UserInsight = {
      id: `ins_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      category,
      value,
      confidence,
      extractedFrom: conversationId,
      createdAt: new Date().toISOString(),
      lastReinforcedAt: new Date().toISOString(),
      reinforcementCount: 1,
    };
    profile.insights.push(insight);
  }

  profile.updatedAt = new Date().toISOString();
  saveProfile(profile);
  return profile;
}

/**
 * Get insights for a user, optionally filtered by category.
 * Returns insights sorted by confidence (highest first).
 */
export function getInsights(userId: string, category?: InsightCategory): UserInsight[] {
  const profile = loadProfile(userId);
  if (!profile) return [];

  let insights = profile.insights;
  if (category) {
    insights = insights.filter((i) => i.category === category);
  }

  return insights.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Build a context string from user insights for injection into the system prompt.
 * Only includes insights above a confidence threshold.
 */
export function buildUserContext(userId: string, confidenceThreshold: number = 0.5): string {
  const profile = loadProfile(userId);
  if (!profile || profile.insights.length === 0) return '';

  const relevant = profile.insights.filter((i) => i.confidence >= confidenceThreshold);
  if (relevant.length === 0) return '';

  const grouped: Record<string, string[]> = {};
  for (const insight of relevant) {
    if (!grouped[insight.category]) {
      grouped[insight.category] = [];
    }
    grouped[insight.category].push(insight.value);
  }

  const lines: string[] = ['User Context (from previous interactions):'];

  const labelMap: Record<string, string> = {
    role: 'Role',
    brand_focus: 'Brand focus',
    metric_preference: 'Preferred metrics',
    platform_preference: 'Platform preference',
    concern: 'Key concerns',
    goal: 'Goals',
    communication_style: 'Communication style',
  };

  for (const [category, values] of Object.entries(grouped)) {
    const label = labelMap[category] || category;
    lines.push(`- ${label}: ${values.join(', ')}`);
  }

  return lines.join('\n');
}

// Initialize directory on module load
initProfilesDirectory();
