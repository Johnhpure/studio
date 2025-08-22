import { NextRequest, NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// 动态创建 AI 实例的函数
function createAIInstance(apiKey?: string) {
  if (apiKey) {
    // 使用用户提供的 API key
    return genkit({
      plugins: [googleAI({ apiKey })],
      model: 'googleai/gemini-2.5-pro-preview-05-06',
    });
  } else {
    // 使用环境变量中的 API key（回退选项）
    return genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.5-pro-preview-05-06',
    });
  }
}

// 验证 API key 的函数
async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const ai = createAIInstance(apiKey);
    
    // 发送一个简单的测试请求
    const { output } = await ai.generate({
      prompt: 'Test connection. Reply with "OK".',
      model: 'googleai/gemini-2.5-pro-preview-05-06'
    });
    
    return !!output;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}

// POST 请求处理器 - 验证 API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, action } = body;

    if (action === 'validate') {
      if (!apiKey) {
        return NextResponse.json(
          { success: false, message: 'API key is required' },
          { status: 400 }
        );
      }

      const isValid = await validateApiKey(apiKey);
      
      return NextResponse.json({
        success: isValid,
        message: isValid ? 'API key is valid' : 'API key is invalid or expired'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 导出动态 AI 实例创建函数供其他模块使用
export { createAIInstance };
