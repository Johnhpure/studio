import SourceTextDistillerClient from "@/components/tools/source-text-distiller-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Source Text Distiller | 敬若涵的搞钱神器！',
  description: 'Analyzes pasted source text to distill key information.',
};

export default function DistillerPage() {
  return <SourceTextDistillerClient />;
}
