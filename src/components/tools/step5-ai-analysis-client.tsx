
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiSignatureAnalyzer } from "@/ai/flows/ai-signature-analyzer"; 
import type { AiSignatureAnalyzerInput } from "@/ai/flows/ai-signature-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Microscope, Zap, Edit, Copy, Eye, Edit3, FilePenLine } from "lucide-react"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PromptEditModal } from "@/components/layout/prompt-edit-modal";
import { useTemporaryPrompts } from "@/contexts/TemporaryPromptsContext";
import { STEP_5_AI_ANALYSIS_PROMPT_TEMPLATE } from "@/ai/prompt-templates";

const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft"; 
const LOCAL_STORAGE_KEY_STEP5_DRAFT_COPY = "step5_aiAnalysis_draftCopy"; 
const LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS = "app_aiSuggestions"; // This will store the full analysis report
const PROMPT_KEY_STEP5: "step5_aiAnalysis" = "step5_aiAnalysis";


export default function Step5AiAnalysisClient() {
  const router = useRouter();
  const [draftCopy, setDraftCopy] = useState("");
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);
  const [analysisReport, setAnalysisReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getTemporaryPrompt, setTemporaryPrompt } = useTemporaryPrompts();
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draftFromPrevStep = localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT);
      const savedDraftCopy = localStorage.getItem(LOCAL_STORAGE_KEY_STEP5_DRAFT_COPY);
      
      setDraftCopy(draftFromPrevStep || savedDraftCopy || "");

      const savedAnalysisReport = localStorage.getItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS);
      if (savedAnalysisReport) {
        setAnalysisReport(savedAnalysisReport);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STEP5_DRAFT_COPY, draftCopy);
    }
  }, [draftCopy]);

  const handleAnalyze = async () => {
    if (!draftCopy.trim()) {
      toast({
        title: "请输入待分析稿件",
        description: "请在左侧文本框中提供需要进行AI特征分析的稿件内容。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(""); 
    try {
      const temporaryPrompt = getTemporaryPrompt(PROMPT_KEY_STEP5);
      const input: AiSignatureAnalyzerInput = { 
        draftCopy,
        overridePromptTemplate: temporaryPrompt,
      };
      const result = await aiSignatureAnalyzer(input); 
      setAnalysisReport(result.analysisReport); 
      if (typeof window !== 'undefined' && result.analysisReport) {
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS, result.analysisReport);
      }
      toast({
        title: "分析完成！",
        description: "AI特征检测与分析已完成。",
      });
    } catch (error) {
      console.error("Error analyzing AI signature:", error);
      toast({
        title: "分析失败",
        description: "执行AI特征分析时出错，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnalysisReport = () => {
    if (!analysisReport.trim()) {
      toast({ title: "无内容可复制", description: "分析报告为空。", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(analysisReport) 
      .then(() => toast({ title: "成功！", description: "分析报告 (Markdown) 已复制到剪贴板。" }))
      .catch(err => {
        console.error("Failed to copy analysis report: ", err);
        toast({ title: "复制失败", description: "无法复制分析报告，请重试。", variant: "destructive" });
      });
  };
  
  const handleProceedToElimination = () => {
    if (!draftCopy.trim()) {
      toast({ title: "稿件为空", description: "请输入稿件内容后再继续。", variant: "destructive" });
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, draftCopy); 
    if (analysisReport.trim()) { // Ensure report is saved if generated
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS, analysisReport); 
    } else { // If no report generated yet, clear any old one
        localStorage.removeItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS);
    }
    toast({ title: "准备就绪", description: "正在前往AI特征消除步骤..." });
    router.push('/step6-ai-elimination'); 
  };

  const handleSkipToFinalPolishing = () => {
    if (!draftCopy.trim()) {
      toast({ title: "稿件为空", description: "请输入稿件内容后再继续。", variant: "destructive" });
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, draftCopy);
    localStorage.removeItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS); 
    toast({ title: "准备就绪", description: "正在跳至最终润色步骤..." });
    router.push('/step7-final-polishing'); 
  };

  const handleSaveTemporaryPrompt = (editedPrompt: string) => {
    setTemporaryPrompt(PROMPT_KEY_STEP5, editedPrompt);
    toast({ title: "提示词已临时保存", description: "本次AI生成将使用您编辑的提示词。" });
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>当前待分析稿件</CardTitle>
            <div className="flex items-center gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewingDraft(!isPreviewingDraft)}
                disabled={!draftCopy.trim()}
                >
                {isPreviewingDraft ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {isPreviewingDraft ? "编辑" : "预览"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPromptModalOpen(true)}>
                    <FilePenLine className="mr-2 h-4 w-4" /> 查看/编辑提示词
                </Button>
            </div>
        </div>
        <CardDescription>从上一步骤传入或您在此处编辑的稿件内容。可切换编辑/预览模式。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isPreviewingDraft ? (
            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/30 min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draftCopy || "稿件预览将在此处显示..."}
              </ReactMarkdown>
            </ScrollArea>
        ) : (
            <Textarea
              id="draftCopy"
              placeholder="请粘贴或输入待分析的稿件内容 (Markdown)..."
              value={draftCopy}
              onChange={(e) => setDraftCopy(e.target.value)}
              className="flex-1 resize-none text-sm min-h-[300px]"
            />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <Microscope />}
          <span>{isLoading ? "分析中..." : "开始AI特征检测与分析"}</span>
        </Button>
      </CardFooter>
      <PromptEditModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        defaultPromptTemplate={STEP_5_AI_ANALYSIS_PROMPT_TEMPLATE}
        currentEditedPromptTemplate={getTemporaryPrompt(PROMPT_KEY_STEP5)}
        onSave={handleSaveTemporaryPrompt}
        stepTitle="步骤五：AI特征检测与分析"
      />
    </Card>
  );

  const rightPane = (
    <div className="flex-1 flex flex-col gap-4">
      <Card className="flex-grow flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>AI特征诊断与优化指南</CardTitle>
            <CardDescription>AI对稿件的深度分析报告 (Markdown 预览)。</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleCopyAnalysisReport} disabled={!analysisReport.trim() || isLoading} title="复制原始Markdown报告">
            <Copy className="h-4 w-4" />
             <span className="sr-only">复制分析报告</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full max-h-[calc(100vh-20rem)] rounded-md border p-4 bg-muted/50 text-sm prose dark:prose-invert max-w-none">
            {isLoading && !analysisReport ? (
              <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analysisReport ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
              >
                {analysisReport}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">AI分析报告将显示在此处...</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
       <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button onClick={handleProceedToElimination} className="w-full sm:w-auto" disabled={isLoading || !draftCopy.trim()}>
            <Zap className="mr-2 h-4 w-4" /> 进行AI特征消除 (进入第六步)
          </Button>
          <Button onClick={handleSkipToFinalPolishing} variant="outline" className="w-full sm:w-auto" disabled={isLoading || !draftCopy.trim()}>
            <Edit className="mr-2 h-4 w-4" /> 跳过，进入最终润色 (进入第七步)
          </Button>
        </CardFooter>
    </div>
  );

  return (
    <div className="h-[calc(100vh-10rem)]"> 
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
