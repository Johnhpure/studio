
'use server';
/**
 * @fileOverview A generic AI flow to refine text based on a user prompt.
 * - refineTextWithPrompt - A function to refine text.
 * - RefineTextWithPromptInput - Input type.
 * - RefineTextWithPromptOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Handlebars from 'handlebars';

// Input schema for the flow
const RefineTextWithPromptInputSchema = z.object({
  originalText: z.string().describe('The original text to be refined. 【原始内容】'),
  userPrompt: z.string().describe('The user-provided prompt to guide the refinement. 【用户指令】'),
});
export type RefineTextWithPromptInput = z.infer<typeof RefineTextWithPromptInputSchema>;

// Output schema for the flow AND for ai.generate
const RefineTextWithPromptOutputSchema = z.object({
  refinedText: z.string().describe('The text after refinement based on the user prompt. 【优化后文本】'),
});
export type RefineTextWithPromptOutput = z.infer<typeof RefineTextWithPromptOutputSchema>;

// Exported function to call the flow
export async function refineTextWithPrompt(input: RefineTextWithPromptInput): Promise<RefineTextWithPromptOutput> {
  return refineTextWithPromptFlow(input);
}

const GENERIC_REFINEMENT_PROMPT_TEMPLATE = `
You are an expert text editor and copywriter. Your task is to refine, rewrite, or adapt the provided "Original Text" based *strictly* on the "User's Instructions".
Interpret the user's instructions to achieve the best possible outcome for the text.
If the instructions ask for a specific format (e.g., Markdown), ensure the output adheres to it.
Output *only* the refined text, without any preamble, conversational filler, or explanation, unless the user's instructions specifically ask for it.

User's Instructions:
---
{{{userPrompt}}}
---

Original Text:
---
{{{originalText}}}
---

Refined Text (output only the refined text, adhering to user's instructions):
`;


const refineTextWithPromptFlow = ai.defineFlow(
  {
    name: 'refineTextWithPromptFlow',
    inputSchema: RefineTextWithPromptInputSchema,
    outputSchema: RefineTextWithPromptOutputSchema,
  },
  async (input) => {
    const promptDataForTemplating = {
      originalText: input.originalText,
      userPrompt: input.userPrompt,
    };

    const compiledTemplate = Handlebars.compile(GENERIC_REFINEMENT_PROMPT_TEMPLATE);
    const finalPromptString = compiledTemplate(promptDataForTemplating);
    
    const { output } = await ai.generate({
        prompt: finalPromptString,
        output: { schema: RefineTextWithPromptOutputSchema },
        model: 'googleai/gemini-2.5-pro-preview-05-06' 
    });
    
    if (!output) {
        throw new Error("AI did not return an output for generic text refinement.");
    }
    // The output from ai.generate when an output schema is provided is already an object matching the schema.
    return output; 
  }
);

