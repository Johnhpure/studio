import RefinementClient from "@/components/tools/refinement-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 辅助优化 | 敬若涵的搞钱神器！',
  description: '通过学习到的风格特点改进书面草稿，并去除可检测的 AI 特征。',
};

export default function RefinementPage() {
  return <RefinementClient />;
}
