import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { supabase as clientSupabase } from '@/lib/supabase';
import { trackApiCost } from '@/lib/ai-cost';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 20, window: 60, prefix: 'score' });
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

    const { question, answer, context } = await request.json();
    if (!question || !answer) {
      return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
    }

    const safeQuestion = String(question).substring(0, 1000);
    const safeAnswer = String(answer).substring(0, 3000);
    const safeContext = context ? String(context).substring(0, 500) : 'N/A';

    const activeModel = process.env.AI_MODEL ?? 'gpt-4o-mini';

    const prompt = `You are an expert interview coach. Given the following interview question and candidate answer, score the answer from 1 to 10 (10 is perfect) and provide a brief justification.\n\nContext: ${safeContext}\nQuestion: ${safeQuestion}\nAnswer: ${safeAnswer}\n\nRespond in JSON: {"score": <number>, "feedback": <string>}`;

    const completion = await openai.chat.completions.create({
      model: activeModel,
      messages: [
        { role: 'system', content: 'You are an expert interview coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 200,
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
    let score = null;
    let feedback = '';
    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      score = parsed.score;
      feedback = parsed.feedback;
    } catch {
      const scoreMatch = text.match(/score\D*(\d+)/i);
      score = scoreMatch ? Number(scoreMatch[1]) : null;
      feedback = text;
    }

    return NextResponse.json({ score, feedback });
  } catch (error) {
    console.error('Error scoring answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
