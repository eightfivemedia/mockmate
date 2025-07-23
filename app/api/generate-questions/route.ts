import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as clientSupabase } from '@/lib/supabase';
import { generateQuestionsWithOpenAI } from '@/lib/openai';
import { getCachedQuestions, cacheQuestions } from '@/lib/cache';
import { performance } from 'perf_hooks';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GenerateQuestionsRequest {
  role: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
  resumeText?: string;
  jobDescriptionText?: string;
  responseFormat: 'technical' | 'behavioral' | 'mixed';
}

interface Question {
  id: number;
  type: 'technical' | 'behavioral';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
  const totalStart = performance.now();
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }
    
    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', token ? 'present' : 'missing');
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);
    console.log('Auth check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateQuestionsRequest = await request.json();
    const { role, experienceLevel, resumeText, jobDescriptionText, responseFormat } = body;

    // Validate required fields
    if (!role || !experienceLevel || !responseFormat) {
      return NextResponse.json(
        { error: 'Missing required fields: role, experienceLevel, responseFormat' },
        { status: 400 }
      );
    }

    // Create interview session in database (no OpenAI call)
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        title: `${role} Interview - ${experienceLevel} level`,
        type: responseFormat,
        role: role,
        experience_level: experienceLevel,
        questions: [],
        resume_file_path: resumeText ? 'resume_uploaded' : null,
        job_description_file_path: jobDescriptionText ? 'jd_uploaded' : null,
        resume_text: resumeText || null,
        job_description_text: jobDescriptionText || null,
        questions_answered: 0
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create interview session' },
        { status: 500 }
      );
    }

    const totalDuration = performance.now() - totalStart;
    console.log(`[PERF] /api/generate-questions: total=${totalDuration.toFixed(0)}ms (no OpenAI)`);

    return NextResponse.json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: The generateQuestionsWithAI function has been replaced with generateQuestionsWithOpenAI from @/lib/openai