// AI 客户端工具函数 - 使用Google官方Gemini SDK
// 用于前端和后端之间的 API key 管理和 API 调用

// 本地存储键名
const LOCAL_STORAGE_API_KEY = "app_aiApiKey";
const LOCAL_STORAGE_API_ENDPOINT = "app_aiApiEndpoint";
const LOCAL_STORAGE_MODEL = "app_aiModel";
const LOCAL_STORAGE_TEMPERATURE = "app_aiTemperature";
const LOCAL_STORAGE_MAX_TOKENS = "app_aiMaxTokens";

// 支持的Gemini模型列表
export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (实验版)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];

// AI配置接口
export interface AIConfig {
  apiKey: string;
  model: GeminiModelId;
  temperature: number;
  maxTokens: number;
  apiEndpoint?: string;
}

// 从 localStorage 获取 API key
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_API_KEY);
}

// 从 localStorage 获取 API 端点
export function getStoredApiEndpoint(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_API_ENDPOINT);
}

// 从 localStorage 获取模型设置
export function getStoredModel(): GeminiModelId {
  if (typeof window === 'undefined') return 'gemini-2.5-flash';
  return (localStorage.getItem(LOCAL_STORAGE_MODEL) as GeminiModelId) || 'gemini-2.5-flash';
}

// 从 localStorage 获取温度设置
export function getStoredTemperature(): number {
  if (typeof window === 'undefined') return 0.7;
  const stored = localStorage.getItem(LOCAL_STORAGE_TEMPERATURE);
  return stored ? parseFloat(stored) : 0.7;
}

// 从 localStorage 获取最大token设置
export function getStoredMaxTokens(): number {
  if (typeof window === 'undefined') return 2048;
  const stored = localStorage.getItem(LOCAL_STORAGE_MAX_TOKENS);
  return stored ? parseInt(stored) : 2048;
}

// 获取完整AI配置
export function getStoredAIConfig(): Partial<AIConfig> {
  return {
    apiKey: getStoredApiKey() || '',
    model: getStoredModel(),
    temperature: getStoredTemperature(),
    maxTokens: getStoredMaxTokens(),
    apiEndpoint: getStoredApiEndpoint() || '',
  };
}

// 保存AI配置到localStorage
export function saveAIConfig(config: Partial<AIConfig>): void {
  if (typeof window === 'undefined') return;
  
  if (config.apiKey !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_API_KEY, config.apiKey);
  }
  if (config.model !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_MODEL, config.model);
  }
  if (config.temperature !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_TEMPERATURE, config.temperature.toString());
  }
  if (config.maxTokens !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_MAX_TOKENS, config.maxTokens.toString());
  }
  if (config.apiEndpoint !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_API_ENDPOINT, config.apiEndpoint);
  }
}

// 验证 API key 的函数（前端调用）
export async function validateApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/ai/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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

// 通用 AI 生成请求函数（前端使用）
export async function generateWithUserKey(
  prompt: string, 
  options: {
    apiKey?: string;
    model?: GeminiModelId;
    temperature?: number;
    maxTokens?: number;
    outputSchema?: any;
    systemInstruction?: string;
  } = {}
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const config = getStoredAIConfig();
    const requestConfig = {
      apiKey: options.apiKey || config.apiKey,
      model: options.model || config.model,
      temperature: options.temperature ?? config.temperature,
      maxTokens: options.maxTokens || config.maxTokens,
    };
    
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        ...requestConfig,
        outputSchema: options.outputSchema,
        systemInstruction: options.systemInstruction,
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

// AI 流调用函数（前端使用）
export async function callAIFlow(
  flowType: string,
  input: any,
  options: {
    apiKey?: string;
    model?: GeminiModelId;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const config = getStoredAIConfig();
    const requestConfig = {
      apiKey: options.apiKey || config.apiKey,
      model: options.model || config.model,
      temperature: options.temperature ?? config.temperature,
      maxTokens: options.maxTokens || config.maxTokens,
    };
    
    const response = await fetch('/api/ai/flows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flowType,
        ...input,
        ...requestConfig,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('AI flow request error:', error);
    return {
      success: false,
      message: '流处理请求失败，请检查网络连接'
    };
  }
}
