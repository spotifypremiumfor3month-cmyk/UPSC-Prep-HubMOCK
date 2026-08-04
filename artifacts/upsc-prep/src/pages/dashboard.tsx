import React from 'react';
import { useGetDashboardStats, useGetRecentActivity, useGetSubjectStats, useGetLeaderboard } from '@workspace/api-client-react';
import { getGetDashboardStatsQueryKey, getGetRecentActivityQueryKey, getGetSubjectStatsQueryKey, getGetLeaderboardQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Trophy, Target, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDate } from '@/lib/utils';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: subjectStats, isLoading: subjectStatsLoading } = useGetSubjectStats({ query: { queryKey: getGetSubjectStatsQueryKey() } });
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Overview</h1>
          <p className="text-muted-foreground mt-1">Track your preparation progress and daily goals.</p>
        </div>
        <Link href="/daily">
          <Button variant="saffron">
            {stats?.todayHasPractice ? "Resume Daily Practice" : "Start Daily Practice"}
          </Button>
        </Link>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Questions" 
          value={stats?.totalQuestions ?? 0} 
          icon={Target} 
          trend={`+${stats?.questionsThisWeek ?? 0} this week`}
          loading={statsLoading} 
        />
        <StatCard 
          title="Tests Attempted" 
          value={stats?.totalAttempts ?? 0} 
          icon={Trophy} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Average Score" 
          value={`${(stats?.averageScore ?? 0).toFixed(1)}%`} 
          icon={Activity} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Study Materials" 
          value={stats?.totalPdfs ?? 0} 
          icon={BookOpen} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Breakdown Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Subject Mastery</CardTitle>
            <CardDescription>Questions available vs attempted by subject</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {subjectStatsLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : subjectStats && subjectStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} 
                    angle={-45} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip 
                    cursor={{fill: 'var(--color-muted)', opacity: 0.2}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="questionCount" name="Total Questions" radius={[4, 4, 0, 0]}>
                    {subjectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No subject data available</div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard or Recent Activity */}
        <div className="space-y-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" /> Top Aspirants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.slice(0, 5).map((user) => (
                    <div key={user.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-sm font-bold text-muted-foreground w-4">{user.rank}</div>
                        <div className="text-sm font-medium">{user.name}</div>
                      </div>
                      <div className="text-sm font-bold">{user.averageScore.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No attempts recorded yet</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="flex gap-3 text-sm">
                      <div className="mt-0.5">
                        {act.type === 'test_created' ? <FileText className="h-4 w-4 text-primary" /> : 
                         act.type === 'pdf_uploaded' ? <BookOpen className="h-4 w-4 text-accent" /> :
                         <Activity className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div>
                        <div className="font-medium">{act.title}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(act.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No recent activity</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, trend }: { title: string, value: string | number, icon: any, loading?: boolean, trend?: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline justify-between mt-2">
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-3xl font-bold tracking-tight">{value}</div>
          )}
        </div>
        {trend && <p className="text-xs text-accent mt-2 font-medium">{trend}</p>}
      </CardContent>
    </Card>
  );
}
