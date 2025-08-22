// AI 客户端工具函数
// 用于在前端和后端之间传递 API key 和处理 AI 请求

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// 从 localStorage 获取 API key 的工具函数
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('app_aiApiKey');
}

// 从 localStorage 获取 API 端点的工具函数
export function getStoredApiEndpoint(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('app_aiApiEndpoint');
}

// 验证 API key 的函数（前端调用）
export async function validateApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'validate',
        apiKey: apiKey,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API key validation error:', error);
    return {
      success: false,
      message: '网络错误，无法验证 API key'
    };
  }
}

// 服务端动态创建 AI 实例（供服务端组件使用）
export function createDynamicAI(apiKey?: string) {
  // 优先使用传入的 apiKey，然后是环境变量
  const effectiveApiKey = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!effectiveApiKey) {
    throw new Error('No API key available. Please configure GOOGLE_API_KEY environment variable or provide apiKey parameter.');
  }

  return genkit({
    plugins: [googleAI({ apiKey: effectiveApiKey })],
    model: 'googleai/gemini-2.5-pro-preview-05-06',
  });
}

// 获取有效的 API key（服务端使用）
export function getEffectiveApiKey(userApiKey?: string): string | null {
  return userApiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || null;
}

// 通用 AI 生成请求函数（前端使用）
export async function generateWithUserKey(
  prompt: string, 
  options: {
    apiKey?: string;
    outputSchema?: any;
  } = {}
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const userApiKey = options.apiKey || getStoredApiKey();
    
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        apiKey: userApiKey,
        flowType: 'generate',
        outputSchema: options.outputSchema,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('AI generation request error:', error);
    return {
      success: false,
      message: '请求失败，请检查网络连接'
    };
  }
}
