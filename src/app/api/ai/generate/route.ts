import { NextRequest, NextResponse } from 'next/server';
import { getAIInstance } from '@/ai/genkit';

// AI 生成请求的通用处理器
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      apiKey, 
      flowType, 
      flowInput,
      outputSchema 
    } = body;

    // 获取用户的 API key（从请求体或 localStorage 传递）
    const userApiKey = apiKey || null;
    
    // 获取 AI 实例（如果有用户 API key 则使用，否则使用环境变量）
    const ai = getAIInstance(userApiKey);

    let result;

    switch (flowType) {
      case 'generate':
        // 通用文本生成
        result = await ai.generate({
          prompt: prompt,
          model: 'googleai/gemini-2.5-pro-preview-05-06',
          output: outputSchema ? { schema: outputSchema } : undefined
        });
        break;

      case 'flow':
        // 执行特定的 flow
        if (!flowInput) {
          return NextResponse.json(
            { success: false, message: 'Flow input is required for flow type requests' },
            { status: 400 }
          );
        }

        // 这里可以根据 flowInput.flowName 来调用不同的 flow
        // 暂时返回错误，需要根据具体 flow 实现
        return NextResponse.json(
          { success: false, message: 'Flow type not implemented yet' },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid flow type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result.output || result.text || result,
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    
    // 检查是否是 API key 相关错误
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'API 密钥无效或已过期，请在设置页面重新配置',
          errorType: 'authentication'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '生成请求失败，请稍后重试',
        errorType: 'generation'
      },
      { status: 500 }
    );
  }
}
