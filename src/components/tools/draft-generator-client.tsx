
"use client";

// This file is deprecated and has been replaced by step4-draft-creation-client.tsx
// It remains here temporarily to avoid breaking existing imports if any, but should be removed.

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function DeprecatedDraftGeneratorClient() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/step4-draft-creation');
  }, [router]);
  return null; 
}

    