import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  User, 
  Copy, 
  Check, 
  GraduationCap, 
  ArrowLeft,
  MessageSquare 
} from "lucide-react";
import { useState } from "react";
import type { SharedAnswer } from "@shared/schema";

export default function SharedAnswerPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [copied, setCopied] = useState(false);

  const { data: answer, isLoading, error } = useQuery<SharedAnswer>({
    queryKey: ["/api/shared-answers", shareId],
    enabled: !!shareId,
  });

  const copyToClipboard = async () => {
    if (!answer) return;
    await navigator.clipboard.writeText(answer.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !answer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Answer Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This shared answer may have been removed or the link is invalid.
          </p>
          <Button asChild>
            <a href="/">Go to Study Buddy</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <span className="font-semibold">Study Buddy</span>
          </div>
          <Button variant="outline" asChild>
            <a href="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Open App
            </a>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Shared Answer from Study Buddy AI</p>
          <h1 className="text-2xl font-bold">Study Resource</h1>
        </div>

        <div className="space-y-6">
          {/* Question */}
          {answer.question && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-muted">
                  <User className="w-4 h-4" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[90%]">
                <p className="text-sm whitespace-pre-wrap">{answer.question}</p>
              </div>
            </div>
          )}

          {/* Answer */}
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-primary/10">
                <Brain className="w-4 h-4 text-primary" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
                  data-testid="button-copy-answer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      Copy Answer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Want your own AI study assistant?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Study Buddy helps you manage schedules, track tasks, and get personalized study recommendations.
            </p>
            <Button asChild data-testid="button-try-study-buddy">
              <a href="/api/login">Try Study Buddy Free</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
