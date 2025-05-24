
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiAssistedRefinement, type AiAssistedRefinementInput } from "@/ai/flows/ai-assisted-refinement";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkle, Copy, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft";
const LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS = "app_aiSuggestions";
const LOCAL_STORAGE_KEY_APP_USER_STYLE = "app_userWritingStyleReport"; 

const LOCAL_STORAGE_KEY_STEP6_EXTRA_INSTRUCTIONS = "step6_extraInstructions";
const LOCAL_STORAGE_KEY_STEP6_REFINED_DRAFT = "step6_refinedDraft";


export default function Step6AiEliminationClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [draftToRefine, setDraftToRefine] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [userWritingStyle, setUserWritingStyle] = useState(""); 
  const [extraInstructions, setExtraInstructions] = useState("");
  const [refinedDraft, setRefinedDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDraftToRefine(localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT) || "");
      
      const suggestionsFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS);
      if (suggestionsFromStorage) {
        try {
          const parsedSuggestions = JSON.parse(suggestionsFromStorage);
          if (Array.isArray(parsedSuggestions)) {
            setAiSuggestions(parsedSuggestions.join("\n"));
          } else {
            setAiSuggestions(suggestionsFromStorage); 
          }
        } catch (e) {
           setAiSuggestions(suggestionsFromStorage); 
        }
      } else {
        setAiSuggestions("");
      }
      
      setUserWritingStyle(localStorage.getItem(LOCAL_STORAGE_KEY_APP_USER_STYLE) || ""); 
      setExtraInstructions(localStorage.getItem(LOCAL_STORAGE_KEY_STEP6_EXTRA_INSTRUCTIONS) || "");
      setRefinedDraft(localStorage.getItem(LOCAL_STORAGE_KEY_STEP6_REFINED_DRAFT) || "");
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STEP6_EXTRA_INSTRUCTIONS, extraInstructions);
      localStorage.setItem(LOCAL_STORAGE_KEY_STEP6_REFINED_DRAFT, refinedDraft);
    }
  }, [extraInstructions, refinedDraft]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);


  const handleRefineDraft = async () => {
    if (!draftToRefine.trim()) {
      toast({
        title: "请输入待优化稿件",
        description: "请确保有待优化的稿件内容。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let guidance = "";
      if (aiSuggestions.trim()) {
        guidance += `AI分析与优化建议 (来自步骤五):\n${aiSuggestions.trim()}\n\n`;
      }
      if (extraInstructions.trim()) {
        guidance += `用户额外优化指令 (来自步骤六):\n${extraInstructions.trim()}\n\n`;
      }
       if (userWritingStyle.trim()) {
        guidance += `请参考并尽量维持以下用户写作风格 (来自步骤三):\n${userWritingStyle.trim()}\n\n`;
      }

      const input: AiAssistedRefinementInput = {
        draftText: draftToRefine,
        guidance: guidance.trim() || undefined, 
      };
      const result = await aiAssistedRefinement(input);
      setRefinedDraft(result.refinedText);
      toast({
        title: "成功！",
        description: "稿件已完成AI特征消除与优化。",
      });
    } catch (error) {
      console.error("Error refining draft in Step 6:", error);
      toast({
        title: "错误",
        description: "AI特征消除失败，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (textToCopy: string, type: string) => {
    if (!textToCopy) {
      toast({ title: `无${type}内容可复制`, variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "成功！", description: `${type}已复制到剪贴板。` }))
      .catch(err => {
        console.error(`Failed to copy ${type}: `, err);
        toast({ title: "复制失败", description: `无法复制${type}，请重试。`, variant: "destructive" });
      });
  };

  const handleProceedToFinalPolishing = () => {
    if (!refinedDraft.trim() && !draftToRefine.trim()) { // If nothing refined, but original draft exists, pass that.
      toast({ title: "稿件为空", description: "请先生成或输入稿件内容。", variant: "destructive" });
      return;
    }
    if (typeof window !== 'undefined') {
      // Prioritize refinedDraft, fallback to draftToRefine if refinement wasn't run or cleared
      const draftToPass = refinedDraft.trim() ? refinedDraft : draftToRefine;
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, draftToPass);
    }
    toast({ title: "准备就绪", description: "正在前往最终润色步骤..." });
    router.push('/step7-final-polishing'); 
  };


  const leftPane = (
    <div className="flex flex-col space-y-4 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>待优化稿件原文</CardTitle>
          <CardDescription>从步骤五传入的，等待进行AI特征消除的稿件。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full max-h-[25vh] w-full rounded-md border p-3 bg-muted/50 text-sm">
            {draftToRefine || "请先在步骤五完成分析并传递稿件至此。"}
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>AI特征分析与优化建议 (回顾)</CardTitle>
          <CardDescription>步骤五生成的分析报告和建议，将指导本次优化。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full max-h-[20vh] w-full rounded-md border p-3 bg-muted/50 text-sm">
            {aiSuggestions || "未找到AI优化建议。若适用，请先在步骤五生成。"}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-grow-[1.5] flex flex-col">
        <CardHeader>
          <CardTitle>额外优化指令 (可选)</CardTitle>
          <CardDescription>您可以输入针对本次AI特征消除的额外、细致的优化指令或保留要求。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Label htmlFor="extraInstructions" className="sr-only">额外优化指令</Label>
          <Textarea
            id="extraInstructions"
            placeholder="例如：请特别注意保持品牌调性一致，避免使用过于口语化的词汇..."
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            className="resize-none text-sm flex-1 min-h-[100px] max-h-[20vh]"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefineDraft} disabled={isLoading || !draftToRefine.trim()} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkle className="mr-2 h-4 w-4" />}
            {isLoading ? "优化中..." : "开始AI智能消除AI特征"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>优化后稿件</CardTitle>
            <CardDescription>经AI特征消除和优化后的稿件，请审阅并进行后续操作。</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(refinedDraft, "优化后稿件")} disabled={!refinedDraft || isLoading}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">复制优化后稿件</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="refinedDraftOutput" className="sr-only">优化后稿件</Label>
        <Textarea
          id="refinedDraftOutput"
          placeholder="AI优化后的稿件将显示在此处..."
          value={refinedDraft}
          onChange={(e) => setRefinedDraft(e.target.value)} 
          className="flex-1 resize-none text-sm min-h-[300px] max-h-[65vh] bg-muted/30"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleProceedToFinalPolishing} className="w-full" disabled={isLoading || (!refinedDraft.trim() && !draftToRefine.trim())}>
          <ArrowRight className="mr-2 h-4 w-4" />
          完成AI优化，进入最终润色
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-8rem)] p-1 md:p-0">
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
