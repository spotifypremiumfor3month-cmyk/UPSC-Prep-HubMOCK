import React from 'react';
import { useGetTodayDailyPractice, getGetTodayDailyPracticeQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from 'wouter';

export function Daily() {
  const { data: todayPractice, isLoading } = useGetTodayDailyPractice({
    query: { queryKey: getGetTodayDailyPracticeQueryKey() }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Daily Practice</h1>
        <p className="text-muted-foreground mt-1">Build discipline with daily targeted MCQs.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-2 border-primary/20 shadow-md">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-accent mb-2">
              <CalendarDays className="h-4 w-4" /> TODAY'S SET
            </div>
            <CardTitle className="text-2xl font-serif">
              {todayPractice?.title || "Fetching today's practice..."}
            </CardTitle>
            <CardDescription>
              {todayPractice ? formatDate(todayPractice.practiceDate) : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">Loading daily set...</div>
            ) : todayPractice ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm">
                  <div className="px-3 py-1.5 bg-muted rounded-md font-medium">
                    Subject: {todayPractice.subject}
                  </div>
                  <div className="px-3 py-1.5 bg-muted rounded-md font-medium text-primary">
                    {todayPractice.questionCount} Questions
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Complete today's set to maintain your streak. These questions are curated based on recent events and core syllabus areas.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold">You're all caught up!</h3>
                <p className="text-muted-foreground mt-2">No daily practice scheduled for today. Check back tomorrow.</p>
              </div>
            )}
          </CardContent>
          {todayPractice && (
            <CardFooter className="bg-muted/10 border-t">
              <Button className="w-full" size="lg">Start Today's Practice</Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* TODO: History of daily sets */}
    </div>
  );
}
