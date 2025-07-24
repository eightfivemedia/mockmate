import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, answer, context } = await request.json();
    if (!question || !answer) {
      return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
    }

    // Compose the prompt for OpenAI
    const prompt = `You are an expert interview coach. Given the following interview question and candidate answer, score the answer from 1 to 10 (10 is perfect) and provide a brief justification.\n\nContext: ${context || 'N/A'}\nQuestion: ${question}\nAnswer: ${answer}\n\nRespond in JSON: {\"score\": <number>, \"feedback\": <string>}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert interview coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    // Parse the JSON from the AI's response
    const text = completion.choices[0].message.content || '';
    let score = null;
    let feedback = '';
    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      score = parsed.score;
      feedback = parsed.feedback;
    } catch (e) {
      // fallback: try to extract score and feedback manually
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