import SourceTextDistillerClient from "@/components/tools/source-text-distiller-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '源文本提取器 | 敬若涵的搞钱神器！',
  description: '分析粘贴的源文本以提取关键信息。',
};

export default function DistillerPage() {
  return <SourceTextDistillerClient />;
}
