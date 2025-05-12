// src/ai/flows/markdown-qa.ts
'use server';

/**
 * @fileOverview Provides AI-powered Question & Answering capabilities against Markdown documents.
 *
 * - markdownQA - A function that answers a question based on provided Markdown content.
 * - MarkdownQAInput - The input type for the markdownQA function.
 * - MarkdownQAOutput - The return type for the markdownQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the Markdown Q&A flow
const MarkdownQAInputSchema = z.object({
  question: z.string().describe('The question to ask about the Markdown document.'),
  markdownContent: z
    .string()
    .describe('The content of the Markdown document to search within.'),
});
export type MarkdownQAInput = z.infer<typeof MarkdownQAInputSchema>;

// Define the output schema for the Markdown Q&A flow
const MarkdownQAOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question, derived solely from the provided Markdown content.'),
  foundInDocument: z
    .boolean()
    .describe(
      'Indicates whether the answer could be found within the provided Markdown document.'
    ),
  citations: z
    .array(z.string())
    .optional()
    .describe(
      'Specific quotes or sections from the Markdown document that support the answer.'
    ),
});
export type MarkdownQAOutput = z.infer<typeof MarkdownQAOutputSchema>;

/**
 * Performs Question & Answering against the provided Markdown content.
 * @param input - The question and the Markdown document content.
 * @returns A promise that resolves to the answer, citation information, and whether the answer was found.
 */
export async function markdownQA(input: MarkdownQAInput): Promise<MarkdownQAOutput> {
  // Input validation (basic)
  if (!input.question?.trim()) {
    throw new Error('Question cannot be empty.');
  }
  if (!input.markdownContent?.trim()) {
    throw new Error('Markdown content cannot be empty.');
  }
  
  return markdownQAFlow(input);
}

// Define the prompt for the AI model
const markdownQAPrompt = ai.definePrompt({
  name: 'markdownQAPrompt',
  input: {schema: MarkdownQAInputSchema},
  output: {schema: MarkdownQAOutputSchema},
  prompt: `You are an AI assistant specialized in answering questions based *only* on the provided Markdown document content.

  **Task:** Answer the user's question using *exclusively* the information present in the 'Markdown Content' section below.

  **Instructions:**
  1.  Read the 'Question' carefully.
  2.  Thoroughly analyze the 'Markdown Content'.
  3.  Formulate an answer based *solely* on the provided Markdown. Do not use any external knowledge or make assumptions.
  4.  If the answer is found in the document, set 'foundInDocument' to true. Extract 1-3 brief, relevant quotes or sections from the Markdown that directly support your answer and include them in the 'citations' array.
  5.  If the answer cannot be reasonably inferred from the document, set 'foundInDocument' to false, provide a concise answer stating that the information is not present in the document (e.g., "The provided document does not contain information about [topic of the question]."), and leave the 'citations' array empty or omit it.
  6.  Return the result as a single JSON object matching the defined output schema.

  **Question:**
  {{{question}}}

  **Markdown Content:**
  \`\`\`markdown
  {{{markdownContent}}}
  \`\`\`

  **Your JSON Output:**
  `,
  config: {
    // Higher temperature might be needed for summarization/extraction, adjust if needed
    // temperature: 0.5, 
  },
});

// Define the Genkit flow
const markdownQAFlow = ai.defineFlow(
  {
    name: 'markdownQAFlow',
    inputSchema: MarkdownQAInputSchema,
    outputSchema: MarkdownQAOutputSchema,
  },
  async input => {
    console.log("Executing markdownQAFlow with input:", input.question);
    try {
      const {output} = await markdownQAPrompt(input);
      if (!output) {
         console.error("markdownQAFlow received null output from prompt.");
         throw new Error("AI failed to generate a response.");
      }
      console.log("markdownQAFlow received output:", output);
      // Ensure the output structure matches the schema, especially boolean field
      return {
        ...output,
        foundInDocument: !!output.foundInDocument // Explicit boolean conversion
      };
    } catch(error) {
        console.error("Error during markdownQAFlow execution:", error);
        // Provide a fallback error response matching the schema
        return {
            answer: "An error occurred while processing the document.",
            foundInDocument: false,
            citations: []
        }
    }
  }
);
