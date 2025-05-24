
'use server';
/**
 * @fileOverview Analyzes draft copy for AI-like patterns and suggests edits to improve authenticity and flow.
 *
 * - aiSignatureAnalyzer - A function that handles the analysis and suggestion process.
 * - AiSignatureAnalyzerInput - The input type for the aiSignatureAnalyzer function.
 * - AiSignatureAnalyzerOutput - The return type for the aiSignatureAnalyzer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STEP_5_AI_ANALYSIS_PROMPT_TEMPLATE } from '@/ai/prompt-templates'; // Import default template
import Handlebars from 'handlebars';

const AiSignatureAnalyzerInputSchema = z.object({
  draftCopy: z.string().describe('The draft copy to analyze for AI-like patterns.'),
  overridePromptTemplate: z.string().optional().describe("A temporary Handlebars prompt template string to use instead of the default."),
});
export type AiSignatureAnalyzerInput = z.infer<typeof AiSignatureAnalyzerInputSchema>;

const AiSignatureAnalyzerOutputSchema = z.object({
  analysisReport: z.string().describe('完整的AI文本“原形毕露”诊断书与“人类灵魂注入”指南，Markdown格式。'),
});
export type AiSignatureAnalyzerOutput = z.infer<typeof AiSignatureAnalyzerOutputSchema>;

export async function aiSignatureAnalyzer(input: AiSignatureAnalyzerInput): Promise<AiSignatureAnalyzerOutput> {
  return aiSignatureAnalyzerFlow(input);
}

const aiSignatureAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiSignatureAnalyzerFlow',
    inputSchema: AiSignatureAnalyzerInputSchema,
    outputSchema: AiSignatureAnalyzerOutputSchema,
  },
  async (input) => {
    const promptDataForTemplating = {
      draftCopy: input.draftCopy,
    };

    const templateString = input.overridePromptTemplate || STEP_5_AI_ANALYSIS_PROMPT_TEMPLATE;
    const compiledTemplate = Handlebars.compile(templateString);
    const finalPromptString = compiledTemplate(promptDataForTemplating);

    const { output } = await ai.generate({
        prompt: finalPromptString,
        output: { schema: AiSignatureAnalyzerOutputSchema },
        model: 'googleai/gemini-2.5-pro-preview-05-06' 
    });
    
    if (!output) {
        throw new Error("AI did not return an output for AI signature analysis.");
    }
    return output;
  }
);
