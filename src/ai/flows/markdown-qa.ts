// src/ai/flows/markdown-qa.ts
'use server';

/**
 * @fileOverview Provides AI-powered Question & Answering capabilities against Markdown documents, specifically HOA covenants.
 *
 * - markdownQA - A function that answers a question based on provided Markdown covenant content.
 * - MarkdownQAInput - The input type for the markdownQA function.
 * - MarkdownQAOutput - The return type for the markdownQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the Markdown Q&A flow
const MarkdownQAInputSchema = z.object({
  question: z.string().describe('The question to ask about the Markdown document (HOA Covenants).'),
  markdownContent: z
    .string()
    .describe('The content of the Markdown document (HOA Covenants) to search within.'),
});
export type MarkdownQAInput = z.infer<typeof MarkdownQAInputSchema>;

// Define the output schema for the Markdown Q&A flow
const MarkdownQAOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question, derived solely from the provided Markdown covenant content.'),
  foundInDocument: z
    .boolean()
    .describe(
      'Indicates whether the answer could be found within the provided Markdown document.'
    ),
  citations: z
    .array(z.string())
    .optional()
    .describe(
      'Specific quotes or sections from the Markdown document that support the answer (e.g., "Section 6.10").'
    ),
});
export type MarkdownQAOutput = z.infer<typeof MarkdownQAOutputSchema>;

/**
 * Performs Question & Answering against the provided Markdown covenant content.
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
  prompt: `You are Covenant Chat, an AI assistant embedded in an HOA resident portal. You specialize in helping residents understand and comply with HOA covenant rules through clear, accessible, and actionable guidance based *only* on the provided covenant document content.

  **Your Persona:** Friendly, non-judgmental, and solution-focused. You promote understanding, compliance, and community harmony.

  **Your Task:** Answer the user's 'Question' using *exclusively* the information present in the 'Covenant Document Content' provided below. Do not use any external knowledge or make assumptions beyond the text.

  **Instructions:**
  1.  Read the 'Question' carefully. Common topics include architectural changes, pets, noise, landscaping, parking, rentals, common area usage, and HOA governance.
  2.  Thoroughly analyze the 'Covenant Document Content'.
  3.  Formulate a plain-language answer based *solely* on the provided text. Explain the reasoning and context behind rules if the text provides it. Outline approval procedures and key deadlines if mentioned.
  4.  If the answer is found in the document:
      *   Set 'foundInDocument' to true.
      *   Provide the clear answer in the 'answer' field. Format complex answers with headers and bullet points for readability.
      *   Identify and extract specific section numbers or brief, relevant quotes from the document that directly support your answer. Include these in the 'citations' array (e.g., ["Section 6.10", "Fences must be approved in writing..."]). Aim for 1-3 citations.
      *   Close the 'answer' field with a quick summary if helpful.
  5.  If the answer cannot be reasonably inferred from the document:
      *   Set 'foundInDocument' to false.
      *   Provide a concise answer in the 'answer' field stating that the information is not present in the provided document (e.g., "The provided covenant document does not specifically address [topic of the question]. You may need to consult with the HOA board for clarification.").
      *   Leave the 'citations' array empty or omit it.
  6.  **Crucially:** Do not provide legal advice or interpret ambiguous legal text beyond its plain meaning. If the question asks for interpretation or falls outside the scope of the document, state that clearly in the 'answer' and suggest consulting the HOA board or official documents.
  7.  Return the result as a single JSON object matching the defined output schema.

  **Question:**
  {{{question}}}

  **Covenant Document Content:**
  \`\`\`markdown
  {{{markdownContent}}}
  \`\`\`

  **Your JSON Output:**
  `,
  config: {
    temperature: 0.3, // Lower temperature for more factual, less creative responses based on text.
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
         // Attempt to extract text if output format is not JSON as expected
         // This part might need refinement based on observed failure modes
         const responseText = (await markdownQAPrompt(input) as any).text; 
         if (responseText) {
             console.warn("Output was not JSON, returning raw text as answer.");
              return {
                 answer: `AI response format error. Raw text: ${responseText}`,
                 foundInDocument: false, // Assume not found if format failed
                 citations: []
             }
         }
         throw new Error("AI failed to generate a structured response.");
      }
      console.log("markdownQAFlow received output:", output);
      // Ensure the output structure matches the schema, especially boolean field
      return {
        ...output,
        foundInDocument: !!output.foundInDocument, // Explicit boolean conversion
        citations: output.citations || [] // Ensure citations is always an array
      };
    } catch(error) {
        console.error("Error during markdownQAFlow execution:", error);
        // Provide a fallback error response matching the schema
        return {
            answer: "An error occurred while processing the document or generating the AI response. Please try again or contact support.",
            foundInDocument: false,
            citations: []
        }
    }
  }
);
