
import Step4DraftCreationClient from "@/components/tools/step4-draft-creation-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤四：AI智能创作初稿 | 敬若涵的搞钱助手',
  description: '融合甲方需求、创作大纲和学习到的写作风格，AI高效创作稿件初稿。',
};

export default function Step4DraftCreationPage() {
  return <Step4DraftCreationClient />;
}

    