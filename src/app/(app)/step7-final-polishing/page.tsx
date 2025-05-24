
import Step7FinalPolishingClient from "@/components/tools/step7-final-polishing-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤七：最终人工审核与润色 | 敬若涵的搞钱助手',
  description: '对稿件进行最终的人工修改、润色和校对，完成后复制内容交付。',
};

export default function Step7FinalPolishingPage() {
  return <Step7FinalPolishingClient />;
}
