'use server';

/**
 * @fileOverview This file implements the AI-Assisted Refinement flow.
 *
 * It improves written drafts with learned style traits and removes detectable AI signatures.
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
  styleTraits: z
    .string()
    .optional()
    .describe('Optional style traits to incorporate into the refined text.'),
});

export type AiAssistedRefinementInput = z.infer<typeof AiAssistedRefinementInputSchema>;

const AiAssistedRefinementOutputSchema = z.object({
  refinedText: z.string().describe('The refined text with improved style and reduced AI signature.'),
});

export type AiAssistedRefinementOutput = z.infer<typeof AiAssistedRefinementOutputSchema>;

export async function aiAssistedRefinement(input: AiAssistedRefinementInput): Promise<AiAssistedRefinementOutput> {
  return aiAssistedRefinementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedRefinementPrompt',
  input: {schema: AiAssistedRefinementInputSchema},
  output: {schema: AiAssistedRefinementOutputSchema},
  prompt: `You are an AI writing assistant specializing in refining text and removing AI signatures.

  Your goal is to improve the provided draft text, incorporating the specified style traits (if any), and ensuring that the final output sounds natural and authentic.

  Draft Text: {{{draftText}}}

  Style Traits: {{{styleTraits}}}

  Refined Text (with improved style and reduced AI signature):`,
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
