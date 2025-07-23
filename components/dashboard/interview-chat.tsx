'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Mic,
  MessageSquare,
  Clock,
  Target,
  Loader2,
  User,
  Bot
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
}

export function InterviewChat({ sessionId, role, experienceLevel, userName, resumeText, jdText }: InterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update timer every second when started
  useEffect(() => {
    if (!timerStarted) return;

    const interval = setInterval(() => {
      // Force re-render to update timer
      setMessages(prev => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted]);

  // Initialize the conversation with a welcome message
  useEffect(() => {
    let docMsg = '';
    if (resumeText && jdText) {
      docMsg = "I've received your resume and the job description and will use them to personalize your interview.";
    } else if (resumeText) {
      docMsg = "I've received your resume and will use it to personalize your interview.";
    } else if (jdText) {
      docMsg = "I've received the job description and will use it to personalize your interview.";
    }
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello ${userName}! I'm your AI interviewer for the ${role} position at the ${experienceLevel} level. I'm here to help you practice and improve your interview skills.\n\n${docMsg}\n\nLet's start with a simple introduction. Could you tell me a bit about yourself and why you're interested in this ${role} position?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [role, experienceLevel, userName, resumeText, jdText]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Start the timer on first user message
    if (!timerStarted) {
      setSessionStartTime(new Date());
      setTimerStarted(true);
    }

    try {
      const frontendStart = performance.now();
      console.log('[PERF] Chat: User sent message');

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/interview-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          conversationHistory
        }),
      });

      const frontendDuration = performance.now() - frontendStart;
      console.log(`[PERF] Chat: Total time = ${frontendDuration.toFixed(0)}ms`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionDuration = () => {
    if (!sessionStartTime) {
      return "20:00"; // Default 20 minutes
    }
    const now = new Date();
    const diff = now.getTime() - sessionStartTime.getTime();
    const totalSeconds = Math.floor(diff / 1000);
    const remainingSeconds = Math.max(0, 1200 - totalSeconds); // 20 minutes = 1200 seconds
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    // Show warning when less than 5 minutes remaining
    if (remainingSeconds <= 300 && remainingSeconds > 0) {
      toast({
        title: "Time Running Out!",
        description: `You have ${minutes}:${seconds.toString().padStart(2, '0')} remaining.`,
        variant: "destructive"
      });
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Interview Chat</h1>
          <p className="text-muted-foreground">{role} • {experienceLevel} Level</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{getSessionDuration()}</span>
          </div>
          <Badge variant="secondary">
            {messages.filter(m => m.role === 'user').length} Messages
          </Badge>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interview Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Input Area */}
          <div className="p-4">
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="chat-textarea h-10 resize-none px-4 py-2 leading-[48px] text-sm"
                disabled={isLoading}
              />
              <div className="flex gap-2 items-end">
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  variant="default"
                  className="h-10 w-10 px-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={isLoading}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}