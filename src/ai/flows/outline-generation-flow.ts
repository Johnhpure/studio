
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

const MANUSCRIPT_TYPES = ["预热品牌稿", "品牌稿", "产品稿", "行业稿", "预热稿", "新闻通稿", "活动稿"] as const;
const BRANDS = ["添可", "创维", "酷开", "美的", "美芝威灵", "京东方"] as const;

const GenerateOutlineInputSchema = z.object({
  clientRequirements: z.string().describe('The core requirements from the client for the manuscript.'),
  userInstructions: z.string().describe('Detailed creative requirements and instructions for the outline structure and emphasis of each part from the user.'),
  manuscriptType: z.enum(MANUSCRIPT_TYPES).describe('The type of the manuscript.'),
  brand: z.enum(BRANDS).describe('The brand associated with the manuscript.'),
  wordCount: z.union([z.number().positive(), z.string()]).describe('The desired word count for the article (e.g., "1500字", "2000字", or a custom number like 1800).'),
});
export type GenerateOutlineInput = z.infer<typeof GenerateOutlineInputSchema>;

const GenerateOutlineOutputSchema = z.object({
  generatedOutline: z.string().describe('The AI-generated manuscript outline in Markdown format.'),
});
export type GenerateOutlineOutput = z.infer<typeof GenerateOutlineOutputSchema>;

export async function generateOutline(input: GenerateOutlineInput): Promise<GenerateOutlineOutput> {
  return generateOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutlinePrompt',
  input: {schema: GenerateOutlineInputSchema},
  output: {schema: GenerateOutlineOutputSchema},
  prompt: `You are an expert copywriter assistant specializing in creating detailed manuscript outlines for the Chinese market.
Your task is to generate a structured and comprehensive outline based on the provided information.

The outline must strictly adhere to the user's instructions, incorporate relevant content elements from the client's requirements, and fully consider the selected manuscript type, brand characteristics, and word count limit to produce an outline that is targeted in structure, emphasis, and scope.

Client's Core Requirements (甲方核心需求文本):
{{{clientRequirements}}}

User's Creative Instructions for the Outline (用户创作要求与指令):
{{{userInstructions}}}

Manuscript Details (稿件详情):
- Type (稿件类型): {{{manuscriptType}}}
- Brand (品牌): {{{brand}}}
- Target Word Count (文章字数): {{{wordCount}}}

Please generate the manuscript outline in Markdown format. Ensure the outline is well-organized, logical, and covers all necessary points based on the inputs. The language of the outline should be Chinese.
Generated Outline (Markdown / 生成的大纲):
`,
});

const generateOutlineFlow = ai.defineFlow(
  {
    name: 'generateOutlineFlow',
    inputSchema: GenerateOutlineInputSchema,
    outputSchema: GenerateOutlineOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
