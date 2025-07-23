'use client'

import { useUserProfile } from '@/hooks/use-user-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, User, Mail, CreditCard, Crown } from 'lucide-react'

export function UserProfileExample() {
  const { 
    profile, 
    loading, 
    error, 
    refreshProfile,
    email, 
    name, 
    plan, 
    credits 
  } = useUserProfile()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshProfile} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No user profile found. Please log in.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          User Profile
        </CardTitle>
        <CardDescription>
          Your account information and subscription details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Email:</span>
            <span>{email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Name:</span>
            <span>{name || 'Not set'}</span>
          </div>
        </div>

        {/* Plan & Credits */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-medium">Plan:</span>
            <Badge variant={plan === 'free' ? 'secondary' : 'default'}>
              {plan}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="font-medium">Credits:</span>
            <span className="font-bold text-green-600">{credits}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={refreshProfile} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 