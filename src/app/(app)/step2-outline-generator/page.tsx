
import Step2OutlineGeneratorClient from "@/components/tools/step2-outline-generator-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤二：AI生成稿件创作大纲 | 敬若涵的搞钱助手',
  description: '根据甲方需求和您的指令，智能生成稿件大纲。',
};

export default function Step2OutlineGeneratorPage() {
  return <Step2OutlineGeneratorClient />;
}
