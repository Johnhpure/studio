import SignatureAnalyzerClient from "@/components/tools/signature-analyzer-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Signature Analyzer | 敬若涵的搞钱神器！',
  description: 'Analyzes draft copy for AI-like patterns and suggests edits.',
};

export default function SignatureAnalyzerPage() {
  return <SignatureAnalyzerClient />;
}
