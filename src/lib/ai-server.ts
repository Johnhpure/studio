// 服务端专用 AI 工具函数 - 使用Google官方Gemini SDK
// 只能在 Node.js 环境中使用，不能在客户端导入

import { GoogleGenAI } from '@google/genai';
import type { GeminiModelId } from './ai-client';

// 服务端AI配置接口
export interface ServerAIConfig {
  apiKey: string;
  model: GeminiModelId;
  temperature: number;
  maxTokens: number;
  systemInstruction?: string;
}

// 创建Gemini客户端实例
export function createGeminiClient(apiKey: string): GoogleGenAI {
  if (!apiKey) {
    throw new Error('API key is required to create Gemini client');
  }
  
  return new GoogleGenAI({
    apiKey: apiKey,
  });
}

// 获取有效的 API key（服务端使用）
export function getEffectiveApiKey(userApiKey?: string): string | null {
  return userApiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || null;
}

// 验证API key是否有效
export async function validateGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createGeminiClient(apiKey);
    
    // 尝试列出可用模型来验证API key
    const models = await client.models.list();
    
    if (models && models.length > 0) {
      return {
        success: true,
        message: 'API key 验证成功'
      };
    } else {
      return {
        success: false,
        message: 'API key 无效或没有访问权限'
      };
    }
  } catch (error: any) {
    console.error('API key validation error:', error);
    
    // 根据错误类型返回不同的消息
    if (error.message?.includes('API_KEY_INVALID')) {
      return {
        success: false,
        message: 'API key 无效，请检查密钥是否正确'
      };
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        message: 'API key 权限不足，请检查密钥权限设置'
      };
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      return {
        success: false,
        message: 'API 配额已用完，请检查计费设置'
      };
    } else {
      return {
        success: false,
        message: `验证失败: ${error.message || '未知错误'}`
      };
    }
  }
}

// 使用官方SDK生成内容
export async function generateContentWithGemini(config: ServerAIConfig, prompt: string, options: {
  outputSchema?: any;
  tools?: any[];
} = {}): Promise<any> {
  const client = createGeminiClient(config.apiKey);
  
  const generationConfig = {
    temperature: config.temperature,
    maxOutputTokens: config.maxTokens,
  };

  const requestConfig: any = {
    generationConfig,
  };

  if (config.systemInstruction) {
    requestConfig.systemInstruction = config.systemInstruction;
  }

  if (options.tools && options.tools.length > 0) {
    requestConfig.tools = options.tools;
  }

  // 如果有输出schema，添加到生成配置中
  if (options.outputSchema) {
    requestConfig.generationConfig.responseMimeType = "application/json";
    requestConfig.generationConfig.responseSchema = options.outputSchema;
  }

  const model = client.getGenerativeModel({
    model: config.model,
    ...requestConfig,
  });

  const result = await model.generateContent(prompt);
  return result.response;
}
