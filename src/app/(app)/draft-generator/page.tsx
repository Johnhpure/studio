import DraftGeneratorClient from "@/components/tools/draft-generator-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 草稿生成 | 敬若涵的搞钱神器！',
  description: '根据用户提供的概要和风格示例生成草稿。',
};

export default function DraftGeneratorPage() {
  return <DraftGeneratorClient />;
}
