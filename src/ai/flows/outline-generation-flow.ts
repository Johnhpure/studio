
'use server';
/**
 * @fileOverview Generates a manuscript outline based on client requirements and user instructions.
 *
 * - generateOutline - A function that handles the outline generation process.
 * - GenerateOutlineInput - The input type for the generateOutline function.
 * - GenerateOutlineOutput - The return type for the generateOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STEP_2_OUTLINE_GENERATION_PROMPT_TEMPLATE } from '@/ai/prompt-templates'; // Import default template
import Handlebars from 'handlebars';


const MANUSCRIPT_TYPES = ["预热品牌稿", "品牌稿", "产品稿", "行业稿", "预热稿", "新闻通稿", "活动稿"] as const;
const BRANDS = ["添可", "创维", "酷开", "美的", "美芝威灵", "京东方"] as const;

const GenerateOutlineInputSchema = z.object({
  clientRequirements: z.string().describe('The core requirements from the client for the manuscript.'),
  userInstructions: z.string().describe('Detailed creative requirements and instructions for the outline structure and emphasis of each part from the user.'),
  manuscriptType: z.enum(MANUSCRIPT_TYPES).describe('The type of the manuscript.'),
  brand: z.enum(BRANDS).describe('The brand associated with the manuscript.'),
  wordCount: z.union([z.number().positive(), z.string()]).describe('The desired word count for the article (e.g., "1500字", "2000字", or a custom number like 1800).'),
  overridePromptTemplate: z.string().optional().describe("A temporary Handlebars prompt template string to use instead of the default."),
});
export type GenerateOutlineInput = z.infer<typeof GenerateOutlineInputSchema>;

const GenerateOutlineOutputSchema = z.object({
  generatedOutline: z.string().describe('The AI-generated manuscript outline in Markdown format.'),
});
export type GenerateOutlineOutput = z.infer<typeof GenerateOutlineOutputSchema>;

export async function generateOutline(input: GenerateOutlineInput): Promise<GenerateOutlineOutput> {
  return generateOutlineFlow(input);
}

const generateOutlineFlow = ai.defineFlow(
  {
    name: 'generateOutlineFlow',
    inputSchema: GenerateOutlineInputSchema,
    outputSchema: GenerateOutlineOutputSchema,
  },
  async (input) => {
    const promptDataForTemplating = {
      clientRequirements: input.clientRequirements,
      userInstructions: input.userInstructions,
      manuscriptType: input.manuscriptType,
      brand: input.brand,
      wordCount: input.wordCount,
    };

    const templateString = input.overridePromptTemplate || STEP_2_OUTLINE_GENERATION_PROMPT_TEMPLATE;
    const compiledTemplate = Handlebars.compile(templateString);
    const finalPromptString = compiledTemplate(promptDataForTemplating);
    
    const { output } = await ai.generate({
        prompt: finalPromptString,
        output: { schema: GenerateOutlineOutputSchema },
        model: 'googleai/gemini-2.5-pro-preview-05-06' 
    });
    
    if (!output) {
        throw new Error("AI did not return an output for outline generation.");
    }
    return output;
  }
);
