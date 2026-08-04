import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGetTest, getGetTestQueryKey, useCreateAttempt, AnswerInputSelectedOption } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatTime, cn } from '@/lib/utils';
import { AlertCircle, Clock, ChevronLeft, ChevronRight, Flag, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

type AnswerMap = Record<number, AnswerInputSelectedOption>;
type ReviewMap = Record<number, boolean>;

export function TestDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const testId = Number(id);

  const { data: test, isLoading, error } = useGetTest(testId, {
    query: { enabled: !!testId, queryKey: getGetTestQueryKey(testId) }
  });

  const createAttempt = useCreateAttempt();

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [markedForReview, setMarkedForReview] = useState<ReviewMap>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer logic
  useEffect(() => {
    if (started && test && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(answers, test.duration * 60); // Auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, test, timeLeft]);

  // Init timer when test loads
  useEffect(() => {
    if (test && !started) {
      setTimeLeft(test.duration * 60);
    }
  }, [test, started]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading test...</div>;
  if (error || !test) return <div className="min-h-screen flex items-center justify-center text-destructive">Error loading test</div>;

  const questions = test.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    setStarted(true);
  };

  const handleSelectOption = (qId: number, option: AnswerInputSelectedOption) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleClearResponse = (qId: number) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleToggleReview = (qId: number) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmit = async (finalAnswers: AnswerMap, timeTakenSecs: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const answersArray = questions.map(q => ({
        questionId: q.id,
        selectedOption: finalAnswers[q.id] || null
      }));

      const res = await createAttempt.mutateAsync({
        data: {
          testId,
          timeTaken: timeTakenSecs,
          answers: answersArray
        }
      });
      
      toast.success("Test submitted successfully!");
      setLocation(`/tests/${res.id}/result`);
    } catch (err) {
      toast.error("Failed to submit test. Please try again.");
      setIsSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (confirm(`You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`)) {
      handleSubmit(answers, test.duration * 60 - timeLeft);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <Card className="max-w-xl w-full p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold">{test.title}</h1>
          <p className="text-muted-foreground">{test.description}</p>
          
          <div className="grid grid-cols-2 gap-4 py-6 border-y">
            <div>
              <div className="text-2xl font-bold font-mono">{test.questionCount}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{test.duration}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{test.totalMarks}</div>
              <div className="text-sm text-muted-foreground">Max Marks</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">-{test.negativeMarks || 0}</div>
              <div className="text-sm text-muted-foreground">Negative Marks</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm text-left flex gap-3 items-start border border-yellow-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <strong>Instructions:</strong> Do not refresh or close the page while taking the test. The test will auto-submit when the timer runs out.
            </div>
          </div>
          
          <Button onClick={handleStart} size="lg" className="w-full text-lg h-14">
            Begin Test
          </Button>
        </Card>
      </div>
    );
  }

  const isLowTime = timeLeft < 300; // less than 5 mins

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      {/* Test Header */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="font-semibold truncate max-w-[300px] md:max-w-md">{test.title}</div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 font-mono text-lg font-bold px-3 py-1 rounded-md",
            isLowTime ? "bg-red-100 text-red-700 animate-pulse" : "bg-muted"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <Button onClick={confirmSubmit} variant="destructive" size="sm" disabled={isSubmitting}>
            Submit Test
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Question Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 max-w-3xl mx-auto w-full p-6 lg:p-10 flex flex-col">
            {currentQuestion ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground flex gap-3">
                    <span>+{(test.totalMarks/test.questionCount).toFixed(2)}</span>
                    <span className="text-red-500">-{test.negativeMarks}</span>
                  </div>
                </div>

                <div className="text-lg mb-8 leading-relaxed font-medium">
                  {currentQuestion.text}
                </div>

                <div className="space-y-3 mb-8">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt;
                    const optKey = `option${opt}` as keyof typeof currentQuestion;
                    return (
                      <div 
                        key={opt}
                        onClick={() => handleSelectOption(currentQuestion.id, opt as AnswerInputSelectedOption)}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all flex gap-4 items-start",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                          isSelected ? "border-primary bg-primary text-primary-foreground text-xs font-bold" : "border-muted-foreground text-transparent"
                        )}>
                          {isSelected && "✓"}
                        </div>
                        <div className={cn("flex-1", isSelected ? "text-foreground font-medium" : "text-muted-foreground")}>
                          <span className="font-bold mr-2 text-foreground">{opt}.</span>
                          {currentQuestion[optKey]}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-3 mt-auto pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleToggleReview(currentQuestion.id)}
                    className={cn(markedForReview[currentQuestion.id] && "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100")}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {markedForReview[currentQuestion.id] ? "Unmark Review" : "Mark for Review"}
                  </Button>
                  
                  {answers[currentQuestion.id] && (
                    <Button variant="ghost" onClick={() => handleClearResponse(currentQuestion.id)}>
                      <XCircle className="h-4 w-4 mr-2" /> Clear
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="m-auto text-muted-foreground">Question not found</div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className="h-16 border-t bg-card px-6 flex items-center justify-between shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            
            <Button 
              variant="default" 
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </main>

        {/* Sidebar Navigation */}
        <aside className="w-72 border-l bg-muted/10 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 border-b bg-card">
            <div className="font-medium mb-3">Question Palette</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-primary"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-white border border-border"></div> Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-400"></div> Marked</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isMarked = !!markedForReview[q.id];
                const isCurrent = idx === currentIndex;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-10 h-10 rounded-md text-sm font-medium flex items-center justify-center border transition-all",
                      isCurrent ? "ring-2 ring-ring ring-offset-1" : "",
                      isAnswered && !isMarked ? "bg-primary text-primary-foreground border-primary" :
                      isMarked ? "bg-yellow-400 text-yellow-900 border-yellow-500" :
                      "bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
