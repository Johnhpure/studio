
'use server';

/**
 * @fileOverview This file implements the AI-Assisted Refinement flow.
 *
 * It improves written drafts based on provided guidance (which can include learned style traits, 
 * AI analysis suggestions, and user instructions) and removes detectable AI signatures.
 * - aiAssistedRefinement - The function to call for refining text.
 * - AiAssistedRefinementInput - The input type for the aiAssistedRefinement function.
 * - AiAssistedRefinementOutput - The output type for the aiAssistedRefinement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedRefinementInputSchema = z.object({
  draftText: z
    .string()
    .describe('The draft text to be refined.'),
  guidance: z
    .string()
    .optional()
    .describe('Comprehensive guidance for refinement. This can include AI-generated suggestions from Step 5, learned user writing style traits from Step 3, and/or specific user-provided fine-tuning instructions for the current refinement step. If provided, the AI should strictly follow these instructions.'),
});

export type AiAssistedRefinementInput = z.infer<typeof AiAssistedRefinementInputSchema>;

const AiAssistedRefinementOutputSchema = z.object({
  refinedText: z.string().describe('The refined text with improved style, reduced AI signature, and incorporating the provided guidance.'),
});

export type AiAssistedRefinementOutput = z.infer<typeof AiAssistedRefinementOutputSchema>;

export async function aiAssistedRefinement(input: AiAssistedRefinementInput): Promise<AiAssistedRefinementOutput> {
  return aiAssistedRefinementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedRefinementPrompt',
  input: {schema: AiAssistedRefinementInputSchema},
  output: {schema: AiAssistedRefinementOutputSchema},
  prompt: `You are an expert AI writing assistant. Your task is to refine the provided "Draft Text".
The primary goals are to eliminate any AI-like writing patterns, make the text sound natural and authentic, while strictly adhering to the "Provided Guidance".
The refined text must preserve the core facts, data, and intent of the original "Draft Text".

Draft Text:
{{{draftText}}}

Provided Guidance (Follow these instructions carefully for refinement):
{{{guidance}}}

Based on the "Draft Text" and "Provided Guidance", produce the "Refined Text".
Refined Text:`,
});

const aiAssistedRefinementFlow = ai.defineFlow(
  {
    name: 'aiAssistedRefinementFlow',
    inputSchema: AiAssistedRefinementInputSchema,
    outputSchema: AiAssistedRefinementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
