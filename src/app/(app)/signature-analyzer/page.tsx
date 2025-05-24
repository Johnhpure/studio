import SignatureAnalyzerClient from "@/components/tools/signature-analyzer-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 写作特征分析器 | 敬若涵的搞钱神器！',
  description: '分析草稿中的 AI 式模式并建议编辑。',
};

export default function SignatureAnalyzerPage() {
  return <SignatureAnalyzerClient />;
}
