// AI 流处理器 - 使用Google官方Gemini SDK
// 替代原有的genkit flows

import { generateContentWithGemini, getEffectiveApiKey, type ServerAIConfig } from '@/lib/ai-server';
import type { GeminiModelId } from '@/lib/ai-client';

// 基础流输入接口
interface BaseFlowInput {
  apiKey?: string;
  model?: GeminiModelId;
  temperature?: number;
  maxTokens?: number;
  overridePromptTemplate?: string;
}

// 大纲生成流
export interface GenerateOutlineInput extends BaseFlowInput {
  clientRequirements: string;
  userInstructions: string;
  manuscriptType: string;
  brand: string;
  wordCount: number;
}

export interface GenerateOutlineOutput {
  outline: string;
  reasoning: string;
}

export async function generateOutlineFlow(input: GenerateOutlineInput): Promise<GenerateOutlineOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.7,
    maxTokens: input.maxTokens || 2048,
    systemInstruction: `你是一个专业的内容大纲生成助手。请根据客户需求生成详细的内容大纲。`,
  };

  const prompt = `
请根据以下信息生成详细的内容大纲：

客户需求：${input.clientRequirements}
用户指示：${input.userInstructions}
内容类型：${input.manuscriptType}
品牌：${input.brand}
字数要求：${input.wordCount}

请生成一个结构清晰、逻辑合理的大纲，并说明你的思路。
`;

  const response = await generateContentWithGemini(config, prompt, {
    outputSchema: {
      type: "object",
      properties: {
        outline: { type: "string", description: "生成的大纲内容" },
        reasoning: { type: "string", description: "大纲生成的思路说明" }
      },
      required: ["outline", "reasoning"]
    }
  });

  const result = JSON.parse(response.text());
  return result;
}

// 草稿生成流
export interface GenerateDraftInput extends BaseFlowInput {
  clientRequirements: string;
  outline: string;
  writingStyleReference: string;
  userInstructions: string;
  wordCount: number;
}

export interface GenerateDraftOutput {
  draftContent: string;
  wordCount: number;
}

export async function generateDraftFlow(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.7,
    maxTokens: input.maxTokens || 4096,
    systemInstruction: `你是一个专业的内容创作助手。请根据大纲和要求生成高质量的草稿内容。`,
  };

  const prompt = `
请根据以下信息生成草稿内容：

客户需求：${input.clientRequirements}
内容大纲：${input.outline}
写作风格参考：${input.writingStyleReference}
用户指示：${input.userInstructions}
目标字数：${input.wordCount}

请生成符合要求的草稿内容，并统计字数。
`;

  const response = await generateContentWithGemini(config, prompt, {
    outputSchema: {
      type: "object",
      properties: {
        draftContent: { type: "string", description: "生成的草稿内容" },
        wordCount: { type: "number", description: "实际字数" }
      },
      required: ["draftContent", "wordCount"]
    }
  });

  const result = JSON.parse(response.text());
  return result;
}

// AI辅助精炼流
export interface AiAssistedRefinementInput extends BaseFlowInput {
  draftText: string;
  analysisAndSuggestions: string;
  writingStyleReference: string;
  clientRequirementsAndOutline: string;
  extraOptimizationInstructions: string;
}

export interface AiAssistedRefinementOutput {
  refinedContent: string;
  changesExplanation: string;
}

export async function aiAssistedRefinementFlow(input: AiAssistedRefinementInput): Promise<AiAssistedRefinementOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.7,
    maxTokens: input.maxTokens || 4096,
    systemInstruction: `你是一个专业的内容精炼助手。请根据分析建议优化内容质量。`,
  };

  const prompt = `
请根据以下信息精炼和优化内容：

原始草稿：${input.draftText}
分析和建议：${input.analysisAndSuggestions}
写作风格参考：${input.writingStyleReference}
客户需求和大纲：${input.clientRequirementsAndOutline}
额外优化指示：${input.extraOptimizationInstructions}

请提供精炼后的内容，并说明主要改进点。
`;

  const response = await generateContentWithGemini(config, prompt, {
    outputSchema: {
      type: "object",
      properties: {
        refinedContent: { type: "string", description: "精炼后的内容" },
        changesExplanation: { type: "string", description: "主要改进点说明" }
      },
      required: ["refinedContent", "changesExplanation"]
    }
  });

  const result = JSON.parse(response.text());
  return result;
}

