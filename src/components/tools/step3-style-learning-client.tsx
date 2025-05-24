
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Wand2, BrainCircuit, Copy } from "lucide-react"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { learnUserStyle, type LearnUserStyleInput } from "@/ai/flows/style-learning-flow"; 

const LOCAL_STORAGE_KEY_MANUSCRIPT_SAMPLE = "step3_manuscriptSample";
const LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT = "app_userWritingStyleReport";

export default function Step3StyleLearningClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [manuscriptSample, setManuscriptSample] = useState("");
  const [styleAnalysisReport, setStyleAnalysisReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setManuscriptSample(localStorage.getItem(LOCAL_STORAGE_KEY_MANUSCRIPT_SAMPLE) || "");
      setStyleAnalysisReport(localStorage.getItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT) || "");
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_MANUSCRIPT_SAMPLE, manuscriptSample);
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT, styleAnalysisReport);
    }
  }, [manuscriptSample, styleAnalysisReport]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  const handleAnalyzeStyle = async () => {
    if (!manuscriptSample.trim()) {
      toast({ title: "请输入范文", description: "请粘贴一篇高质量的稿件范例以供AI学习风格。", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setStyleAnalysisReport(""); 
    try {
      const input: LearnUserStyleInput = { manuscriptSample };
      const result = await learnUserStyle(input);
      setStyleAnalysisReport(result.styleAnalysisReport);
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
        toast({ title: "复制成功", description: "风格分析报告已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy style report: ", err);
        toast({ title: "复制失败", description: "无法复制风格分析报告。", variant: "destructive" });
      });
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center"><BrainCircuit className="mr-2 h-5 w-5" />输入您的风格范文</CardTitle>
        <CardDescription>请在此处粘贴一篇能充分代表您个人写作风格和技巧的高质量稿件范例的完整文本内容。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="manuscriptSample" className="sr-only">风格范文输入框</Label>
        <Textarea
          id="manuscriptSample"
          placeholder="在此处粘贴您的稿件范例..."
          value={manuscriptSample}
          onChange={(e) => setManuscriptSample(e.target.value)}
          className="flex-1 resize-none text-sm min-h-[300px] max-h-[70vh]"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyzeStyle} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
          {isLoading ? "风格分析中..." : "开始AI风格分析"}
        </Button>
      </CardFooter>
    </Card>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>AI生成的风格分析报告</CardTitle>
            <CardDescription>AI根据您提供的范文生成的详细写作风格分析报告 (Markdown格式)。</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopyReport} disabled={!styleAnalysisReport.trim() || isLoading}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">复制报告</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="styleAnalysisReport" className="sr-only">风格分析报告展示区</Label>
        <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/50 text-sm min-h-[300px] max-h-[70vh]">
          <pre className="whitespace-pre-wrap break-all">{styleAnalysisReport || "AI风格分析报告将显示在此处..."}</pre>
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
    