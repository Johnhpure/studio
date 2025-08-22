import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiApiKey } from '@/lib/ai-server';

// API key 验证路由
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API key is required' },
        { status: 400 }
      );
    }

    const result = await validateGeminiApiKey(apiKey);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || '验证过程中发生错误' 
      },
      { status: 500 }
    );
  }
}
