'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Calendar,
  TrendingUp,
  Crown,
  Play,
  History,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUserInterviews } from '@/hooks/use-user-interviews';
import { useToast } from '@/hooks/use-toast';
import { UserStats } from './user-stats';

export default function DashboardHome() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile: user, loading: userLoading } = useUserProfile();
  const { sessions: interviews, loading: interviewsLoading, refreshInterviews: fetchUserSessions } = useUserInterviews(user?.id || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshStats = useCallback(async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      await fetchUserSessions();
      toast({
        title: "Stats refreshed",
        description: "Your interview statistics have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, fetchUserSessions, toast]);

  useEffect(() => {
    if (user?.id) {
      fetchUserSessions();
    }
  }, [user?.id, fetchUserSessions]);

  // Show loading state
  if (userLoading || interviewsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (!interviewsLoading && interviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to MockMate!</h1>
            <p className="text-muted-foreground">
              Let&apos;s get you started with your first mock interview.
            </p>
          </div>
        </div>

        <UserStats />

        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Play className="h-6 w-6" />
              Start Your First Interview
            </CardTitle>
            <CardDescription>
              Practice with AI-powered mock interviews tailored to your role and experience level.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              size="lg"
              onClick={() => router.push('/dashboard/interview')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Start Interview Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show dashboard for existing users
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your interview activity.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshStats}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      <UserStats />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start a new interview or review your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push('/dashboard/interview')}
                className="justify-start gap-2"
                disabled={user?.credits === 0}
              >
                <Plus className="h-4 w-4" />
                Start New Interview
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/sessions')}
                className="justify-start gap-2"
              >
                <History className="h-4 w-4" />
                View All Sessions
              </Button>
            </div>
            {user?.credits === 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You&apos;re out of credits. Upgrade your plan to continue practicing.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Sessions
            </CardTitle>
            <CardDescription>
              Your latest interview practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No interview sessions yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push('/dashboard/interview')}
                >
                  Start Your First Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.slice(0, 5).map((interview) => (
                  <div key={interview.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {interview.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(interview.created_at).toLocaleDateString()}
                        <Badge variant="secondary" className="text-xs">
                          {interview.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/interview/session?id=${interview.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                {interviews.length > 5 && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push('/dashboard/sessions')}
                    >
                      View All Sessions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
