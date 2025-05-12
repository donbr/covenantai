// src/lib/actions.ts
"use server";

import { covenantSearch, CovenantSearchInput, CovenantSearchOutput } from "@/ai/flows/covenant-search";
import { summarizeCovenant, SummarizeCovenantInput, SummarizeCovenantOutput } from "@/ai/flows/covenant-summarization";

export interface AIResponse {
  summary: string;
  confidence: number;
  relevantSections: string;
}

export async function handleQuestionSubmission(question: string): Promise<AIResponse> {
  if (!question.trim()) {
    throw new Error("Question cannot be empty.");
  }

  try {
    // Step 1: Search for relevant sections
    const searchInput: CovenantSearchInput = { question };
    const searchResult: CovenantSearchOutput = await covenantSearch(searchInput);

    if (!searchResult.answer) {
      // Handle case where no relevant sections are found
      // This could be refined based on how covenantSearch indicates "not found"
      return {
        summary: "No relevant sections found in the covenant documents for your question.",
        confidence: 0, // Or a specific low value
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
      relevantSections: searchResult.answer, // Return the original relevant sections for full context
    };
  } catch (error) {
    console.error("Error processing question with AI:", error);
    // It's better to throw a more specific error or return an error object
    // For simplicity, re-throwing but this could be enhanced
    if (error instanceof Error) {
      throw new Error(`An error occurred while processing your question: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing your question.");
  }
}
