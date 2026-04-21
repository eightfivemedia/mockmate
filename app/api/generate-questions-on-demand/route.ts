import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as clientSupabase } from '@/lib/supabase';
import { generateQuestionsWithOpenAI } from '@/lib/openai';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 10, window: 60, prefix: 'generate' });
  if (limited) return limited;
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Load session — must belong to this user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const questions = await generateQuestionsWithOpenAI({
      role: session.role,
      experienceLevel: session.experience_level,
      resumeText: session.resume_text ?? undefined,
      jobDescriptionText: session.job_description_text ?? undefined,
      responseFormat: session.type ?? 'mixed',
    });

    // Persist generated questions back to the session
    await supabase
      .from('interview_sessions')
      .update({ questions })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions on demand:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
