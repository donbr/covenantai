// src/components/covenant-ai/answer-display.tsx
"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Info, FileText, ShieldAlert } from "lucide-react";

interface AnswerDisplayProps {
  summary: string;
  confidence: number;
  relevantSections: string;
}

const CONFIDENCE_THRESHOLD = 0.7; // Example threshold

export function AnswerDisplay({ summary, confidence, relevantSections }: AnswerDisplayProps) {
  const isLowConfidence = confidence < CONFIDENCE_THRESHOLD;
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">AI Generated Answer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLowConfidence && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
             <ShieldAlert className="h-5 w-5 text-destructive" />
            <AlertTitle className="font-semibold text-destructive">Low Confidence Warning</AlertTitle>
            <AlertDescription className="text-destructive/90">
              The AI is not highly confident in this answer ({confidencePercentage}%). Please verify critical information with HOA board members or by consulting the covenant documents directly.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground/90">Summary:</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            <ReactMarkdown>{summary || "No summary available."}</ReactMarkdown>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground/90">Confidence Score:</h3>
          <div className="flex items-center space-x-3">
            <Progress value={confidencePercentage} className="w-full h-3" aria-label={`Confidence: ${confidencePercentage}%`} />
            <span className="text-sm font-medium text-primary">{confidencePercentage}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This score represents the AI's confidence in the provided summary based on the available document sections.
          </p>
        </div>

        <Separator />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="relevant-sections">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>View Relevant Document Sections</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2 p-4 bg-secondary/50 rounded-md border max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-secondary-foreground leading-relaxed font-mono">
                   <ReactMarkdown>{relevantSections || "No specific sections were highlighted for this query."}</ReactMarkdown>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <CardDescription className="text-xs italic">
          Covenant Chat provides information based on covenant documents. Always refer to the official documents or consult with the HOA board for definitive guidance.
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
