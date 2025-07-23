'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Target,
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingProps {
  userName?: string;
}

export function Onboarding({ userName }: OnboardingProps) {
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
          <Star className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold">Welcome to MockMate, {firstName}! 🎉</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You&apos;re about to start your journey to interview success. Let&apos;s get you set up for your first practice session.
        </p>
      </div>

      {/* Getting Started Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center border-2 border-primary/20">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">1. Choose Your Focus</CardTitle>
            <CardDescription>
              Select between technical, behavioral, or mixed interview types
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center border-2 border-primary/20">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">2. Start Practicing</CardTitle>
            <CardDescription>
              Begin your first mock interview with AI-powered questions
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center border-2 border-primary/20">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">3. Get Feedback</CardTitle>
            <CardDescription>
              Receive detailed analysis and improvement suggestions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Start Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Ready to Start?
          </CardTitle>
          <CardDescription className="text-lg">
            Begin your first interview practice session in just a few clicks
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/interview">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                Start Your First Interview
              </Button>
            </Link>
            <Link href="/dashboard/sessions">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                View Sample Sessions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              What You&apos;ll Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Realistic interview questions tailored to your role</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Instant feedback on your responses</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Performance analytics and progress tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Tips and best practices for improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Interview Types Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">Technical Interviews</div>
                <div className="text-sm text-muted-foreground">Coding, algorithms, system design</div>
              </div>
              <Badge variant="secondary">Popular</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">Behavioral Interviews</div>
                <div className="text-sm text-muted-foreground">STAR method, leadership, teamwork</div>
              </div>
              <Badge variant="outline">Essential</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">Mixed Interviews</div>
                <div className="text-sm text-muted-foreground">Combination of both types</div>
              </div>
              <Badge variant="outline">Comprehensive</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Join thousands of professionals who have improved their interview skills with MockMate
        </p>
        <Link href="/dashboard/interview">
          <Button size="lg" className="btn-primary text-lg px-8 py-4">
            Let&apos;s Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}