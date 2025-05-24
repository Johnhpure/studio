
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
import { STEP_6_AI_REFINEMENT_PROMPT_TEMPLATE } from '@/ai/prompt-templates'; // Import default template
import Handlebars from 'handlebars';

const AiAssistedRefinementInputSchema = z.object({
  draftText: z.string().describe('The draft text to be refined. 【原始稿件】'),
  analysisAndSuggestions: z.string().optional().describe('The AI feature analysis and optimization suggestions from Step 5. 【AI特征分析与优化建议】'),
  writingStyleReference: z.string().optional().describe('The learned user writing style traits/report from Step 3. 【写作风格参考】'),
  clientRequirementsAndOutline: z.string().optional().describe('A summary of client requirements and the confirmed outline from Steps 1 & 2, including manuscript type, brand, word count. 【甲方核心需求与大纲参考】'),
  extraOptimizationInstructions: z.string().optional().describe('Additional user-provided fine-tuning instructions for the current refinement step. 【额外优化指令】'),
  overridePromptTemplate: z.string().optional().describe("A temporary Handlebars prompt template string to use instead of the default."),
});

export type AiAssistedRefinementInput = z.infer<typeof AiAssistedRefinementInputSchema>;

const AiAssistedRefinementOutputSchema = z.object({
  refinedText: z.string().describe('The refined text with improved style, reduced AI signature, and incorporating the provided guidance.'),
});

export type AiAssistedRefinementOutput = z.infer<typeof AiAssistedRefinementOutputSchema>;

export async function aiAssistedRefinement(input: AiAssistedRefinementInput): Promise<AiAssistedRefinementOutput> {
  return aiAssistedRefinementFlow(input);
}

const aiAssistedRefinementFlow = ai.defineFlow(
  {
    name: 'aiAssistedRefinementFlow',
    inputSchema: AiAssistedRefinementInputSchema,
    outputSchema: AiAssistedRefinementOutputSchema,
  },
  async (input) => {
    const promptDataForTemplating = {
      draftText: input.draftText,
      analysisAndSuggestions: input.analysisAndSuggestions,
      writingStyleReference: input.writingStyleReference,
      clientRequirementsAndOutline: input.clientRequirementsAndOutline,
      extraOptimizationInstructions: input.extraOptimizationInstructions,
    };

    const templateString = input.overridePromptTemplate || STEP_6_AI_REFINEMENT_PROMPT_TEMPLATE;
    const compiledTemplate = Handlebars.compile(templateString);
    const finalPromptString = compiledTemplate(promptDataForTemplating);
    
    const { output } = await ai.generate({
        prompt: finalPromptString,
        output: { schema: AiAssistedRefinementOutputSchema },
        model: 'googleai/gemini-2.0-flash' // Or your configured model
    });
    
    if (!output) {
        throw new Error("AI did not return an output for AI-assisted refinement.");
    }
    return output;
  }
);
