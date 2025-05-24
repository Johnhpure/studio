
import { redirect } from 'next/navigation';

// This page is deprecated and replaced by /step6-ai-elimination
export default function OldRefinementPage() {
  redirect('/step6-ai-elimination');
  return null;
}
