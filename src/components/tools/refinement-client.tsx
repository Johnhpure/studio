
"use client";

// This file is deprecated and has been replaced by step6-ai-elimination-client.tsx
// It remains here temporarily to avoid breaking existing imports if any, but should be removed.

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function DeprecatedRefinementClient() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/step6-ai-elimination');
  }, [router]);
  return null; 
}
