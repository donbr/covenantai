// use server'

/**
 * @fileOverview This file defines a Genkit flow for searching covenant documents based on a user's question.
 *
 * - covenantSearch - A function that accepts a question and returns relevant sections from the covenant documents.
 * - CovenantSearchInput - The input type for the covenantSearch function.
 * - CovenantSearchOutput - The return type for the covenantSearch function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CovenantSearchInputSchema = z.object({
  question: z.string().describe('The question to search the covenant documents for.'),
});
export type CovenantSearchInput = z.infer<typeof CovenantSearchInputSchema>;

const CovenantSearchOutputSchema = z.object({
  answer: z.string().describe('The relevant sections from the covenant documents that answer the question.'),
});
export type CovenantSearchOutput = z.infer<typeof CovenantSearchOutputSchema>;

export async function covenantSearch(input: CovenantSearchInput): Promise<CovenantSearchOutput> {
  return covenantSearchFlow(input);
}

const covenantSearchPrompt = ai.definePrompt({
  name: 'covenantSearchPrompt',
  input: {schema: CovenantSearchInputSchema},
  output: {schema: CovenantSearchOutputSchema},
  prompt: `You are an AI assistant that searches covenant documents to answer questions.

  Use the following information to answer the question:

  Question: {{{question}}}
  `,
});

const covenantSearchFlow = ai.defineFlow(
  {
    name: 'covenantSearchFlow',
    inputSchema: CovenantSearchInputSchema,
    outputSchema: CovenantSearchOutputSchema,
  },
  async input => {
    const {output} = await covenantSearchPrompt(input);
    return output!;
  }
);
