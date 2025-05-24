import RefinementClient from "@/components/tools/refinement-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Assisted Refinement | 敬若涵的搞钱神器！',
  description: 'Improves written drafts with learned style traits and removes detectable AI signatures.',
};

export default function RefinementPage() {
  return <RefinementClient />;
}
