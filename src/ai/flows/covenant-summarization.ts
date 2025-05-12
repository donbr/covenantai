// src/ai/flows/covenant-summarization.ts
'use server';

/**
 * @fileOverview Summarizes relevant sections of covenant documents to answer user questions.
 *
 * - summarizeCovenant - A function that summarizes covenant sections.
 * - SummarizeCovenantInput - The input type for the summarizeCovenant function.
 * - SummarizeCovenantOutput - The return type for the summarizeCovenant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCovenantInputSchema = z.object({
  question: z.string().describe('The question the user is asking about the covenant.'),
  relevantSections: z.string().describe('The relevant sections of the covenant document.'),
});

export type SummarizeCovenantInput = z.infer<typeof SummarizeCovenantInputSchema>;

const SummarizeCovenantOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the relevant covenant sections answering the user question.'),
  confidence: z.number().describe('The confidence level of the summary, from 0 to 1.'),
});

export type SummarizeCovenantOutput = z.infer<typeof SummarizeCovenantOutputSchema>;

export async function summarizeCovenant(input: SummarizeCovenantInput): Promise<SummarizeCovenantOutput> {
  return covenantSummarizationFlow(input);
}

const covenantSummarizationPrompt = ai.definePrompt({
  name: 'covenantSummarizationPrompt',
  input: {schema: SummarizeCovenantInputSchema},
  output: {schema: SummarizeCovenantOutputSchema},
  prompt: `Summarize the following sections of the covenant document to answer the user's question. Also, estimate a confidence level (0-1) of the quality of the answer, based on the clarity, relevance, and completeness of the documents provided. Return a single JSON object.

User's Question: {{{question}}}

Relevant Covenant Sections:
{{{relevantSections}}}`,
});

const covenantSummarizationFlow = ai.defineFlow(
  {
    name: 'covenantSummarizationFlow',
    inputSchema: SummarizeCovenantInputSchema,
    outputSchema: SummarizeCovenantOutputSchema,
  },
  async input => {
    const {output} = await covenantSummarizationPrompt(input);
    return output!;
  }
);
