
// src/components/layout/ai-modification-modal.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, WandSparkles, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

interface AiModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  onApplyModification: (originalContent: string, userPrompt: string) => Promise<string>; // Returns refined text
  onSaveRefinedContent: (refinedContent: string) => void;
  modalTitle: string;
}

export function AiModificationModal({
  isOpen,
  onClose,
  originalContent,
  onApplyModification,
  onSaveRefinedContent,
  modalTitle,
}: AiModificationModalProps) {
  const [currentUserPrompt, setCurrentUserPrompt] = useState('');
  const [refinedContentResult, setRefinedContentResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens, except for user prompt if we want to persist it across opens within the same session
      // setCurrentUserPrompt(''); // Optional: reset prompt on open
      setRefinedContentResult(null);
    }
  }, [isOpen]);

  const handleApplyAi = async () => {
    if (!currentUserPrompt.trim()) {
      toast({ title: "请输入提示词", description: "请输入您希望AI执行的修改指令。", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setRefinedContentResult(null);
    try {
      const result = await onApplyModification(originalContent, currentUserPrompt);
      setRefinedContentResult(result);
      toast({ title: "AI优化完成", description: "请在下方查看优化结果。" });
    } catch (error: any) {
      console.error("Error applying AI modification:", error);
      toast({ title: "AI优化失败", description: error.message || "请重试。", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (refinedContentResult) {
      onSaveRefinedContent(refinedContentResult);
      toast({ title: "修改已保存", description: "优化后的内容已更新。" });
      onClose();
    } else {
      toast({ title: "没有可保存的内容", description: "请先应用AI修改生成优化结果。", variant: "destructive"});
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            在此输入您的修改指令，AI将根据您的指令优化原始内容。
          </DialogDescription>
        </DialogHeader>

        {/* Top: User Prompt Input */}
        <div className="py-2">
          <Label htmlFor="ai-mod-user-prompt" className="text-sm font-medium">您的修改指令 (提示词)</Label>
          <Textarea
            id="ai-mod-user-prompt"
            value={currentUserPrompt}
            onChange={(e) => setCurrentUserPrompt(e.target.value)}
            placeholder="例如：请将以下内容改写得更简洁，突出核心观点..."
            className="min-h-[100px] max-h-[20vh] mt-1 text-sm"
          />
        </div>

        {/* Middle: Original Content Display */}
        <div className="py-2 flex-1 flex flex-col min-h-[25vh]">
          <Label className="text-sm font-medium mb-1">原始内容 (只读)</Label>
          <ScrollArea className="flex-grow rounded-md border p-3 bg-muted/30 prose dark:prose-invert max-w-none text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{originalContent || "无原始内容。"}</ReactMarkdown>
          </ScrollArea>
        </div>

        {/* Bottom: AI Refined Result Display */}
        <div className="py-2 flex-1 flex flex-col min-h-[25vh]">
          <Label className="text-sm font-medium mb-1">AI优化结果 (只读)</Label>
          <ScrollArea className="flex-grow rounded-md border p-3 bg-muted/50 prose dark:prose-invert max-w-none text-xs">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" /> 
                <p className="ml-2 text-muted-foreground">AI思考中...</p>
              </div>
            ) : refinedContentResult !== null ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{refinedContentResult}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">AI优化后的内容将显示在此处...</p>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter className="mt-4 flex-col sm:flex-row sm:justify-between">
          <Button type="button" onClick={handleApplyAi} disabled={isLoading || !currentUserPrompt.trim()}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <WandSparkles className="mr-2 h-4 w-4" />}
            {isLoading ? "处理中..." : "应用AI修改"}
          </Button>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave} disabled={isLoading || refinedContentResult === null}>
              <Save className="mr-2 h-4 w-4" />
              保存修改
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
