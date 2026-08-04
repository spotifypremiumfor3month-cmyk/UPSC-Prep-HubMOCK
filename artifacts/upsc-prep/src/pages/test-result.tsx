import React from 'react';
import { useParams, Link } from 'wouter';
import { useGetAttempt, getGetAttemptQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, Trophy, Clock, Target } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function TestResult() {
  const { id } = useParams();
  const attemptId = Number(id);

  const { data: result, isLoading } = useGetAttempt(attemptId, {
    query: { enabled: !!attemptId, queryKey: getGetAttemptQueryKey(attemptId) }
  });

  if (isLoading) return <div>Loading results...</div>;
  if (!result) return <div>Result not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex items-center gap-4">
        <Link href="/tests">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Test Result</h1>
          <p className="text-muted-foreground">{result.testTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-6">
            <div className="text-primary-foreground/80 text-sm font-medium mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Score
            </div>
            <div className="text-4xl font-bold">{result.score} <span className="text-xl font-normal opacity-80">/ {result.totalMarks}</span></div>
            <div className="mt-2 text-sm opacity-90">{result.percentage.toFixed(1)}% Accuracy</div>
          </CardContent>
        </Card>
        
        <StatBox label="Correct" value={result.correct} icon={CheckCircle2} color="text-green-500" />
        <StatBox label="Incorrect" value={result.incorrect} icon={XCircle} color="text-red-500" />
        <StatBox label="Skipped" value={result.skipped} icon={MinusCircle} color="text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {result.answers?.map((ans, idx) => (
              <div key={ans.questionId} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex gap-4">
                  <div className="shrink-0 pt-1">
                    {ans.isCorrect && !ans.selectedOption ? (
                      <MinusCircle className="h-6 w-6 text-muted-foreground" />
                    ) : ans.isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-sm font-bold text-muted-foreground mb-1">Q{idx + 1}</div>
                      <div className="font-medium text-lg">{ans.questionText}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optKey = `option${opt}` as keyof typeof ans;
                        const text = ans[optKey];
                        if (!text) return null;
                        
                        const isCorrect = ans.correctOption === opt;
                        const isSelected = ans.selectedOption === opt;
                        
                        return (
                          <div key={opt} className={cn(
                            "p-3 rounded-md border",
                            isCorrect ? "bg-green-50 border-green-200" :
                            isSelected ? "bg-red-50 border-red-200" : "bg-card"
                          )}>
                            <span className="font-bold mr-2">{opt}.</span>
                            <span className={cn(isCorrect ? "text-green-900" : isSelected ? "text-red-900" : "")}>{text}</span>
                            {isCorrect && <Badge variant="success" className="ml-2 py-0 h-5 text-[10px]">Correct Answer</Badge>}
                            {isSelected && !isCorrect && <Badge variant="destructive" className="ml-2 py-0 h-5 text-[10px]">Your Answer</Badge>}
                          </div>
                        )
                      })}
                    </div>

                    {ans.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-md text-sm border border-blue-100">
                        <div className="font-bold mb-1 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" /> Explanation
                        </div>
                        {ans.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-full bg-muted/50", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

import { BookOpen } from 'lucide-react';
