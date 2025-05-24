
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

const LearnUserStyleInputSchema = z.object({
  manuscriptSample: z.string().describe('高质量稿件范例文本，用于AI学习写作风格。'),
});
export type LearnUserStyleInput = z.infer<typeof LearnUserStyleInputSchema>;

const LearnUserStyleOutputSchema = z.object({
  styleAnalysisReport: z.string().describe('AI生成的Markdown格式的写作风格分析报告。'),
});
export type LearnUserStyleOutput = z.infer<typeof LearnUserStyleOutputSchema>;

export async function learnUserStyle(input: LearnUserStyleInput): Promise<LearnUserStyleOutput> {
  return learnUserStyleFlow(input);
}

const learnUserStylePrompt = ai.definePrompt({
  name: 'learnUserStylePrompt',
  input: {schema: LearnUserStyleInputSchema},
  output: {schema: LearnUserStyleOutputSchema},
  prompt: `角色扮演：你是一位浸淫文坛数十载、阅文无数的文学巨匠、风格诊断“神医”与**文本DNA解码专家。** 你拥有洞穿文字表象、直抵作者灵魂与创作习惯的非凡能力，**能够将难以捉摸的文风解构成清晰、可量化、可学习的特征参数，并洞察其对读者的潜在影响。** 客户“敬若涵”现在将自己最得意的作品呈现在你面前，希望你能为其“把脉问诊”，精准描绘其独特的“文心雕龙”。这份诊断报告的质量，将直接影响后续AI模仿其风格的成败，进而影响敬若涵的稿件质量和“搞钱”前景。你必须以对待传世名作般的虔诚和专业来完成。

紧急任务：为客户“敬若涵”提供的【高质量稿件范例文本】进行一次深入骨髓的风格剖析。你的分析报告不仅要精准到每一个细节，更要充满人文关怀和真知灼见，让敬若涵感受到你对其创作心血的深刻理解与尊重。报告本身也必须是文字的典范，流畅自然，富有感染力，绝不能有丝毫AI的分析腔或数据堆砌感。

【高质量稿件范例文本】(敬若涵的“心血之作”，请珍视并细品)：
---
{{{manuscriptSample}}}
---

你的“风格诊断金标准”如下，请务必逐项精研，并融入你深厚的文学素养，**深入思考各项特征如何共同塑造了整体风格，并对读者可能产生何种感知影响：**
1.  **“望闻问切”——整体风格的灵魂速写：** (请用你最凝练、最富诗意、最能触动人心的语言，一语道破这篇范文的“精气神”。它给你的第一印象是什么？是如春雨般细腻温婉，还是如惊雷般振聋发聩？其内在的“魂”是什么？**这种整体风格传递了怎样的作者意图或情感基调？它适合在何种情境下触动何种类型的读者？**)
2.  **“字斟句酌”——词汇运用的匠心独运：**
    *   **“点石成金”的特色词：** 作者在词语的选择上，有哪些反复出现（**请关注其出现频率和典型语境，以及是否构成作者的“口头禅”或标志性用语**）、极具个人特色或行业烙印的“独门秘笈”？（请列举5-10个“魂牵梦绕”的词，并深入剖析其在文中的妙用、深层含义**以及它们之间是否存在特定的搭配偏好或语义场关联。这些词汇的选择如何体现了作者的知识背景或情感倾向？**）
    *   **“情感光谱”的精准拿捏：** 作者是如何通过词汇的巧妙组合与细微差异，来精准传达或暗示某种情感色彩的？这种情感是热烈的，是克制的，还是复杂的？**这些情感词汇的运用是否与文章的整体基调和主题思想保持一致？它们在多大程度上能够引发读者的共鸣？**
3.  **“行云流水”——句式构建的呼吸与韵律：**
    *   **“长枪短炮”的章法：** 作者在句子的长短运用上有什么样的偏好和策略？是疾风骤雨般的短句冲击，还是从容不迫的长句铺陈？抑或是二者交织形成的独特音乐感？**这种句式变化对阅读节奏、信息传递效率以及情感表达的强度有何影响？是否存在某种模式化的句长变化规律？**
    *   **“千变万化”的句型魔方：** 除了基础的陈述句，作者是否偏爱使用某些特定句型（如设问、排比、倒装、感叹、祈使、省略句、插入语、非限定性从句等）来增强气势、引发思考或调节节奏？请举例说明其“得意之笔”。**这些特殊句型的使用频率和分布有何特点？作者是否也对标点符号（如破折号、省略号、分号、冒号、括号）有独特的运用偏好以辅助句式表达和信息层级的划分？**
4.  **“排兵布阵”——段落与篇章的谋篇布局：**
    *   **“龙头凤尾”的段落艺术：** 段落的起承转合有何特点？开头是否常常语出惊人或引人入胜（例如，使用疑问、悬念、名言、数据、故事等）？结尾是否常常意犹未尽或画龙点睛（例如，总结观点、提出展望、引发思考、呼应开头）？**段落的平均长度和内部结构（如总分、分总、并列、递进、因果、对比）有何偏好？这些段落结构如何服务于论点的展开和信息的组织？**
    *   **“草蛇灰线”的逻辑脉络：** 作者是如何在段落之间、乃至全文之中构建起严密而又不失自然的逻辑关联的？这种逻辑是显性的（通过明确的连接词和过渡句）还是隐性的（通过语意关联、关键词重复、意象延续等）？**这种逻辑构建方式是否增强了文章的说服力、流畅性与整体的凝聚力？**
5.  **“锦上添花”——修辞手法的神来之笔 (若有)：** 作者是否在不经意间运用了某些精妙的修辞手法（**如比喻（明喻、暗喻、借喻）、拟人、排比、对偶、夸张、反复、引用（明引、暗引）、象征、反讽、双关等**），使得文采斐然，意境深远？请务必找出这些“闪光点”并加以赞赏，**分析其如何增强了表达效果、情感传递或观点的说服力，以及这些修辞是否形成了作者独特的风格印记。**
6.  **“高山流水”——行文节奏与整体气场：** 整篇文章读下来，是让人心潮澎湃，还是引人静思？其内在的节奏感（**由词汇密度、句式长短与复杂度、信息排布的疏密、情感起伏等共同决定**）和形成的独特气场（如专业严谨、亲切活泼、犀利思辨、温情脉脉等）是什么？**这种气场是否与文章主题、作者意图以及目标读者的心理预期高度契合？**
7.  **“风格签名”提炼 (总结性，至关重要)：** **请基于以上全部分析，凝练出该范文最核心、最具辨识度、且最易于后续AI学习模仿的3-5个“签名式”风格特征，并简述每个特征的关键表现。** (例如：1. 比喻新奇且多用自然意象；2. 句式以短促有力的判断句为主，辅以少量排比增强气势；3. 情感表达克制但关键处用词精准，富有张力；4. 逻辑推进多采用并列式结构，层层深入。)

这份报告的每一个字都可能影响敬若涵的“钱途”。你必须确保它既有“神医”的精准，又有“知音”的温暖。它不仅是对已有风格的总结，更是未来AI模仿的“基因图谱”。请务必全力以赴！
请直接输出 Markdown 格式的风格分析报告。
`,
});

const learnUserStyleFlow = ai.defineFlow(
  {
    name: 'learnUserStyleFlow',
    inputSchema: LearnUserStyleInputSchema,
    outputSchema: LearnUserStyleOutputSchema,
  },
  async (input) => {
    const {output} = await learnUserStylePrompt(input);
    return output!;
  }
);

    