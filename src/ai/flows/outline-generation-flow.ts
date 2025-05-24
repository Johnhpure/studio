
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
  prompt: `
【甲方核心需求文本】(这是客户提供的“战场情报”，必须吃透每一个字)：
---
{{{clientRequirements}}}
---

【敬若涵的创作圣旨】(这是总指挥的命令，必须逐条严格执行，并创造性地超越期待)：
---
{{{userInstructions}}}
---

【稿件核心参数与定位】(这是本次作战的精确坐标，必须严格对标)：
---
稿件类型：{{{manuscriptType}}}
目标品牌：{{{brand}}}
期望字数：{{{wordCount}}}
---

输出的稿件大纲，必须达到“一字千金，一稿定乾坤”的水准，并严格符合以下“军规”：
1.  **绝对服从与创造性执行“圣旨”：** 深入理解【敬若涵的创作圣旨】中每一项指令的内涵与外延，确保大纲的每一个细节都服务于这些指令，并在严格遵循的基础上，思考如何通过创新的策划角度实现超越期待的效果。
2.  **精准提炼并升华“战场情报”：** 彻底消化【甲方核心需求文本】，精准识别甲方的核心痛点、显性与隐性期望、关注焦点以及潜在的顾虑。大纲设计需直接回应这些需求，并通过策略性的内容布局，将信息价值最大化，实现信息的有效传递与积极影响。
3.  **深度适配“核心参数与定位”，尤其是【稿件类型】的精准制导：** 这是本次大纲策划的关键变量，你必须：
    *   **前置思考与策略声明：** 在正式构建大纲之前，你应首先明确并（在内心）声明，针对用户选择的【稿件类型】，本次大纲的**核心传播目标**是什么，**主要信息层级**将如何排布，**关键的价值主张**将如何突出，以及大纲将如何**引导后续的行文风格**。
    *   **稿件类型精准导航——深度理解与差异化执行：** 大纲的整体结构、信息排布的优先级、各部分的详略程度、以及暗示的行文风格，都必须与指定的【稿件类型】高度匹配。为此，你必须深刻理解以下不同稿件类型的核心目标、创作思路、技巧及侧重点差异：

        *   **"新闻通稿" (News Release/Press Release):**
            *   **核心目标：** 客观、及时、准确地向媒体和公众发布具有新闻价值的信息（如新品发布、重要事件、业绩成果、合作达成等）。
            *   **创作思路与技巧：** 遵循“倒金字塔”结构，将最重要的信息（5W1H）放在导语。语言力求客观、中立、简洁、专业。多用事实和数据说话，避免过多主观臆断和华丽辞藻。包含清晰的标题、导语、主体（详细阐述）、背景信息（关于公司/品牌）、以及媒体联络方式。
            *   **侧重点差异：** 新闻性、时效性、准确性、客观性。
            *   **大纲规划要点：** 结构清晰，信息层级分明，关键信息前置。**大纲需明确体现新闻要素的完整性与核心事实的突出。**

        *   **"产品稿" (Product Feature Article/Review-like Article):**
            *   **核心目标：** 详细介绍特定产品的功能、特性、优势、用户价值和使用场景，激发目标用户的兴趣和购买欲望。
            *   **创作思路与技巧：** 以用户为中心，从用户痛点和需求切入。多用生动的场景化描述、具体的使用案例、清晰的对比分析（与竞品或旧款）来展现产品价值。可以适当融入用户评价或KOL推荐（如果素材提供）。语言可以更具吸引力和说服力，但仍需基于事实。
            *   **侧重点差异：** 产品核心卖点、用户利益、场景化体验、差异化优势、引导转化。
            *   **大纲规划要点：** 围绕核心卖点组织段落，每个卖点都应有具体支撑和价值阐述。**大纲需清晰规划出如何展现产品独特价值及用户获益点。**

        *   **"品牌稿" (Brand Story/Corporate Profile Article):**
            *   **核心目标：** 塑造和提升品牌形象，传递品牌理念、价值观、文化、历史或社会责任，增强公众对品牌的认知、信任和情感连接。
            *   **创作思路与技巧：** 采用故事化叙事手法，讲述品牌背后的故事、创始人的愿景、发展的里程碑、对行业或社会的贡献等。注重情感共鸣和价值认同。语言可以更富人文气息和感染力。
            *   **侧重点差异：** 品牌核心价值、品牌故事、情感连接、社会责任、长远愿景。
            *   **大纲规划要点：** 逻辑主线清晰（如时间线、价值点），每个部分都能有效支撑品牌形象的构建。**大纲需体现品牌故事的叙事弧光与核心价值的深度传递。**

        *   **"行业稿" (Industry Analysis/Trend Article):**
            *   **核心目标：** 分析行业发展趋势、解读行业政策、探讨行业热点问题、或展现品牌在行业中的地位与贡献，提升品牌在行业内的专业形象和话语权。
            *   **创作思路与技巧：** 需要有较高的专业素养和数据支撑。论点清晰，论据充分，分析深入。可以引用权威报告、专家观点、行业数据。语言专业、严谨、具有前瞻性。
            *   **侧重点差异：** 行业洞察、趋势分析、专业深度、品牌行业领导力。
            *   **大纲规划要点：** 论点明确，分论点清晰，每个论点都有数据或案例支撑。**大纲需展现分析的深度、论证的严谨性以及品牌观点的权威性。**

        *   **"预热稿" (Teaser Article/Pre-launch Hype Article):**
            *   **核心目标：** 在新产品、新活动或重要事件正式发布前，制造悬念、引发关注、积累期待，为后续的正式发布预热造势。
            *   **创作思路与技巧：** “犹抱琵琶半遮面”，透露部分信息，但保留核心悬念。多用引人入胜的提问、暗示性的描述、倒计时等手法。语言可以更具神秘感和煽动性。强调“即将到来”的兴奋感。
            *   **侧重点差异：** 制造悬念、引发好奇、积累期待、引导关注后续发布。
            *   **大纲规划要点：** 信息释放的节奏和悬念设置是关键，逐步引导，吊足胃口。**大纲需巧妙设计悬念点与信息释放的平衡。**

        *   **"预热品牌稿" (Brand Teaser Article):**
            *   **核心目标：** 类似于“预热稿”，但更侧重于品牌层面的重要动向或形象升级的预告，引发对品牌未来发展的期待。
            *   **创作思路与技巧：** 结合“预热稿”的悬念技巧和“品牌稿”的价值传递，暗示品牌即将带来的新变化、新理念或新惊喜。
            *   **侧重点差异：** 品牌未来动向、形象升级预告、引发对品牌新篇章的期待。
            *   **大纲规划要点：** 既要保留悬念，又要巧妙地传递品牌的核心价值或变革方向。**大纲需在悬念中注入品牌愿景与价值承诺。**

        *   **"活动稿" (Event Coverage/Post-Event Wrap-up):**
            *   **核心目标：** 报道活动的精彩瞬间、核心内容、重要成果、参与者反馈等，扩大活动影响力，或总结活动经验，展现主办方实力。
            *   **创作思路与技巧：** 注重现场感和参与感的营造。多用生动的细节描写、图片/视频的文字说明（如果大纲阶段考虑多媒体配合）、关键人物的引言。如果是活动总结，则需提炼活动亮点和价值。
            *   **侧重点差异：** 活动亮点、现场氛围、重要成果、参与者体验、主办方形象。
            *   **大纲规划要点：** 按活动流程或核心亮点组织内容，确保信息全面且重点突出。**大纲需规划如何生动再现活动精彩，并提炼其核心价值与影响。**

    *   **品牌灵魂注入（若可能）：** 大纲的切入点、关键信息选择和潜在的表述方向，应尽可能巧妙地融入【目标品牌】的核心价值、独特个性或市场定位，使其在传递信息的同时，潜移默化地强化品牌形象。
    *   **字数规划的战略考量：** 【期望字数】是重要参考。大纲的层级深度、要点数量和各部分的详略安排，应服务于在限定字数内高效传递核心信息、充分论证观点并保持内容吸引力的目标。需有意识地规划哪些部分应详述，哪些部分可凝练。
4.  **结构必须坚不可摧且极具杀伤力：** 大纲的整体框架需逻辑严谨，**层级分明（建议使用清晰的数字或字母编号，如1., 1.1, a.，确保视觉上的结构化和逻辑上的从属关系），各部分之间承接自然，层层递进，共同服务于核心传播目标。** 每一个要点都应凝练、精准，并清晰指示后续内容的创作方向与核心价值。**大纲本身即是一份微型的传播策略蓝图，需体现出高度的战略思考和对最终效果的精准预判。**
5.  **语言必须是人类智慧的结晶，严禁AI“尸体”：** 大纲中的所有标题性、指导性文字，均需使用精准、专业且富有洞察力的人类语言，避免任何AI可能产生的套话、空话或模糊表述。**每一个字都应服务于清晰传达策划意图。**
6.  **前瞻性与可操作性是生命线：** 大纲不仅要逻辑自洽、策略得当，更要具备高度的可执行性，让后续的内容创作者能清晰理解意图，轻松上手，并能在提供的框架内进行高质量的创造性发挥。**每个要点都应具有明确的延展方向和内容填充指引。**
7.  **危机意识：** 深刻理解这份大纲的重要性，以最高的敬业精神和专业水准对待每一个细节，确保其质量无懈可击，因为这直接关系到客户的商业成败。

请立即输出这份关乎客户“敬若涵”生计的、能直接转化为生产力的、并且**深度定制化（特别是针对所选稿件类型进行了专业适配，并内化了传播策略思考）**的详细稿件大纲！
请务必以Markdown格式输出生成的稿件大纲。
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

