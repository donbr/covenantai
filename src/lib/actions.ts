
// src/lib/actions.ts
"use server";

import fs from 'fs/promises'; // Import file system module

import { covenantSearch, CovenantSearchInput, CovenantSearchOutput } from "@/ai/flows/covenant-search";
import { summarizeCovenant, SummarizeCovenantInput, SummarizeCovenantOutput } from "@/ai/flows/covenant-summarization";
import { markdownQA, MarkdownQAInput, MarkdownQAOutput } from "@/ai/flows/markdown-qa"; // Import new flow

// Existing interface for Covenant AI response
export interface AIResponse {
  summary: string;
  confidence: number;
  relevantSections: string;
}

// New interface for Markdown Q&A response
export interface MarkdownQAResponse {
  answer: string;
  foundInDocument: boolean;
  citations?: string[];
}

export async function handleQuestionSubmission(question: string): Promise<AIResponse> {
  console.log("[actions.ts] handleQuestionSubmission called with question:", question);

  if (!question.trim()) {
    console.error("[actions.ts] Question is empty.");
    throw new Error("Question cannot be empty.");
  }

  // Main try-catch block for overall error handling
  try {
    // Attempt Q&A against the specific Markdown document first
    let markdownQAUsed = false;
    let markdownQAAnswer: MarkdownQAResponse | null = null;
    try {
      console.log("[actions.ts] Attempting Markdown Q&A.");
      const markdownContent = await fs.readFile('docs/ambrose-lake-covenants-marker.md', 'utf-8');
      markdownQAAnswer = await handleMarkdownQASubmission(question, markdownContent);
      if (markdownQAAnswer.foundInDocument) {
        console.log("[actions.ts] Answer found in Markdown document.");
        markdownQAUsed = true;
      } else {
        console.log("[actions.ts] Answer not found in Markdown document or low confidence.");
      }
    } catch (markdownError) {
      console.error("[actions.ts] Error processing Markdown Q&A, falling back to general search:", markdownError);
      // Continue to the original flow if Markdown Q&A fails
    }

    if (markdownQAUsed && markdownQAAnswer) {
      // Use the answer from Markdown QA if found in the document
      return {
        summary: markdownQAAnswer.answer,
        confidence: 1, // Assume high confidence if found in the specific document
        relevantSections: markdownQAAnswer.citations?.join('\n\n') || "No specific citations provided.",
      };
    } else {
      console.log("[actions.ts] Markdown Q&A did not yield a definitive answer. Proceeding to general search and summarization.");
      // Step 1: Search for relevant sections
      const searchInput: CovenantSearchInput = { question };
      console.log("[actions.ts] Calling covenantSearch flow with input:", searchInput);
      const searchResult: CovenantSearchOutput = await covenantSearch(searchInput);    
      console.log("[actions.ts] covenantSearch flow result:", searchResult);
      
      if (!searchResult.answer || searchResult.answer.trim() === "") {
        console.warn("[actions.ts] No relevant sections found by covenantSearch.");
        return {
          summary: "No relevant sections found in the covenant documents for your question using the general search.",
          confidence: 0,
          relevantSections: "N/A",
        };
      }
      
      // Step 2: Summarize the found sections
      const summarizeInput: SummarizeCovenantInput = {
        question,
        relevantSections: searchResult.answer,
      };
      console.log("[actions.ts] Calling summarizeCovenant flow with input:", summarizeInput);
      const summarizationResult: SummarizeCovenantOutput = await summarizeCovenant(summarizeInput);
      console.log("[actions.ts] summarizeCovenant flow result:", summarizationResult);

      return {
        summary: summarizationResult.summary,
        confidence: summarizationResult.confidence,
        relevantSections: searchResult.answer,
      };
    }
  } catch (error) {
    console.error("[actions.ts] Error processing covenant question with AI:", error);
    if (error instanceof Error) {
      throw new Error(`An error occurred while processing your covenant question: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing your covenant question.");
  }
}

/**
 * Handles the submission of a question and Markdown content for Q&A.
 * @param question - The user's question.
 * @param markdownContent - The Markdown content to search within.
 * @returns A promise that resolves to the AI's answer and citation details.
 */
export async function handleMarkdownQASubmission(question: string, markdownContent: string): Promise<MarkdownQAResponse> {
  console.log("[actions.ts] handleMarkdownQASubmission called with question:", question);
  if (!question.trim()) {
    console.error("[actions.ts] Markdown Q&A: Question is empty.");
    throw new Error("Question cannot be empty.");
  }
  if (!markdownContent.trim()) {
    console.error("[actions.ts] Markdown Q&A: Markdown content is empty.");
    throw new Error("Markdown content cannot be empty.");
  }

  try {
    const input: MarkdownQAInput = { question, markdownContent };
    console.log("[actions.ts] Calling markdownQA flow with input:", input.question);
    const result: MarkdownQAOutput = await markdownQA(input);
    console.log("[actions.ts] markdownQA flow result:", result);

    return {
      answer: result.answer,
      foundInDocument: result.foundInDocument,
      citations: result.citations,
    };
  } catch (error) {
    console.error("[actions.ts] Error processing Markdown Q&A:", error);
    if (error instanceof Error) {
      throw new Error(`An error occurred while processing your Markdown question: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing your Markdown question.");
  }
}
