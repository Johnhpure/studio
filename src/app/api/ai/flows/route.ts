import { NextRequest, NextResponse } from 'next/server';
import { 
  generateOutlineFlow, 
  generateDraftFlow, 
  aiAssistedRefinementFlow, 
  aiSignatureAnalyzerFlow, 
  learnUserStyleFlow, 
  refineTextWithPromptFlow,
  sourceTextDistillerFlow,
  type GenerateOutlineInput,
  type GenerateDraftInput,
  type AiAssistedRefinementInput,
  type AiSignatureAnalyzerInput,
  type LearnUserStyleInput,
  type RefineTextWithPromptInput,
  type SourceTextDistillerInput
} from '@/ai/gemini-flows';

// AI 流处理路由 - 使用Google官方Gemini SDK
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowType, ...input } = body;

    if (!flowType) {
      return NextResponse.json(
        { success: false, message: 'Flow type is required' },
        { status: 400 }
      );
    }

    let result;

    switch (flowType) {
      case 'generateOutline':
        result = await generateOutlineFlow(input as GenerateOutlineInput);
        break;

      case 'generateDraft':
        result = await generateDraftFlow(input as GenerateDraftInput);
        break;

      case 'aiAssistedRefinement':
        result = await aiAssistedRefinementFlow(input as AiAssistedRefinementInput);
        break;

      case 'aiSignatureAnalyzer':
        result = await aiSignatureAnalyzerFlow(input as AiSignatureAnalyzerInput);
        break;

      case 'learnUserStyle':
        result = await learnUserStyleFlow(input as LearnUserStyleInput);
        break;

      case 'refineTextWithPrompt':
        result = await refineTextWithPromptFlow(input as RefineTextWithPromptInput);
        break;

      case 'sourceTextDistiller':
        result = await sourceTextDistillerFlow(input as SourceTextDistillerInput);
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Unsupported flow type: ${flowType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('AI flow error:', error);
    
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
        message: error.message || '流处理过程中发生错误' 
      },
      { status: 500 }
    );
  }
}
