
// src/components/layout/prompt-edit-modal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // Explicitly list all used dialog components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PromptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPromptTemplate: string;
  currentEditedPromptTemplate?: string;
  onSave: (editedPrompt: string) => void;
  stepTitle: string;
}

export function PromptEditModal({
  isOpen,
  onClose,
  defaultPromptTemplate,
  currentEditedPromptTemplate,
  onSave,
  stepTitle,
}: PromptEditModalProps) {
  const [editablePrompt, setEditablePrompt] = useState(currentEditedPromptTemplate || defaultPromptTemplate);

  useEffect(() => {
    // Update editable prompt if the currentEditedPromptTemplate prop changes
    // or if the default template changes when the modal is opened/re-opened
    setEditablePrompt(currentEditedPromptTemplate || defaultPromptTemplate);
  }, [currentEditedPromptTemplate, defaultPromptTemplate, isOpen]);

  const handleSave = () => {
    onSave(editablePrompt);
    onClose();
  };

  const handleResetToDefault = () => {
    setEditablePrompt(defaultPromptTemplate);
  };

  if (!isOpen) { 
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[60vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>编辑“{stepTitle}”的AI提示词模板</DialogTitle>
          <DialogDescription>
            您正在编辑当前步骤的AI提示词模板。修改仅在本次会话中对当前步骤生效，刷新页面或下次操作将恢复默认。
            提示词使用Handlebars模板语法，例如 `{"{{variableName}}"}`。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1 min-h-0">
          <div className="grid gap-2 flex-1 min-h-0">
            <Label htmlFor="prompt-template-editor" className="sr-only">
              提示词模板
            </Label>
            <ScrollArea className="h-[calc(70vh-200px)] w-full rounded-md border">
                 <Textarea
                    id="prompt-template-editor"
                    value={editablePrompt}
                    onChange={(e) => setEditablePrompt(e.target.value)}
                    className="min-h-full h-auto resize-none text-xs !border-0 !ring-0 !outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0"
                    placeholder="输入或编辑提示词模板..."
                />
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={handleResetToDefault}>
            恢复默认
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                取消
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>
              应用本次修改
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
