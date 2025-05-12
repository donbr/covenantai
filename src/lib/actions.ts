// src/lib/actions.ts
"use server";

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
  if (!question.trim()) {
    throw new Error("Question cannot be empty.");
  }

  try {
    // Step 1: Search for relevant sections (Assuming this searches pre-indexed covenant data)
    const searchInput: CovenantSearchInput = { question };
    // TODO: The covenantSearch flow needs actual implementation to search documents.
    // For now, it might return placeholder or dummy data based on its current prompt.
    // const searchResult: CovenantSearchOutput = await covenantSearch(searchInput);
    
    // Placeholder until covenantSearch is fully implemented
     const searchResult: CovenantSearchOutput = { answer: `Placeholder relevant section for question: ${question}` };
     console.warn("Using placeholder data for covenant search results.");


    if (!searchResult.answer) {
      return {
        summary: "No relevant sections found in the covenant documents for your question.",
        confidence: 0,
        relevantSections: "N/A",
      };
    }

    // Step 2: Summarize the found sections
    const summarizeInput: SummarizeCovenantInput = {
      question,
      relevantSections: searchResult.answer,
    };
    const summarizationResult: SummarizeCovenantOutput = await summarizeCovenant(summarizeInput);

    return {
      summary: summarizationResult.summary,
      confidence: summarizationResult.confidence,
      relevantSections: searchResult.answer,
    };
  } catch (error) {
    console.error("Error processing covenant question with AI:", error);
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
  if (!question.trim()) {
    throw new Error("Question cannot be empty.");
  }
  if (!markdownContent.trim()) {
    throw new Error("Markdown content cannot be empty.");
  }

  try {
    const input: MarkdownQAInput = { question, markdownContent };
    const result: MarkdownQAOutput = await markdownQA(input);

    return {
      answer: result.answer,
      foundInDocument: result.foundInDocument,
      citations: result.citations,
    };
  } catch (error) {
    console.error("Error processing Markdown Q&A:", error);
    if (error instanceof Error) {
      throw new Error(`An error occurred while processing your Markdown question: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing your Markdown question.");
  }
}
