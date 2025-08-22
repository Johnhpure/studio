// 服务端专用 AI 工具函数
// 只能在 Node.js 环境中使用，不能在客户端导入

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

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
