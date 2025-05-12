// src/app/page.tsx
"use client";

import * as React from "react";
import { QuestionForm } from "@/components/covenant-ai/question-form";
import { AnswerDisplay } from "@/components/covenant-ai/answer-display";
import { handleQuestionSubmission, type AIResponse } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { BookText, AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CovenantQAPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aiResponse, setAiResponse] = React.useState<AIResponse | null>(null);

  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null); // Clear previous response

    try {
      const response = await handleQuestionSubmission(question);
      setAiResponse(response);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 pt-8 md:p-8">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <BookText className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight">CovenantAI</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Your AI-powered assistant for understanding HOA covenant documents.
        </p>
      </header>

      <main className="w-full max-w-3xl space-y-10">
        <section className="p-8 bg-card rounded-xl shadow-2xl border">
          <QuestionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </section>

        {isLoading && (
          <section className="space-y-6">
            <div className="flex items-center justify-center text-primary py-4">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg font-semibold">CovenantAI is thinking...</span>
            </div>
            <Skeleton className="h-12 w-1/3 mx-auto" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </section>
        )}

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {aiResponse && !isLoading && (
          <section className="animate-fadeIn">
            <AnswerDisplay
              summary={aiResponse.summary}
              confidence={aiResponse.confidence}
              relevantSections={aiResponse.relevantSections}
            />
          </section>
        )}
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground w-full max-w-3xl">
        <Separator className="my-6" />
        <p>&copy; {new Date().getFullYear()} CovenantAI. For informational purposes only.</p>
        <p>Always consult official HOA documents and personnel for binding decisions.</p>
      </footer>

      {/* Simple fadeIn animation style */}
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
