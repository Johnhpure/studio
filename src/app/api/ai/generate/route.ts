import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithGemini, getEffectiveApiKey } from '@/lib/ai-server';
import type { GeminiModelId } from '@/lib/ai-client';

// AI 生成请求的通用处理器 - 使用Google官方Gemini SDK
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      apiKey, 
      model = 'gemini-2.5-flash',
      temperature = 0.7,
      maxTokens = 2048,
      outputSchema,
      systemInstruction,
      tools
    } = body;

    // 获取有效的API key
    const effectiveApiKey = getEffectiveApiKey(apiKey);
    
    if (!effectiveApiKey) {
      return NextResponse.json(
        { success: false, message: 'API key is required. Please configure GOOGLE_API_KEY environment variable or provide apiKey parameter.' },
        { status: 401 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 构建服务端AI配置
    const aiConfig = {
      apiKey: effectiveApiKey,
      model: model as GeminiModelId,
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
      systemInstruction,
    };

    // 使用官方SDK生成内容
    const response = await generateContentWithGemini(aiConfig, prompt, {
      outputSchema,
      tools,
    });

    // 提取生成的文本
    const generatedText = response.text();

    return NextResponse.json({
      success: true,
      data: generatedText,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      }
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    
    // 处理常见的 API 错误
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return NextResponse.json(
        { success: false, message: 'API key 无效，请检查密钥是否正确' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('quota')) {
      return NextResponse.json(
        { success: false, message: 'API 配额已用完，请检查计费设置' },
        { status: 429 }
      );
    }

    if (error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { success: false, message: 'API key 权限不足，请检查权限设置' },
        { status: 403 }
      );
    }

    if (error.message?.includes('SAFETY')) {
      return NextResponse.json(
        { success: false, message: '内容被安全过滤器阻止，请修改提示内容' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || '生成过程中发生错误' 
      },
      { status: 500 }
    );
  }
}