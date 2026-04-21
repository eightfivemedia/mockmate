'use client';

import { useState, useRef } from 'react';
import {
  Upload, CheckCircle, AlertCircle, Lightbulb,
  Target, Star, RefreshCw, Download, Loader2, Maximize2, Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TbGhost2 } from 'react-icons/tb';

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '24px',
};

export function ResumeChecker() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [textareaExpanded, setTextareaExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          'Ensure consistent formatting throughout the document',
        ],
        strengths: [
          'Clear and concise writing style',
          'Good use of action verbs',
          'Appropriate length for your experience level',
        ],
        improvements: [
          'Add specific metrics and numbers to demonstrate impact',
          'Include more industry-specific terminology',
          'Consider adding a skills section with technical proficiencies',
        ],
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

    if (file.size > 5 * 1024 * 1024) {
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
    <div className="flex flex-col gap-5 pb-6">

      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: '20px' }}>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Resume Checker</h1>
        <p className="text-sm text-[#1A1A2E60] mt-1">
          Upload your resume and get AI-powered feedback to improve your chances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Upload Resume */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] shrink-0" style={{ marginBottom: '16px' }}>
            Upload Resume
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '12px' }}>
            {/* File upload zone */}
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed p-5 flex items-center gap-4 cursor-pointer hover:border-[#8B5CF6] hover:bg-[#F8F7FC] transition-all"
              style={{ borderColor: '#D8D4F0', flexShrink: 0 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
              >
                <Upload className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A2E]">Upload resume</p>
                <p className="text-xs text-[#1A1A2E40]">PDF, TXT · Max 5MB</p>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
              <div className="flex-1 h-px bg-[#EEECF8]" />
              <span className="text-xs text-[#1A1A2E30] font-medium">or paste text</span>
              <div className="flex-1 h-px bg-[#EEECF8]" />
            </div>

            {/* Textarea */}
            <div className="relative" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <textarea
                id="resume-text"
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-xl border border-[#EEECF8] bg-[#F8F7FC] px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E30] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 transition-all resize-none"
                style={{
                  flex: 1,
                  minHeight: textareaExpanded ? '320px' : '160px',
                  transition: 'min-height 0.2s ease',
                }}
              />
              <button
                onClick={() => setTextareaExpanded(!textareaExpanded)}
                className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#EEECF8] transition-colors"
                style={{ color: '#8B8BAE' }}
                title={textareaExpanded ? 'Collapse' : 'Expand'}
              >
                {textareaExpanded
                  ? <Minimize2 className="w-3.5 h-3.5" />
                  : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full py-3 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
                boxShadow: isAnalyzing || !resumeText.trim() ? 'none' : '0 4px 20px rgba(91, 108, 249, 0.3)',
                borderRadius: '12px',
                flexShrink: 0,
              }}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</>
              ) : (
                <><Target className="w-4 h-4" />Analyze Resume</>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] shrink-0" style={{ marginBottom: '16px' }}>
            Analysis Results
          </p>

          {analysis ? (
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Score */}
              <div className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', border: '1px solid #E0DCFA', flexShrink: 0 }}>
                <div className="text-3xl font-bold text-[#5B6CF9] mb-1">{analysis.score}/100</div>
                <div className="text-xs text-[#1A1A2E60]">Overall Resume Score</div>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(analysis.score / 20) ? 'text-yellow-400 fill-current' : 'text-[#1A1A2E15]'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Strengths
                </h3>
                <ul className="space-y-1.5">
                  {analysis.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#1A1A2E] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                  Suggested Improvements
                </h3>
                <ul className="space-y-1.5">
                  {analysis.improvements.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#1A1A2E] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  Action Items
                </h3>
                <ul className="space-y-1.5">
                  {analysis.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#1A1A2E] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-2.5 rounded-xl border border-[#EEECF8] text-sm font-medium text-[#4A4A6A] flex items-center justify-center gap-2 hover:bg-[#F8F7FC] transition-colors" style={{ flexShrink: 0 }}>
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
              >
                <TbGhost2 className="w-9 h-9 text-[#8B5CF6]" style={{ strokeWidth: 1 }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#1A1A2E60]">No analysis yet</p>
                <p className="text-xs text-[#1A1A2E30] mt-0.5">Upload your resume to get started</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
