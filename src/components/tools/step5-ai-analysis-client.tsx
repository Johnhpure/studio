
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiSignatureAnalyzer, type AiSignatureAnalyzerInput } from "@/ai/flows/ai-signature-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Microscope, Zap, Edit, Copy } from "lucide-react"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft"; 
const LOCAL_STORAGE_KEY_STEP5_DRAFT_COPY = "step5_aiAnalysis_draftCopy"; 
const LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS = "app_aiSuggestions"; 

export default function Step5AiAnalysisClient() {
  const router = useRouter();
  const [draftCopy, setDraftCopy] = useState("");
  const [analysisReport, setAnalysisReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draftFromPrevStep = localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT);
      const savedDraftCopy = localStorage.getItem(LOCAL_STORAGE_KEY_STEP5_DRAFT_COPY);
      
      if (draftFromPrevStep) {
        setDraftCopy(draftFromPrevStep);
      } else if (savedDraftCopy) {
        setDraftCopy(savedDraftCopy);
      }

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
      const input: AiSignatureAnalyzerInput = { draftCopy };
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
    navigator.clipboard.writeText(analysisReport) // Copies the raw Markdown
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
    if (analysisReport.trim()) {
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS, analysisReport);
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

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>当前待分析稿件</CardTitle>
        <CardDescription>此处显示从上一步骤传入或您在此处编辑的稿件内容。点击下方按钮开始分析。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="grid gap-2 flex-1">
          <Label htmlFor="draftCopy">稿件内容</Label>
          <Textarea
            id="draftCopy"
            placeholder="请粘贴或输入待分析的稿件内容..."
            value={draftCopy}
            onChange={(e) => setDraftCopy(e.target.value)}
            className="flex-1 resize-none text-sm min-h-[300px] max-h-[65vh]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <Microscope />}
          <span>{isLoading ? "分析中..." : "开始AI特征检测与分析"}</span>
        </Button>
      </CardFooter>
    </Card>
  );

  const rightPane = (
    <div className="flex-1 flex flex-col gap-4">
      <Card className="flex-grow flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>AI特征诊断与优化指南</CardTitle>
            <CardDescription>AI对稿件的深度分析报告。</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleCopyAnalysisReport} disabled={!analysisReport.trim() || isLoading} title="复制原始Markdown报告">
            <Copy className="h-4 w-4" />
             <span className="sr-only">复制分析报告</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full max-h-[calc(65vh-7rem)] rounded-md border p-4 bg-muted/50 text-sm">
            {isLoading && !analysisReport ? (
              <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analysisReport ? (
              <ReactMarkdown 
                className="prose dark:prose-invert max-w-none"
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
