
import Step5AiAnalysisClient from "@/components/tools/step5-ai-analysis-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤五：AI特征检测与分析 | 敬若涵的搞钱助手',
  description: '分析稿件中的AI写作特征，并提供具体的优化建议。',
};

export default function Step5AiAnalysisPage() {
  return <Step5AiAnalysisClient />;
}
