// src/contexts/TemporaryPromptsContext.tsx
"use client";

import type { PromptStepKey } from '@/ai/prompt-templates';
import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useCallback } from 'react';

interface TemporaryPromptsContextType {
  temporaryPrompts: Record<PromptStepKey, string | undefined>;
  setTemporaryPrompt: (stepKey: PromptStepKey, prompt: string) => void;
  getTemporaryPrompt: (stepKey: PromptStepKey) => string | undefined;
  clearTemporaryPrompt: (stepKey: PromptStepKey) => void;
  clearAllTemporaryPrompts: () => void; // New function
}

const TemporaryPromptsContext = createContext<TemporaryPromptsContextType | undefined>(undefined);

export const TemporaryPromptsProvider = ({ children }: { children: ReactNode }) => {
  const [temporaryPrompts, setTemporaryPrompts] = useState<Record<PromptStepKey, string | undefined>>({} as Record<PromptStepKey, string | undefined>);

  const setTemporaryPrompt = useCallback((stepKey: PromptStepKey, prompt: string) => {
    setTemporaryPrompts(prev => ({ ...prev, [stepKey]: prompt }));
  }, []);

  const getTemporaryPrompt = useCallback((stepKey: PromptStepKey): string | undefined => {
    return temporaryPrompts[stepKey];
  }, [temporaryPrompts]);

  const clearTemporaryPrompt = useCallback((stepKey: PromptStepKey) => {
    setTemporaryPrompts(prev => {
      const newState = { ...prev };
      delete newState[stepKey];
      return newState;
    });
  }, []);

  const clearAllTemporaryPrompts = useCallback(() => { // Implementation of new function
    setTemporaryPrompts({} as Record<PromptStepKey, string | undefined>);
  }, []);

  return (
    <TemporaryPromptsContext.Provider value={{ temporaryPrompts, setTemporaryPrompt, getTemporaryPrompt, clearTemporaryPrompt, clearAllTemporaryPrompts }}>
      {children}
    </TemporaryPromptsContext.Provider>
  );
};

export const useTemporaryPrompts = (): TemporaryPromptsContextType => {
  const context = useContext(TemporaryPromptsContext);
  if (context === undefined) {
    throw new Error('useTemporaryPrompts must be used within a TemporaryPromptsProvider');
  }
  return context;
};
