import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionsAndAnswers, context, startTime, endTime } = await request.json();
    if (!sessionId || !questionsAndAnswers || questionsAndAnswers.length === 0) {
      return NextResponse.json({ error: 'Missing sessionId or questionsAndAnswers' }, { status: 400 });
    }

    // Calculate average score
    const scores = questionsAndAnswers.map((qa: any) => qa.score).filter((s: any) => typeof s === 'number');
    const averageScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

    // Calculate duration_minutes if startTime and endTime are provided
    let duration_minutes = null;
    if (startTime && endTime) {
      duration_minutes = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
    }

    // Compose the prompt for OpenAI
    const qaList = questionsAndAnswers.map((qa: any, i: number) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}\nScore: ${qa.score}\nFeedback: ${qa.feedback}`).join('\n\n');
    const prompt = `You are an expert interview coach. Given the following interview questions, answers, and scores, provide:\n- 2-3 tips for improvement\n- 2-3 things the user did well\n\nContext: ${context || 'N/A'}\n\n${qaList}\n\nRespond in JSON: {\"tips\": [<string>], \"strengths\": [<string>]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert interview coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    // Parse the JSON from the AI's response
    const text = completion.choices[0].message.content || '';
    let tips: string[] = [];
    let strengths: string[] = [];
    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      tips = parsed.tips || [];
      strengths = parsed.strengths || [];
    } catch (e) {
      // fallback: try to extract tips/strengths manually
      tips = [text];
      strengths = [];
    }

    // Store in Supabase
    await supabase.from('interview_sessions').update({
      score: averageScore,
      feedback: JSON.stringify({ tips, strengths }),
      completed_at: endTime ? new Date(endTime).toISOString() : new Date().toISOString(),
      duration_minutes: duration_minutes,
    }).eq('id', sessionId);

    return NextResponse.json({ averageScore, feedback: { tips, strengths }, duration_minutes });
  } catch (error) {
    console.error('Error generating session feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 