import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// 默认 AI 实例（使用环境变量）
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro-preview-05-06',
});

// 动态创建 AI 实例的函数
export function createAIWithKey(apiKey: string) {
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.5-pro-preview-05-06',
  });
}

// 获取有效的 AI 实例
export function getAIInstance(apiKey?: string) {
  if (apiKey) {
    return createAIWithKey(apiKey);
  }
  return ai;
}
