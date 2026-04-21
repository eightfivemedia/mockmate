'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, MessageSquare, Clock, Loader2, LogOut,
  AlertTriangle, X, Brain,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InterviewChatProps {
  sessionId: string;
  role: string;
  experienceLevel: string;
  userName: string;
  resumeText?: string;
  jdText?: string;
  onEndSession?: () => void;
  onMarkCompleted?: () => Promise<void>;
}

function EndSessionDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <button onClick={onCancel} className="text-[#1A1A2E40] hover:text-[#1A1A2E] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#1A1A2E]">End this session?</h3>
          <p className="text-sm text-[#1A1A2E60] mt-1">
            The conversation will end and you'll be returned to the dashboard. This can't be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 text-[#1A1A2E] text-sm font-medium py-2.5 rounded-xl hover:bg-[#F8F7FC] transition-colors"
            style={{ border: '1px solid #EEECF8' }}
          >
            Keep going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            End session
          </button>
        </div>
      </div>
    </div>
  );
}

export function InterviewChat({
  sessionId,
  role,
  experienceLevel,
  userName,
  resumeText,
  jdText,
  onEndSession,
  onMarkCompleted,
}: InterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [fiveMinWarningFired, setFiveMinWarningFired] = useState(false);
  const [oneMinWarningFired, setOneMinWarningFired] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const SESSION_LIMIT_SECONDS = 20 * 60;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer tick
  useEffect(() => {
    if (!timerStarted || !sessionStartTime) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      setElapsedSeconds(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, sessionStartTime]);

  // One-shot warnings + timeout
  useEffect(() => {
    if (!timerStarted) return;
    const remaining = SESSION_LIMIT_SECONDS - elapsedSeconds;
    if (remaining <= 300 && remaining > 60 && !fiveMinWarningFired) {
      setFiveMinWarningFired(true);
      toast({ title: '5 minutes remaining', description: 'Start wrapping up your answers.' });
    }
    if (remaining <= 60 && remaining > 0 && !oneMinWarningFired) {
      setOneMinWarningFired(true);
      toast({ title: '1 minute remaining', description: 'Last question — make it count!', variant: 'destructive' });
    }
    if (remaining <= 0 && !timedOut) {
      setTimedOut(true);
      onMarkCompleted?.();
    }
  }, [elapsedSeconds, timerStarted, fiveMinWarningFired, oneMinWarningFired, timedOut, onMarkCompleted, toast]);

  // Welcome message
  useEffect(() => {
    let docMsg = '';
    if (resumeText && jdText) {
      docMsg = "I've received your resume and the job description and will use them to personalize your interview.";
    } else if (resumeText) {
      docMsg = "I've received your resume and will use it to personalize your interview.";
    } else if (jdText) {
      docMsg = "I've received the job description and will use it to personalize your interview.";
    }

    setMessages([{
      role: 'assistant',
      content: `Hello ${userName}! I'm your AI interviewer for the ${role} position at the ${experienceLevel} level.\n\n${docMsg ? docMsg + '\n\n' : ''}Let's start with a simple introduction. Could you tell me a bit about yourself and why you're interested in this ${role} position?`,
      timestamp: new Date(),
    }]);
  }, [role, experienceLevel, userName, resumeText, jdText]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    if (!timerStarted) {
      const start = new Date();
      setSessionStartTime(start);
      setTimerStarted(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No authentication token found. Please log in again.');

      const conversationHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));

      const response = await fetch('/api/interview-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId, message: userMessage.content, conversationHistory }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, messages, sessionId, timerStarted, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const remaining = SESSION_LIMIT_SECONDS - elapsedSeconds;
  const remainingMin = Math.floor(Math.max(0, remaining) / 60);
  const remainingSec = Math.max(0, remaining) % 60;
  const remainingDisplay = `${remainingMin}:${remainingSec.toString().padStart(2, '0')}`;
  const isWarning = remaining <= 300 && timerStarted;
  const userMessageCount = messages.filter(m => m.role === 'user').length;

  return (
    <>
      {showEndDialog && (
        <EndSessionDialog
          onConfirm={async () => {
            setShowEndDialog(false);
            await onMarkCompleted?.();
            onEndSession?.();
          }}
          onCancel={() => setShowEndDialog(false)}
        />
      )}

      <div className="flex flex-col gap-3" style={{ flex: 1, minHeight: 0 }}>

        {/* Session info bar */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl shrink-0"
          style={{ background: 'white', border: '1px solid #EEECF8', boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
              <Brain className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A2E]">{role}</p>
              <p className="text-xs text-[#1A1A2E40] capitalize">{experienceLevel} level</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#1A1A2E40] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> {userMessageCount} {userMessageCount === 1 ? 'reply' : 'replies'}
            </span>
            <span className={`text-xs flex items-center gap-1.5 font-medium ${isWarning ? 'text-red-500' : 'text-[#1A1A2E40]'}`}>
              <Clock className="w-3.5 h-3.5" /> {timerStarted ? remainingDisplay : '20:00'}
            </span>
            <button
              onClick={() => setShowEndDialog(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"
              style={{ border: '1px solid #FEE2E2' }}
            >
              <LogOut className="w-3 h-3" /> End
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 min-h-0 rounded-2xl p-4 overflow-y-auto flex flex-col gap-4"
          style={{ background: 'white', border: '1px solid #EEECF8', boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)' }}
        >
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                  <Brain className="w-4 h-4 text-[#8B5CF6]" />
                </div>
              )}
              {message.role === 'assistant' ? (
                <div className="rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]"
                  style={{ background: '#F8F7FC', border: '1px solid #EEECF8' }}>
                  <p className="text-sm text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-[#1A1A2E30] mt-1">{formatTime(message.timestamp)}</p>
                </div>
              ) : (
                <div className="rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]"
                  style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-white/50 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                <Brain className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3" style={{ background: '#F8F7FC', border: '1px solid #EEECF8' }}>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: '#8B5CF6' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: '#8B5CF6' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#8B5CF6' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Timed out banner / Input bar */}
        {timedOut ? (
          <div
            className="flex items-center justify-center gap-3 p-4 rounded-2xl shrink-0"
            style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}
          >
            <Clock className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-red-500">Session time limit reached — this session is now read-only.</p>
          </div>
        ) : (
          <>
            <div
              className="flex items-center gap-3 p-3 rounded-2xl shrink-0"
              style={{ background: 'white', border: '1px solid #EEECF8', boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)' }}
            >
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                rows={1}
                disabled={isLoading}
                className="flex-1 min-h-0 resize-none text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E30] focus:outline-none bg-transparent leading-relaxed disabled:opacity-50"
                style={{ maxHeight: '128px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                  : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
            <p className="text-xs text-[#1A1A2E30] text-center -mt-1">
              Enter to send · Shift+Enter for new line · AI responses are for practice only
            </p>
          </>
        )}

      </div>
    </>
  );
}
