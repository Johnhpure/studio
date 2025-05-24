
'use server';
/**
 * @fileOverview An AI agent that generates a draft copy based on a user-provided outline, style examples, client requirements, manuscript type, brand, word count, and temporary fine-tuning instructions.
 * This is the enhanced version for Step 4 of the 7-step writing process.
 *
 * - generateDraft - A function that handles the draft generation process.
 * - GenerateDraftInput - The input type for the generateDraft function.
 * - GenerateDraftOutput - The return type for the generateDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STEP_4_DRAFT_GENERATION_PROMPT_TEMPLATE } from '@/ai/prompt-templates'; // Import default template
import Handlebars from 'handlebars';

const GenerateDraftInputSchema = z.object({
  clientRequirements: z.string().describe('The core requirements from the client for the manuscript. (From Step 1)'),
  creativeOutline: z.string().describe('The detailed manuscript outline confirmed by the user. (From Step 2)'),
  writingStyleGuide: z.string().optional().describe('The detailed writing style analysis report or core style traits. (From Step 3, optional if skipped)'),
  manuscriptType: z.string().describe('The type of the manuscript (e.g., "新闻通稿", "产品稿"). (From Step 2)'),
  brand: z.string().describe('The brand associated with the manuscript (e.g., "添可", "美的"). (From Step 2)'),
  wordCount: z.union([z.number().positive(), z.string()]).describe('The desired word count for the article (e.g., "1500字", 2000). (From Step 2)'),
  tempFineTuneInstructions: z.string().optional().describe('Temporary, additional fine-tuning instructions for this specific draft generation. (From Step 4, optional)'),
  overridePromptTemplate: z.string().optional().describe("A temporary Handlebars prompt template string to use instead of the default."),
});
export type GenerateDraftInput = z.infer<typeof GenerateDraftInputSchema>;

const GenerateDraftOutputSchema = z.object({
  generatedDraft: z.string().describe('The AI-generated draft copy, ready for review and further steps.'),
});
export type GenerateDraftOutput = z.infer<typeof GenerateDraftOutputSchema>;

export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
  return generateDraftFlow(input);
}

const generateDraftFlow = ai.defineFlow(
  {
    name: 'generateDraftFlowStep4', 
    inputSchema: GenerateDraftInputSchema,
    outputSchema: GenerateDraftOutputSchema,
  },
  async (input) => {
    if (!input.clientRequirements || !input.creativeOutline || !input.manuscriptType || !input.brand || !input.wordCount) {
      throw new Error("Missing required inputs for draft generation (clientRequirements, creativeOutline, manuscriptType, brand, wordCount).");
    }

    const promptDataForTemplating = {
        clientRequirements: input.clientRequirements,
        creativeOutline: input.creativeOutline,
        writingStyleGuide: input.writingStyleGuide,
        manuscriptType: input.manuscriptType,
        brand: input.brand,
        wordCount: input.wordCount,
        tempFineTuneInstructions: input.tempFineTuneInstructions,
    };

    const templateString = input.overridePromptTemplate || STEP_4_DRAFT_GENERATION_PROMPT_TEMPLATE;
    const compiledTemplate = Handlebars.compile(templateString);
    const finalPromptString = compiledTemplate(promptDataForTemplating);

    const { output } = await ai.generate({
        prompt: finalPromptString,
        output: { schema: GenerateDraftOutputSchema },
        model: 'googleai/gemini-2.0-flash' // Or your configured model
    });

    if (!output) {
        throw new Error("AI did not return an output for draft generation.");
    }
    return output;
  }
);
