'use server';
/**
 * @fileOverview An AI agent that generates a draft copy based on a user-provided outline and style examples.
 *
 * - generateDraft - A function that handles the draft generation process.
 * - GenerateDraftInput - The input type for the generateDraft function.
 * - GenerateDraftOutput - The return type for the generateDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDraftInputSchema = z.object({
  outline: z
    .string()
    .describe('The outline for the draft copy.'),
  styleExamples: z.string().describe('Examples of the desired writing style.'),
});
export type GenerateDraftInput = z.infer<typeof GenerateDraftInputSchema>;

const GenerateDraftOutputSchema = z.object({
  draft: z.string().describe('The generated draft copy.'),
});
export type GenerateDraftOutput = z.infer<typeof GenerateDraftOutputSchema>;

export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
  return generateDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDraftPrompt',
  input: {schema: GenerateDraftInputSchema},
  output: {schema: GenerateDraftOutputSchema},
  prompt: `You are an AI writing assistant that generates draft copies based on user-provided outlines and style examples.

  Outline: {{{outline}}}
  Style Examples: {{{styleExamples}}}

  Please generate a draft copy based on the provided outline and style examples. The draft should be well-written, engaging, and tailored to the specified style.
  Draft:
  `,
});

const generateDraftFlow = ai.defineFlow(
  {
    name: 'generateDraftFlow',
    inputSchema: GenerateDraftInputSchema,
    outputSchema: GenerateDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
