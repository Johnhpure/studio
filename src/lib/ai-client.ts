// AI 客户端工具函数
// 用于前端和后端之间的 API key 管理和 API 调用

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