// AI签名分析流
export interface AiSignatureAnalyzerInput extends BaseFlowInput {
  draftCopy: string;
}

export interface AiSignatureAnalyzerOutput {
  analysis: string;
  suggestions: string[];
  score: number;
}

export async function aiSignatureAnalyzerFlow(input: AiSignatureAnalyzerInput): Promise<AiSignatureAnalyzerOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.3,
    maxTokens: input.maxTokens || 2048,
    systemInstruction: `你是一个专业的内容分析师。请分析内容的质量和特征。`,
  };

  const prompt = `
请分析以下内容的质量和特征：

内容：${input.draftCopy}

请提供详细的分析、改进建议和质量评分（1-10分）。
`;

  const response = await generateContentWithGemini(config, prompt, {
    outputSchema: {
      type: "object",
      properties: {
        analysis: { type: "string", description: "详细分析" },
        suggestions: { 
          type: "array", 
          items: { type: "string" },
          description: "改进建议列表" 
        },
        score: { type: "number", description: "质量评分(1-10)" }
      },
      required: ["analysis", "suggestions", "score"]
    }
  });

  const result = JSON.parse(response.text());
  return result;
}

// 风格学习流
export interface LearnUserStyleInput extends BaseFlowInput {
  referenceTexts: string[];
  targetContent: string;
}

export interface LearnUserStyleOutput {
  styleAnalysis: string;
  styledContent: string;
}

export async function learnUserStyleFlow(input: LearnUserStyleInput): Promise<LearnUserStyleOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.7,
    maxTokens: input.maxTokens || 3072,
    systemInstruction: `你是一个写作风格分析和模仿专家。请学习参考文本的风格特征，并应用到目标内容上。`,
  };

  const prompt = `
请学习以下参考文本的写作风格，并将其应用到目标内容上：

参考文本：
${input.referenceTexts.join('\n\n---\n\n')}

目标内容：
${input.targetContent}

请分析写作风格特征，并提供风格化的内容。
`;

  const response = await generateContentWithGemini(config, prompt, {
    outputSchema: {
      type: "object",
      properties: {
        styleAnalysis: { type: "string", description: "风格特征分析" },
        styledContent: { type: "string", description: "风格化后的内容" }
      },
      required: ["styleAnalysis", "styledContent"]
    }
  });

  const result = JSON.parse(response.text());
  return result;
}

// 通用文本精炼流
export interface RefineTextWithPromptInput extends BaseFlowInput {
  originalText: string;
  refinementPrompt: string;
}

export interface RefineTextWithPromptOutput {
  refinedText: string;
}

export async function refineTextWithPromptFlow(input: RefineTextWithPromptInput): Promise<RefineTextWithPromptOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.7,
    maxTokens: input.maxTokens || 3072,
    systemInstruction: `你是一个专业的文本精炼助手。请根据用户的指示精炼和改进文本。`,
  };

  const prompt = `
${input.refinementPrompt}

原始文本：
${input.originalText}

请根据上述指示精炼文本。
`;

  const response = await generateContentWithGemini(config, prompt);
  
  return {
    refinedText: response.text()
  };
}

// 源文本提炼流
export interface SourceTextDistillerInput extends BaseFlowInput {
  sourceText: string;
  extractionGoals: string;
}

export interface SourceTextDistillerOutput {
  distilledContent: string;
  keyPoints: string[];
}

export async function sourceTextDistillerFlow(input: SourceTextDistillerInput): Promise<SourceTextDistillerOutput> {
  const apiKey = getEffectiveApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config: ServerAIConfig = {
    apiKey,
    model: input.model || 'gemini-2.5-flash',
    temperature: input.temperature || 0.5,
    maxTokens: input.maxTokens || 3072,
    systemInstruction: `你是一个专业的内容提炼专家。请从源文本中提取关键信息。`,
  };

  const prompt = `
请根据以下提炼目标，从源文本中提取关键信息：

提炼目标：${input.extractionGoals}

源文本：
${input.sourceText}

请提供提炼后的内容和关键要点列表。
`;

  const response = await generateContentWithGemini(config, prompt, {
    outputSchema: {
      type: "object",
      properties: {
        distilledContent: { type: "string", description: "提炼后的内容" },
        keyPoints: { 
          type: "array", 
          items: { type: "string" },
          description: "关键要点列表" 
        }
      },
      required: ["distilledContent", "keyPoints"]
    }
  });

  const result = JSON.parse(response.text());
  return result;
}
