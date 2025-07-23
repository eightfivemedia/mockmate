'use client'

import { UserStats } from '@/components/dashboard/user-stats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Settings } from 'lucide-react'

export function UserStatsExample() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">User Statistics</h2>
        <p className="text-muted-foreground">
          Overview of your account status and interview progress
        </p>
      </div>

      {/* UserStats Component */}
      <UserStats showRefresh={true} />

      {/* Additional Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Usage Information
            </CardTitle>
            <CardDescription>
              How to make the most of your MockMate account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Free Plan Features</span>
                <Badge variant="secondary">Limited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium Features</span>
                <Badge variant="default">Unlimited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Feedback</span>
                <Badge variant="outline">Basic</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Manage your account and upgrade options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Upgrade Plan</span>
                <Badge variant="outline" className="text-xs">Recommended</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Buy Credits</span>
                <Badge variant="secondary" className="text-xs">Pay-per-use</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">View History</span>
                <Badge variant="outline" className="text-xs">All Sessions</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 