
'use server';
/**
 * @fileOverview AI flow for learning user writing style from a sample manuscript.
 *
 * - learnUserStyle - A function that analyzes a manuscript sample and returns a style analysis report.
 * - LearnUserStyleInput - The input type for the learnUserStyle function.
 * - LearnUserStyleOutput - The return type for the learnUserStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STEP_3_STYLE_LEARNING_PROMPT_TEMPLATE } from '@/ai/prompt-templates'; // Import default template
import Handlebars from 'handlebars';

const LearnUserStyleInputSchema = z.object({
  manuscriptSample: z.string().describe('高质量稿件范例文本，用于AI学习写作风格。'),
  overridePromptTemplate: z.string().optional().describe("A temporary Handlebars prompt template string to use instead of the default."),
});
export type LearnUserStyleInput = z.infer<typeof LearnUserStyleInputSchema>;

const LearnUserStyleOutputSchema = z.object({
  styleAnalysisReport: z.string().describe('AI生成的Markdown格式的写作风格分析报告。'),
});
export type LearnUserStyleOutput = z.infer<typeof LearnUserStyleOutputSchema>;

export async function learnUserStyle(input: LearnUserStyleInput): Promise<LearnUserStyleOutput> {
  return learnUserStyleFlow(input);
}

const learnUserStyleFlow = ai.defineFlow(
  {
    name: 'learnUserStyleFlow',
    inputSchema: LearnUserStyleInputSchema,
    outputSchema: LearnUserStyleOutputSchema,
  },
  async (input) => {
    const promptDataForTemplating = {
      manuscriptSample: input.manuscriptSample,
    };

    const templateString = input.overridePromptTemplate || STEP_3_STYLE_LEARNING_PROMPT_TEMPLATE;
    const compiledTemplate = Handlebars.compile(templateString);
    const finalPromptString = compiledTemplate(promptDataForTemplating);

    const { output } = await ai.generate({
        prompt: finalPromptString,
        output: { schema: LearnUserStyleOutputSchema },
        model: 'googleai/gemini-2.0-flash' // Or your configured model
    });
    
    if (!output) {
        throw new Error("AI did not return an output for style learning.");
    }
    return output;
  }
);
