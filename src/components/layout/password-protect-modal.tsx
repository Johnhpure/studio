// src/components/layout/password-protect-modal.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface PasswordProtectModalProps {
  onAuthenticated: () => void;
}

const CORRECT_ANSWER = "简职了";
const QUESTION = "工作室叫啥名字";

export function PasswordProtectModal({ onAuthenticated }: PasswordProtectModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === CORRECT_ANSWER) {
      setError(null);
      onAuthenticated();
    } else {
      setError("答案错误，请重试！");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl text-center">访问验证</CardTitle>
            <CardDescription className="text-center pt-1">
              {QUESTION}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answer" className="sr-only">{QUESTION}</Label>
              <Input
                id="answer"
                type="text"
                placeholder="请输入答案..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
                className="text-center text-lg h-12"
              />
            </div>
            {error && (
              <div className="flex items-center p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6">
              <CheckCircle className="mr-2 h-5 w-5" />
              确认答案
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}