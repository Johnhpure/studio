
import Step3StyleLearningClient from "@/components/tools/step3-style-learning-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤三：AI学习您的写作风格 | 敬若涵的搞钱助手',
  description: '让AI学习您的优秀稿件范例，以掌握您的独特写作风格。',
};

export default function Step3StyleLearningPage() {
  return <Step3StyleLearningClient />;
}

    