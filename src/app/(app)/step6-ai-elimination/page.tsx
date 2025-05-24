
import Step6AiEliminationClient from "@/components/tools/step6-ai-elimination-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤六：AI智能消除AI特征 | 敬若涵的搞钱助手',
  description: '根据AI分析建议和您的额外指令，智能优化稿件，消除AI写作痕迹。',
};

export default function Step6AiEliminationPage() {
  return <Step6AiEliminationClient />;
}
