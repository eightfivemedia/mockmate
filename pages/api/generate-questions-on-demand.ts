import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }
  // Load the session
  const { data: session, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (error || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const { role, experience_level, resume_text, job_description_text } = session;
  if (!resume_text || !job_description_text) {
    return res.status(400).json({ error: 'Resume and job description required' });
  }
  // Build the OpenAI prompt
  const prompt = `You are an expert interviewer. Using the following candidate resume and job description, generate 10-15 interview questions (mix of technical and behavioral) for a ${role} (${experience_level} level) interview. Return the questions as a numbered list.\n\nCandidate Resume:\n${resume_text}\n\nJob Description:\n${job_description_text}`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert interview question generator.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });
    const response = completion.choices[0]?.message?.content || '';
    // Parse the questions from the response (numbered list)
    const questions = response
      .split(/\n+/)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0);
    return res.status(200).json({ questions });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
} 