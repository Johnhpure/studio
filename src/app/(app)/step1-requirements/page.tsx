
import Step1RequirementsClient from "@/components/tools/step1-requirements-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '步骤一：输入甲方核心需求 | 敬若涵的搞钱助手',
  description: '在此处粘贴甲方对稿件的核心需求文本内容。这些信息将作为后续AI智能辅助的基础。',
};

export default function Step1RequirementsPage() {
  return <Step1RequirementsClient />;
}
