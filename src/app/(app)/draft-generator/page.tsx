
import { redirect } from 'next/navigation';

// This page is deprecated and replaced by /step4-draft-creation
export default function OldDraftGeneratorPage() {
  redirect('/step4-draft-creation');
  return null;
}

    