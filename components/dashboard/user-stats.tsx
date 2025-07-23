'use client'

import { useUserProfile } from '@/hooks/use-user-profile'
import { useUserInterviews } from '@/hooks/use-user-interviews'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown,
  CreditCard,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UserStatsProps {
  className?: string
  showRefresh?: boolean
}

export function UserStats({ className = '', showRefresh = false }: UserStatsProps) {
  const { user } = useAuth()
  const {
    profile: userProfile,
    loading: profileLoading,
    error: profileError,
    refreshProfile,
    plan,
    credits
  } = useUserProfile()

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    refreshInterviews,
    totalSessions,
    averageScore
  } = useUserInterviews(user?.id || null)

  const isLoading = profileLoading || sessionsLoading
  const hasError = profileError || sessionsError

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        <Card className="col-span-3">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Stats</h3>
              <p className="text-muted-foreground mb-4">
                {profileError || sessionsError || 'Failed to load user statistics'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={refreshProfile} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Profile
                </Button>
                <Button onClick={refreshInterviews} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Current Plan */}
      <Card className={plan !== 'free' ? 'bg-yellow-50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          <Crown className="w-4 h-4"/>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="text-sm">
              {plan}
            </Badge>
            {plan === 'free' && (
              <Badge variant="outline" className="text-xs">
                Basic
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {plan === 'free' ? 'Free tier with limited features' :
             plan === 'monthly' ? 'Monthly subscription' :
             'Credit-based plan'}
          </p>
        </CardContent>
      </Card>

      {/* Remaining Credits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining Credits</CardTitle>
          <CreditCard className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 mb-2">{credits}</div>
          <p className="text-xs text-muted-foreground">
            {credits > 0 ? 'Available interview sessions' : 'No credits remaining'}
          </p>
          {credits === 0 && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Upgrade Required
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Interviews Completed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{totalSessions}</div>
          {averageScore > 0 && (
            <div className="text-lg font-semibold text-blue-600 mb-2">
              {averageScore.toFixed(1)} avg score
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{totalSessions} total</span>
            </div>
            {averageScore > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Out of 10</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button (Optional) */}
      {showRefresh && (
        <div className="col-span-3 flex justify-end">
          <Button
            onClick={() => {
              refreshProfile()
              refreshInterviews()
              toast.success('Refreshing user statistics...')
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>
      )}
    </div>
  )
}