
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Wand2, BrainCircuit, Copy, Eye, Edit3, FilePenLine } from "lucide-react"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { learnUserStyle, type LearnUserStyleInput } from "@/ai/flows/style-learning-flow"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PromptEditModal } from "@/components/layout/prompt-edit-modal";
import { useTemporaryPrompts } from "@/contexts/TemporaryPromptsContext";
import { getDefaultPromptTemplate } from "@/ai/prompt-templates";

const LOCAL_STORAGE_KEY_MANUSCRIPT_SAMPLE = "step3_manuscriptSample";
const LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT = "app_userWritingStyleReport";
const PROMPT_KEY_STEP3: "step3_styleLearning" = "step3_styleLearning";

export default function Step3StyleLearningClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { getTemporaryPrompt, setTemporaryPrompt } = useTemporaryPrompts();

  const [manuscriptSample, setManuscriptSample] = useState("");
  const [isPreviewingSample, setIsPreviewingSample] = useState(false);
  const [styleAnalysisReport, setStyleAnalysisReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [reportCharCount, setReportCharCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setManuscriptSample(localStorage.getItem(LOCAL_STORAGE_KEY_MANUSCRIPT_SAMPLE) || "");
      const savedReport = localStorage.getItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT);
      if (savedReport) {
        setStyleAnalysisReport(savedReport);
      }
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_MANUSCRIPT_SAMPLE, manuscriptSample);
    }
  }, [manuscriptSample]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  useEffect(() => {
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const matches = styleAnalysisReport.match(chineseCharRegex);
    setReportCharCount(matches ? matches.length : 0);
  }, [styleAnalysisReport]);

  const handleAnalyzeStyle = async () => {
    if (!manuscriptSample.trim()) {
      toast({ title: "请输入范文", description: "请粘贴一篇高质量的稿件范例以供AI学习风格。", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setStyleAnalysisReport(""); 
    try {
      const temporaryPrompt = getTemporaryPrompt(PROMPT_KEY_STEP3);
      const input: LearnUserStyleInput = { 
        manuscriptSample,
        overridePromptTemplate: temporaryPrompt,
      };
      const result = await learnUserStyle(input);
      setStyleAnalysisReport(result.styleAnalysisReport);
      if (typeof window !== 'undefined' && result.styleAnalysisReport) {
         localStorage.setItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT, result.styleAnalysisReport);
      }
      toast({ title: "风格分析完成！", description: "AI已学习完毕，并生成了风格分析报告。" });
    } catch (error) {
      console.error("Error learning user style:", error);
      toast({ title: "分析失败", description: "AI学习风格时出错，请重试。", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmStyle = () => {
    if (!styleAnalysisReport.trim()) {
      toast({ title: "未生成风格报告", description: "请先让AI分析您的写作风格。", variant: "destructive" });
      return;
    }
    if (typeof window !== 'undefined' && styleAnalysisReport) {
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT, styleAnalysisReport);
    }
    toast({ title: "风格已确认", description: "正在前往下一步进行初稿创作。" });
    router.push('/step4-draft-creation'); 
  };

  const handleCopyReport = () => {
    if (!styleAnalysisReport.trim()) {
      toast({ title: "无内容可复制", description: "风格分析报告为空。", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(styleAnalysisReport)
      .then(() => {
        toast({ title: "复制成功", description: "风格分析报告 (Markdown) 已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy style report: ", err);
        toast({ title: "复制失败", description: "无法复制风格分析报告。", variant: "destructive" });
      });
  };

  const handleSaveTemporaryPrompt = (editedPrompt: string) => {
    setTemporaryPrompt(PROMPT_KEY_STEP3, editedPrompt);
    toast({ title: "提示词已临时保存", description: "本次AI生成将使用您编辑的提示词。" });
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center"><BrainCircuit className="mr-2 h-5 w-5" />输入您的风格范文</CardTitle>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewingSample(!isPreviewingSample)}
                    disabled={!manuscriptSample.trim()}
                    >
                    {isPreviewingSample ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {isPreviewingSample ? "编辑" : "预览"}
                </Button>
                 <Button variant="outline" size="sm" onClick={() => setIsPromptModalOpen(true)}>
                    <FilePenLine className="mr-2 h-4 w-4" /> 查看/编辑提示词
                </Button>
            </div>
        </div>
        <CardDescription>在此粘贴一篇能代表您个人写作风格的稿件范例。AI将学习其特征。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isPreviewingSample ? (
            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/30 min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {manuscriptSample || "范文预览将在此处显示..."}
              </ReactMarkdown>
            </ScrollArea>
        ) : (
            <Textarea
              id="manuscriptSample"
              placeholder="在此处粘贴您的稿件范例 (Markdown)..."
              value={manuscriptSample}
              onChange={(e) => setManuscriptSample(e.target.value)}
              className="flex-1 resize-none text-sm min-h-[300px]"
            />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyzeStyle} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
          {isLoading ? "风格分析中..." : "开始AI风格分析"}
        </Button>
      </CardFooter>
       <PromptEditModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        defaultPromptTemplate={getDefaultPromptTemplate(PROMPT_KEY_STEP3)}
        currentEditedPromptTemplate={getTemporaryPrompt(PROMPT_KEY_STEP3)}
        onSave={handleSaveTemporaryPrompt}
        stepTitle="步骤三：AI学习您的写作风格"
      />
    </Card>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
            <CardTitle>AI生成的风格分析报告</CardTitle>
            <CardDescription>AI根据您提供的范文生成的详细写作风格分析报告 (Markdown 预览)。</CardDescription>
            <p className="text-xs text-muted-foreground mt-1">字数统计: {reportCharCount} 字</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopyReport} disabled={!styleAnalysisReport.trim() || isLoading} title="复制原始Markdown报告" className="flex-shrink-0">
            <Copy className="h-4 w-4" />
            <span className="sr-only">复制报告</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="styleAnalysisReportDisplay" className="sr-only">风格分析报告展示区</Label>
        <ScrollArea id="styleAnalysisReportDisplay" className="flex-1 rounded-md border p-4 bg-muted/50 text-sm min-h-[300px] max-h-[calc(100vh-16rem)] prose dark:prose-invert max-w-none">
          {isLoading && !styleAnalysisReport ? (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : styleAnalysisReport ? (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
            >
              {styleAnalysisReport}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">AI风格分析报告将显示在此处...</p>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={handleConfirmStyle} className="w-full" disabled={!styleAnalysisReport.trim() || isLoading}>
          <ArrowRight className="mr-2 h-4 w-4" />
          确认风格并进入初稿创作
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
