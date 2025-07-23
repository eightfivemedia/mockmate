'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Star,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export function ResumeChecker() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis results
      const mockAnalysis = {
        score: 78,
        suggestions: [
          'Add more quantifiable achievements to your experience section',
          'Include relevant keywords for your target industry',
          'Consider adding a professional summary at the top',
          'Ensure consistent formatting throughout the document'
        ],
        strengths: [
          'Clear and concise writing style',
          'Good use of action verbs',
          'Appropriate length for your experience level'
        ],
        improvements: [
          'Add specific metrics and numbers to demonstrate impact',
          'Include more industry-specific terminology',
          'Consider adding a skills section with technical proficiencies'
        ]
      };
      
      setAnalysis(mockAnalysis);
      toast.success('Resume analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && file.type !== 'application/pdf') {
      toast.error('Please upload a .txt or .pdf file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setResumeText(text);
      toast.success('Resume uploaded successfully!');
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Checker</h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume and get AI-powered feedback to improve your chances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Paste your resume text or upload a file for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File (TXT or PDF)</Label>
              <div className="flex items-center gap-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <span className="text-sm text-muted-foreground">
                  Max 5MB
                </span>
              </div>
            </div>

            <Separator />

            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="resume-text">Or Paste Resume Text</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px]"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Get detailed feedback and improvement suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis ? (
              <>
                {/* Score */}
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analysis.score}/100
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Resume Score
                  </div>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(analysis.score / 20)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    Suggested Improvements
                  </h3>
                  <ul className="space-y-1">
                    {analysis.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Action Items
                  </h3>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload your resume to get started with the analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 