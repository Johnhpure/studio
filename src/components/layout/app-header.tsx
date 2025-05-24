
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FilePlus2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTemporaryPrompts } from "@/contexts/TemporaryPromptsContext";
import type { PromptStepKey } from "@/ai/prompt-templates";


interface AppHeaderProps {
  title: string;
}

const localStorageKeysToClear = [
  "step1_clientRequirements",
  "step2_userInstructions",
  "step2_manuscriptType",
  "step2_selectedBrand",
  "step2_wordCountOption",
  "step2_customWordCount",
  "step2_editedOutline",
  "step2_finalOutline_metadata",
  "step3_manuscriptSample",
  "app_userWritingStyleReport",
  "step4_tempInstructions",
  "app_currentDraft",
  "step5_aiAnalysis_draftCopy",
  "app_aiSuggestions", // This stores the full analysis report from step 5
  "step6_extraInstructions",
  "step6_refinedDraft",
];

export function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { clearAllTemporaryPrompts } = useTemporaryPrompts();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = React.useState(false);

  const handleStartNewCreation = () => {
    // Clear localStorage
    localStorageKeysToClear.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear temporary prompts from context
    clearAllTemporaryPrompts();

    toast({
      title: "新创作已开始",
      description: "所有流程数据已清空。",
    });
    router.push('/step1-requirements');
    setIsAlertDialogOpen(false); // Close dialog after action
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl whitespace-nowrap overflow-hidden text-ellipsis">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FilePlus2 className="mr-2 h-4 w-4" />
              开始新创作
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认开始新创作吗？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将清空当前所有步骤中已输入和已生成的内容，包括甲方需求、大纲、风格学习、稿件草稿等。此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartNewCreation}>
                确认清空并开始
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
