'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Code,
  Users,
  BarChart3,
  Briefcase,
  MessageSquare,
  Mic,
  ArrowRight,
  Clock,
  Target,
  FileText,
  Upload,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function StartInterview() {
  const { toast } = useToast();
  const [role, setRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedMode, setSelectedMode] = useState('text');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // PERF: Log page load time
  useEffect(() => {
    const pageLoadStart = window.performance.timing.navigationStart || performance.timeOrigin;
    const now = performance.now();
    const totalSinceNav = now + window.performance.timing.navigationStart - pageLoadStart;
    console.log(`[PERF] /dashboard/interview: Component mounted at ${now.toFixed(0)}ms since page navigation.`);
    // Optionally, log when UI is ready for interaction
    setTimeout(() => {
      console.log(`[PERF] /dashboard/interview: UI ready for interaction at ${(performance.now()).toFixed(0)}ms since navigation.`);
    }, 0);
  }, []);


  const levels = [
    { id: 'entry', name: 'Entry Level (0-2 years)', description: 'Perfect for new graduates and career changers' },
    { id: 'mid', name: 'Mid Level (3-5 years)', description: 'For professionals with some experience' },
    { id: 'senior', name: 'Senior Level (5+ years)', description: 'For experienced professionals and leaders' },
  ];

  const extractTextFromFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to extract text from file');
    }
    const data = await response.json();
    return data.text || '';
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Resume file size must be less than 5MB');
      return;
    }

    setResumeFile(file);
    setResumeText('');

    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
    } catch (err) {
      alert('Failed to extract text from resume. Please use a supported file type.');
    }
  };

  const handleJDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Job description file size must be less than 5MB');
      return;
    }

    setJdFile(file);
    setJdText('');

    try {
      const text = await extractTextFromFile(file);
      setJdText(text);
    } catch (err) {
      alert('Failed to extract text from job description. Please use a supported file type.');
    }
  };

  const handleStartInterview = async () => {
    if (!role.trim()) {
      toast({
        title: "Role Required",
        description: "Please enter a job role to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingQuestions(true);

    try {
      const frontendStart = performance.now();
      console.log('[PERF] StartInterview: Button clicked');

      // Show immediate feedback
      toast({
        title: "Generating Questions...",
        description: "This may take a few seconds. Please wait.",
      });

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role.trim(),
          experienceLevel: selectedLevel,
          responseFormat: selectedMode === 'text' ? 'mixed' : 'mixed', // For now, always mixed
          resumeText: resumeText || undefined,
          jobDescriptionText: jdText || undefined,
          mode: selectedMode || 'chat', // <-- send mode
        }),
      });

      const frontendDuration = performance.now() - frontendStart;
      console.log(`[PERF] StartInterview: Total time = ${frontendDuration.toFixed(0)}ms`);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create interview session');
      }

      toast({
        title: "Interview Session Created!",
        description: `Your mock interview is ready. Good luck!`,
      });

      // Redirect to interview session
      window.location.href = `/dashboard/interview/session?id=${data.sessionId}`;

    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate interview questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Start Your Interview</h1>
        <p className="text-muted-foreground">
          Choose your role, experience level, and preferred format to get started
        </p>
      </div>

            {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Enter Your Role
          </CardTitle>
          <CardDescription>
            Type the position you&apos;re preparing for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="role-input">Role</Label>
            <Input
              id="role-input"
              placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Upload Resume (Optional)
            </CardTitle>
            <CardDescription className="text-xs">
              Upload your resume to get more personalized interview questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-upload">Resume File</Label>
              <div className="flex items-center gap-2">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Resume File
                </Button>
                {resumeFile && (
                  <span className="text-sm text-muted-foreground">
                    {resumeFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: TXT, PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            {/* Remove the preview blocks for resumeText and jdText. Only show the filename if present. */}
          </CardContent>
        </Card>

        {/* Job Description Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5" />
              Upload Job Description (Optional)
            </CardTitle>
            <CardDescription className="text-xs">
              Upload the job description to get role-specific interview questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jd-upload">Job Description File</Label>
              <div className="flex items-center gap-2">
                <input
                  id="jd-upload"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleJDUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('jd-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose JD File
                </Button>
                {jdFile && (
                  <span className="text-sm text-muted-foreground">
                    {jdFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: TXT, PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            {/* Remove the preview blocks for resumeText and jdText. Only show the filename if present. */}
          </CardContent>
        </Card>
      </div>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Experience Level
          </CardTitle>
          <CardDescription>
            Select your experience level to get appropriate questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedLevel === level.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <div className="space-y-2">
                  <div className="font-medium">{level.name}</div>
                  <div className="text-sm text-muted-foreground">{level.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interview Format
          </CardTitle>
          <CardDescription>
            Choose how you&lsquo;d like to respond to questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMode} onValueChange={setSelectedMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="flex-1">
                  <div className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-6 h-6 text-primary" />
                      <div>
                        <div className="font-medium">Text Responses</div>
                        <div className="text-xs pt-1 text-muted-foreground">
                          Type your answers and get detailed feedback
                        </div>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="audio" />
                <Label htmlFor="audio" className="flex-1">
                  <div className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Mic className="w-6 h-6 text-primary" />
                      <div>
                        <div className="font-medium">Audio Responses</div>
                        <div className="text-xs pt-1 text-muted-foreground">
                          Record your answers for natural practice
                        </div>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">30-45 minutes</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="font-medium">Questions</div>
                <div className="text-sm text-muted-foreground">8-12 tailored questions</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">Feedback</div>
                <div className="text-sm text-muted-foreground">Instant AI analysis</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="text-center">
        <Button
          size="lg"
          className="btn-primary text-lg px-8 py-4"
          disabled={!role.trim() || !selectedLevel || !selectedMode || isGeneratingQuestions}
          onClick={handleStartInterview}
        >
          {isGeneratingQuestions ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Interview Session
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {(!role.trim() || !selectedLevel || !selectedMode) && (
          <p className="text-sm text-muted-foreground mt-2">
            Please fill in all fields above to continue
          </p>
        )}
      </div>
    </div>
  );
}