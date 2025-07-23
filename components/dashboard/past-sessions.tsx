'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  History,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  Star,
  TrendingUp,
  Eye,
  Download,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

export function PastSessions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  const sessions = [
    {
      id: 1,
      title: 'Frontend Developer Interview',
      date: '2024-01-15',
      duration: '35 min',
      score: 8.5,
      type: 'Technical',
      level: 'Mid Level',
      questionsAnswered: 12,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Product Manager Interview',
      date: '2024-01-12',
      duration: '42 min',
      score: 7.8,
      type: 'Behavioral',
      level: 'Senior Level',
      questionsAnswered: 10,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Data Scientist Interview',
      date: '2024-01-10',
      duration: '38 min',
      score: 9.2,
      type: 'Technical',
      level: 'Mid Level',
      questionsAnswered: 11,
      status: 'completed'
    },
    {
      id: 4,
      title: 'Full Stack Developer Interview',
      date: '2024-01-08',
      duration: '45 min',
      score: 8.0,
      type: 'Mixed',
      level: 'Mid Level',
      questionsAnswered: 14,
      status: 'completed'
    },
    {
      id: 5,
      title: 'UI/UX Designer Interview',
      date: '2024-01-05',
      duration: '32 min',
      score: 8.7,
      type: 'Portfolio',
      level: 'Mid Level',
      questionsAnswered: 9,
      status: 'completed'
    }
  ];

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || session.type.toLowerCase() === filterBy.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const averageScore = sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length;
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((sum, session) => sum + parseInt(session.duration), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Past Sessions</h1>
          <p className="text-muted-foreground mt-1">Review your interview performance and track progress</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <History className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTime / 60)}h {totalTime % 60}m</div>
            <p className="text-xs text-muted-foreground">
              Practice time invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              Score improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{session.title}</h3>
                    <Badge variant="outline">{session.type}</Badge>
                    <Badge variant="secondary">{session.level}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {session.questionsAnswered} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {session.score}/10
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="text-2xl font-bold text-green-600">{session.score}</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or start a new interview session.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}