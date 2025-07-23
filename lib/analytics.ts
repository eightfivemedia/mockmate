import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface QuestionAnalytics {
  questionId: number;
  questionType: 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number; // in seconds
  answerLength: number; // character count
  skipped: boolean;
  rating?: number; // user self-rating 1-5
}

export interface SessionAnalytics {
  sessionId: string;
  userId: string;
  role: string;
  experienceLevel: string;
  totalQuestions: number;
  questionsAnswered: number;
  questionsSkipped: number;
  averageTimePerQuestion: number;
  totalSessionTime: number;
  averageAnswerLength: number;
  averageRating: number;
  completedAt: Date;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalQuestionsAnswered: number;
  averageSessionScore: number;
  favoriteRole: string;
  averageTimePerQuestion: number;
  completionRate: number;
  lastActive: Date;
}

// Track question performance
export async function trackQuestionPerformance(
  sessionId: string,
  questionAnalytics: QuestionAnalytics
) {
  try {
    const { error } = await supabase
      .from('question_analytics')
      .insert({
        session_id: sessionId,
        question_id: questionAnalytics.questionId,
        question_type: questionAnalytics.questionType,
        difficulty: questionAnalytics.difficulty,
        time_spent: questionAnalytics.timeSpent,
        answer_length: questionAnalytics.answerLength,
        skipped: questionAnalytics.skipped,
        rating: questionAnalytics.rating
      });

    if (error) {
      console.error('Error tracking question performance:', error);
    }
  } catch (error) {
    console.error('Error tracking question performance:', error);
  }
}

// Track session completion
export async function trackSessionCompletion(
  sessionId: string,
  sessionAnalytics: Omit<SessionAnalytics, 'sessionId' | 'userId'>
) {
  try {
    const { error } = await supabase
      .from('session_analytics')
      .insert({
        session_id: sessionId,
        role: sessionAnalytics.role,
        experience_level: sessionAnalytics.experienceLevel,
        total_questions: sessionAnalytics.totalQuestions,
        questions_answered: sessionAnalytics.questionsAnswered,
        questions_skipped: sessionAnalytics.questionsSkipped,
        average_time_per_question: sessionAnalytics.averageTimePerQuestion,
        total_session_time: sessionAnalytics.totalSessionTime,
        average_answer_length: sessionAnalytics.averageAnswerLength,
        average_rating: sessionAnalytics.averageRating,
        completed_at: sessionAnalytics.completedAt.toISOString()
      });

    if (error) {
      console.error('Error tracking session completion:', error);
    }
  } catch (error) {
    console.error('Error tracking session completion:', error);
  }
}

// Get user analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  try {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
}

// Get session analytics
export async function getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
  try {
    const { data, error } = await supabase
      .from('session_analytics')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    return null;
  }
}

// Get question performance insights
export async function getQuestionInsights(role: string, experienceLevel: string) {
  try {
    const { data, error } = await supabase
      .from('question_analytics')
      .select(`
        *,
        session_analytics!inner(role, experience_level)
      `)
      .eq('session_analytics.role', role)
      .eq('session_analytics.experience_level', experienceLevel);

    if (error) {
      console.error('Error fetching question insights:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching question insights:', error);
    return null;
  }
}

// Calculate session statistics
export function calculateSessionStats(questionAnalytics: QuestionAnalytics[]) {
  const totalQuestions = questionAnalytics.length;
  const answeredQuestions = questionAnalytics.filter(q => !q.skipped);
  const skippedQuestions = questionAnalytics.filter(q => q.skipped);
  
  const totalTime = questionAnalytics.reduce((sum, q) => sum + q.timeSpent, 0);
  const totalAnswerLength = answeredQuestions.reduce((sum, q) => sum + q.answerLength, 0);
  const totalRating = answeredQuestions.reduce((sum, q) => sum + (q.rating || 0), 0);

  return {
    totalQuestions,
    questionsAnswered: answeredQuestions.length,
    questionsSkipped: skippedQuestions.length,
    averageTimePerQuestion: answeredQuestions.length > 0 ? totalTime / answeredQuestions.length : 0,
    totalSessionTime: totalTime,
    averageAnswerLength: answeredQuestions.length > 0 ? totalAnswerLength / answeredQuestions.length : 0,
    averageRating: answeredQuestions.length > 0 ? totalRating / answeredQuestions.length : 0,
    completionRate: totalQuestions > 0 ? (answeredQuestions.length / totalQuestions) * 100 : 0
  };
}

// Generate performance insights
export function generatePerformanceInsights(sessionStats: ReturnType<typeof calculateSessionStats>) {
  const insights = [];

  if (sessionStats.averageTimePerQuestion < 60) {
    insights.push('You answered questions quickly - consider taking more time to provide detailed responses.');
  } else if (sessionStats.averageTimePerQuestion > 300) {
    insights.push('You took your time with answers - great for thorough responses, but practice being more concise.');
  }

  if (sessionStats.averageAnswerLength < 100) {
    insights.push('Your answers were brief - try to provide more specific examples and details.');
  } else if (sessionStats.averageAnswerLength > 500) {
    insights.push('Your answers were comprehensive - great detail, but practice being more concise.');
  }

  if (sessionStats.completionRate < 80) {
    insights.push('You skipped several questions - consider practicing with all question types.');
  }

  if (sessionStats.averageRating < 3) {
    insights.push('You rated your performance lower - focus on building confidence and practicing more.');
  }

  return insights;
} 