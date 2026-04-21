import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';
import { supabase as clientSupabase } from '@/lib/supabase';
import { trackApiCost } from '@/lib/ai-cost';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 10, window: 60, prefix: 'feedback' });
  if (limited) return limited;
  try {
    // Verify auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, questionsAndAnswers, context, startTime, endTime } = await request.json();
    if (!sessionId || !questionsAndAnswers || questionsAndAnswers.length === 0) {
      return NextResponse.json({ error: 'Missing sessionId or questionsAndAnswers' }, { status: 400 });
    }

    // Verify the session belongs to the authenticated user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate average score
    const scores = questionsAndAnswers.map((qa: any) => qa.score).filter((s: any) => typeof s === 'number');
    const averageScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

    // Calculate duration_minutes if startTime and endTime are provided
    let duration_minutes = null;
    if (startTime && endTime) {
      duration_minutes = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
    }

    const safeContext = context ? String(context).substring(0, 500) : 'N/A';
    const qaList = questionsAndAnswers
      .slice(0, 20)
      .map((qa: any, i: number) =>
        `Q${i + 1}: ${String(qa.question || '').substring(0, 500)}\nA${i + 1}: ${String(qa.answer || '').substring(0, 1000)}\nScore: ${qa.score}\nFeedback: ${String(qa.feedback || '').substring(0, 300)}`
      )
      .join('\n\n');

    const prompt = `You are an expert interview coach. Given the following interview questions, answers, and scores, provide:\n- 2-3 tips for improvement\n- 2-3 things the user did well\n\nContext: ${safeContext}\n\n${qaList}\n\nRespond in JSON: {"tips": [<string>], "strengths": [<string>]}`;

    const activeModel = process.env.AI_MODEL ?? 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
      model: activeModel,
      messages: [
        { role: 'system', content: 'You are an expert interview coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    if (completion.usage) {
      void trackApiCost({
        userId: user.id,
        inputTokens: completion.usage.prompt_tokens,
        outputTokens: completion.usage.completion_tokens,
        model: activeModel,
      });
    }

    const text = completion.choices[0].message.content || '';
    let tips: string[] = [];
    let strengths: string[] = [];
    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      tips = parsed.tips || [];
      strengths = parsed.strengths || [];
    } catch {
      tips = [text];
      strengths = [];
    }

    // Update session — ownership already verified above
    await supabase.from('interview_sessions').update({
      score: averageScore,
      feedback: JSON.stringify({ tips, strengths }),
      completed_at: endTime ? new Date(endTime).toISOString() : new Date().toISOString(),
      duration_minutes: duration_minutes,
      qa_records: questionsAndAnswers,
    }).eq('id', sessionId).eq('user_id', user.id);

    return NextResponse.json({ averageScore, feedback: { tips, strengths }, duration_minutes });
  } catch (error) {
    console.error('Error generating session feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
