
import { redirect } from 'next/navigation';

// This page is deprecated and replaced by /step5-ai-analysis
export default function OldSignatureAnalyzerPage() {
  redirect('/step5-ai-analysis');
  return null;
}
