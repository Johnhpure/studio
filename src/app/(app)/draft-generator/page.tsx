import DraftGeneratorClient from "@/components/tools/draft-generator-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Draft Generation | 敬若涵的搞钱神器！',
  description: 'Generates draft copy based on user-provided outlines and style examples.',
};

export default function DraftGeneratorPage() {
  return <DraftGeneratorClient />;
}
