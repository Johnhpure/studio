import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiApiKey } from '@/lib/ai-server';

// AI API 通用处理器 - 使用Google官方Gemini SDK
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, apiKey } = body;

    switch (action) {
      case 'validate':
        if (!apiKey) {
          return NextResponse.json(
            { success: false, message: 'API key is required' },
            { status: 400 }
          );
        }

        const result = await validateGeminiApiKey(apiKey);
        return NextResponse.json(result);

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}