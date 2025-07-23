import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CachedQuestionSet {
  id: string;
  role: string;
  experienceLevel: string;
  responseFormat: string;
  questions: any[];
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  hash: string; // For identifying similar question sets
}

// Generate a hash for question set parameters
export function generateQuestionSetHash(params: {
  role: string;
  experienceLevel: string;
  responseFormat: string;
  resumeText?: string;
  jobDescriptionText?: string;
}): string {
  const { role, experienceLevel, responseFormat, resumeText, jobDescriptionText } = params;

  // Create a simple hash based on the parameters
  const content = `${role.toLowerCase()}-${experienceLevel}-${responseFormat}-${resumeText ? 'resume' : 'no-resume'}-${jobDescriptionText ? 'jd' : 'no-jd'}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

// Check if we have cached questions for similar parameters
export async function getCachedQuestions(params: {
  role: string;
  experienceLevel: string;
  responseFormat: string;
  resumeText?: string;
  jobDescriptionText?: string;
}): Promise<any[] | null> {
  try {
    const hash = generateQuestionSetHash(params);

    const { data, error } = await supabase
      .from('question_cache')
      .select('*')
      .eq('hash', hash)
      .eq('role', params.role)
      .eq('experience_level', params.experienceLevel)
      .eq('response_format', params.responseFormat)
      .order('usage_count', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    // Update usage count and last used
    await supabase
      .from('question_cache')
      .update({
        usage_count: data.usage_count + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', data.id);

    return data.questions;
  } catch (error) {
    console.error('Error fetching cached questions:', error);
    return null;
  }
}

// Cache generated questions
export async function cacheQuestions(
  questions: any[],
  params: {
    role: string;
    experienceLevel: string;
    responseFormat: string;
    resumeText?: string;
    jobDescriptionText?: string;
  }
): Promise<void> {
  try {
    const hash = generateQuestionSetHash(params);

    const { error } = await supabase
      .from('question_cache')
      .insert({
        role: params.role,
        experience_level: params.experienceLevel,
        response_format: params.responseFormat,
        questions: questions,
        usage_count: 1,
        last_used: new Date().toISOString(),
        hash: hash
      });

    if (error) {
      console.error('Error caching questions:', error);
    }
  } catch (error) {
    console.error('Error caching questions:', error);
  }
}

// Get popular question sets for a role
export async function getPopularQuestionSets(role: string, limit: number = 5): Promise<CachedQuestionSet[]> {
  try {
    const { data, error } = await supabase
      .from('question_cache')
      .select('*')
      .eq('role', role)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular question sets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching popular question sets:', error);
    return [];
  }
}

// Clean up old cached questions (older than 30 days)
export async function cleanupOldCache(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('question_cache')
      .delete()
      .lt('last_used', thirtyDaysAgo.toISOString())
      .lt('usage_count', 3); // Only delete if used less than 3 times

    if (error) {
      console.error('Error cleaning up old cache:', error);
    }
  } catch (error) {
    console.error('Error cleaning up old cache:', error);
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  totalCachedSets: number;
  totalUsage: number;
  averageUsage: number;
  mostPopularRole: string;
}> {
  try {
    const { data, error } = await supabase
      .from('question_cache')
      .select('*');

    if (error || !data) {
      return {
        totalCachedSets: 0,
        totalUsage: 0,
        averageUsage: 0,
        mostPopularRole: ''
      };
    }

    const totalCachedSets = data.length;
    const totalUsage = data.reduce((sum, item) => sum + item.usage_count, 0);
    const averageUsage = totalCachedSets > 0 ? totalUsage / totalCachedSets : 0;

    // Find most popular role
    const roleUsage = data.reduce((acc, item) => {
      acc[item.role] = (acc[item.role] || 0) + item.usage_count;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularRole = Object.entries(roleUsage)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';

    return {
      totalCachedSets,
      totalUsage,
      averageUsage,
      mostPopularRole
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalCachedSets: 0,
      totalUsage: 0,
      averageUsage: 0,
      mostPopularRole: ''
    };
  }
}