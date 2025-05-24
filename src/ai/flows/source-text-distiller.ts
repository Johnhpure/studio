// The use server directive is necessary for code that will be run on the server.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for distilling key information from source text.
 *
 * - `distillSourceText` - A function that accepts source text and returns a concise summary of the key information.
 * - `DistillSourceTextInput` - The input type for the `distillSourceText` function.
 * - `DistillSourceTextOutput` - The output type for the `distillSourceText` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const DistillSourceTextInputSchema = z.object({
  sourceText: z
    .string()
    .describe('The source text to distill into key information.'),
});
export type DistillSourceTextInput = z.infer<typeof DistillSourceTextInputSchema>;

// Define the output schema for the flow
const DistillSourceTextOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key information.'),
});
export type DistillSourceTextOutput = z.infer<typeof DistillSourceTextOutputSchema>;

// Exported function to distill source text
export async function distillSourceText(
  input: DistillSourceTextInput
): Promise<DistillSourceTextOutput> {
  return distillSourceTextFlow(input);
}

// Define the prompt for distilling source text
const distillSourceTextPrompt = ai.definePrompt({
  name: 'distillSourceTextPrompt',
  input: {schema: DistillSourceTextInputSchema},
  output: {schema: DistillSourceTextOutputSchema},
  prompt: `Distill the key information from the following source text into a concise summary:\n\n{{sourceText}}`,
});

// Define the Genkit flow for distilling source text
const distillSourceTextFlow = ai.defineFlow(
  {
    name: 'distillSourceTextFlow',
    inputSchema: DistillSourceTextInputSchema,
    outputSchema: DistillSourceTextOutputSchema,
  },
  async input => {
    const {output} = await distillSourceTextPrompt(input);
    return output!;
  }
);
