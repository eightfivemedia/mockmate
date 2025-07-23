'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Square,
  Mic,
  Send,
  ChevronRight,
  Clock,
  MessageSquare,
  Target,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  SkipForward,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useInterviewSession } from '@/hooks/use-interview-session';
import { InterviewChat } from './interview-chat';
import { useAuth } from '@/hooks/use-auth';

type Question = {
  id: number;
  type: string;
  question: string;
  difficulty: string;
};

export function InterviewSession() {
  // All hooks at the top
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('id') ?? null;
  const { session, loading, error, updateSession } = useInterviewSession(sessionId);
  const { profile } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [interviewMode, setInterviewMode] = useState<'chat' | 'questions'>('chat');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Update questions state when session changes
  useEffect(() => {
    if (session && session.questions) {
      setQuestions(session.questions);
    }
  }, [session]);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your interview session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Session Not Found</h2>
            <p className="text-muted-foreground">
              {error || "The interview session could not be loaded."}
            </p>
            <Link href="/dashboard/interview">
              <Button>Start New Interview</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // All code below this point can safely use 'session'
  const canGenerateQuestions = !!session.resume_text || !!session.job_description_text;

  const handleGenerateQuestions = async () => {
    if (!canGenerateQuestions) return;
    setGeneratingQuestions(true);
    try {
      const response = await fetch('/api/generate-questions-on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate questions');
      setQuestions(data.questions.map((q: string, i: number) => ({ id: i + 1, type: 'mixed', question: q, difficulty: 'medium' })));
    } catch (err) {
      alert('Failed to generate questions.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = () => {
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer('');
      setShowFeedback(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Progress calculation
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const feedback = {
    score: 8.5,
    strengths: [
      'Clear and concise communication',
      'Good use of specific examples',
      'Demonstrated problem-solving skills',
    ],
    improvements: [
      'Could provide more technical details',
      'Consider mentioning specific metrics or outcomes',
    ],
    suggestions: [
      'Practice the STAR method for behavioral questions',
      'Prepare more quantifiable examples of your achievements',
    ],
  };

  if (sessionComplete) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground">
            Great job! You've completed all {questions.length} questions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">8.5</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">32m</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/dashboard/sessions">
                <Button variant="outline">View Detailed Report</Button>
              </Link>
              <Link href="/dashboard/interview">
                <Button className="btn-primary">Start New Interview</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Interview Session Header (always visible, no green border) */}
      <div className="p-6 mb-4">
        <h1 className="text-2xl font-bold mb-1">Interview Session</h1>
        <p className="text-muted-foreground text-lg">{session.role} • {session.experience_level} Level</p>
      </div>
      {/* Mode Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={interviewMode === 'chat' ? 'default' : 'outline'}
              onClick={() => setInterviewMode('chat')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Mode
            </Button>
            <Button
              variant={interviewMode === 'questions' ? 'default' : 'outline'}
              onClick={() => setInterviewMode('questions')}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Questions Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      {interviewMode === 'chat' && sessionId && (
        <InterviewChat
          sessionId={sessionId}
          role={session.role}
          experienceLevel={session.experience_level}
          userName={profile?.name || 'Candidate'}
          resumeText={session.resume_text}
          jdText={session.job_description_text}
        />
      )}

      {/* Questions Interface */}
      {interviewMode === 'questions' && (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleGenerateQuestions}
              disabled={!canGenerateQuestions || generatingQuestions}
              variant={canGenerateQuestions ? 'default' : 'outline'}
            >
              {generatingQuestions ? 'Generating...' : 'Generate Questions'}
            </Button>
          </div>
          {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{questions.length > 0 ? `${Math.round(progress)}% Complete` : '0% Complete'}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden w-full">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      {questions[currentQuestion] ? (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Interview Question
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{questions[currentQuestion].type}</Badge>
                <Badge variant={
                  questions[currentQuestion].difficulty === 'easy' ? 'secondary' :
                  questions[currentQuestion].difficulty === 'medium' ? 'default' : 'destructive'
                }>
                  {questions[currentQuestion].difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="w-full">
            <p className="text-lg leading-relaxed">
              {questions[currentQuestion].question}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No question available.
        </div>
      )}

      {/* Answer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Your Answer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[150px]"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRecording}
                  className={isRecording ? 'bg-red-500 text-white' : ''}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? 'Stop Recording' : 'Record Answer'}
                </Button>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm">Recording...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSkipQuestion}>
                  <SkipForward className="w-4 h-4 mr-1" />
                  Skip
                </Button>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                  className="btn-primary"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      {showFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{feedback.score}</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${feedback.score * 10}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {feedback.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Areas for Improvement</span>
                </div>
                <ul className="space-y-1">
                  {feedback.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Suggestions</span>
                </div>
                <ul className="space-y-1">
                  {feedback.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleNextQuestion} className="btn-primary">
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Interview'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}