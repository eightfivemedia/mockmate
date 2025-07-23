import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as clientSupabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { performance } from 'perf_hooks';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  conversationHistory: ChatMessage[];
}

export async function POST(request: NextRequest) {
  const totalStart = performance.now();
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');

    // Verify the token and get user
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { sessionId, message, conversationHistory } = body;

    // Get the interview session to understand the context
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Build the system prompt based on the interview context
    const resumeText = session.resume_text ? `\n\nCandidate Resume:\n${session.resume_text}` : '';
    const jdText = session.job_description_text ? `\n\nJob Description:\n${session.job_description_text}` : '';

    const systemPrompt = `You are an expert interviewer conducting a ${session.experience_level} level interview for a ${session.role} position.

Your role is to:
1. Ask relevant questions based on the candidate's responses
2. Provide constructive feedback on their answers
3. Guide the conversation naturally
4. Keep the interview professional but conversational
5. Ask follow-up questions to dig deeper into their experiences

Interview Context:
- Role: ${session.role}
- Experience Level: ${session.experience_level}
- Session Type: ${session.type}${resumeText}${jdText}

Be conversational, ask one question at a time, and provide brief feedback when appropriate. Keep responses concise and engaging.`;

    // Prepare the conversation for OpenAI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ];

    const openAIStart = performance.now();
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });
    const openAIDuration = performance.now() - openAIStart;

    const assistantResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    // Update the session with the new conversation
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: assistantResponse }
    ];

    // Store the conversation in the session (you might want to add a conversations column to your table)
    await supabase
      .from('interview_sessions')
      .update({
        questions_answered: session.questions_answered + 1,
        // You could add a conversations column to store the full chat history
      })
      .eq('id', sessionId);

    const totalDuration = performance.now() - totalStart;
    console.log(`[PERF] /api/interview-chat: total=${totalDuration.toFixed(0)}ms, openai=${openAIDuration.toFixed(0)}ms`);

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      conversationHistory: updatedHistory
    });

  } catch (error) {
    console.error('Error in interview chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}