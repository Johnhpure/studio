
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiSignatureAnalyzer, type AiSignatureAnalyzerInput } from "@/ai/flows/ai-signature-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SearchCode, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

const LOCAL_STORAGE_KEY_DRAFT_COPY = "signatureAnalyzer_draftCopy";

export default function SignatureAnalyzerClient() {
  const [draftCopy, setDraftCopy] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraftCopy = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT_COPY);
      if (savedDraftCopy) {
        setDraftCopy(savedDraftCopy);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT_COPY, draftCopy);
    }
  }, [draftCopy]);

  const handleAnalyze = async () => {
    if (!draftCopy.trim()) {
      toast({
        title: "请输入必填项",
        description: "请输入要分析的草稿内容。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis("");
    setSuggestions([]);
    try {
      const input: AiSignatureAnalyzerInput = { draftCopy };
      const result = await aiSignatureAnalyzer(input);
      setAnalysis(result.analysis);
      setSuggestions(result.suggestions);
      toast({
        title: "成功！",
        description: "草稿已成功分析。",
      });
    } catch (error) {
      console.error("Error analyzing signature:", error);
      toast({
        title: "错误",
        description: "分析草稿失败，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysis) {
      toast({ title: "无内容可复制", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(analysis)
      .then(() => toast({ title: "成功！", description: "分析结果已复制到剪贴板。" }))
      .catch(err => {
        console.error("Failed to copy analysis: ", err);
        toast({ title: "错误", description: "复制分析结果失败。", variant: "destructive" });
      });
  };

  const handleCopySuggestions = () => {
    if (suggestions.length === 0) {
      toast({ title: "无内容可复制", variant: "destructive" });
      return;
    }
    const suggestionsText = suggestions.join("\n");
    navigator.clipboard.writeText(suggestionsText)
      .then(() => toast({ title: "成功！", description: "建议已复制到剪贴板。" }))
      .catch(err => {
        console.error("Failed to copy suggestions: ", err);
        toast({ title: "错误", description: "复制建议失败。", variant: "destructive" });
      });
  };


  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>分析草稿副本</CardTitle>
        <CardDescription>粘贴您的草稿以检查 AI 式模式并获取建议。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="grid gap-2 flex-1">
          <Label htmlFor="draftCopy">草稿内容</Label>
          <Textarea
            id="draftCopy"
            placeholder="在此处输入您的草稿副本..."
            value={draftCopy}
            onChange={(e) => setDraftCopy(e.target.value)}
            className="min-h-[200px] resize-none text-sm flex-1"
          />
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading} className="mt-auto w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <SearchCode />}
          <span>{isLoading ? "分析中..." : "分析特征"}</span>
        </Button>
      </CardContent>
    </Card>
  );

  const rightPane = (
    <div className="flex-1 flex flex-col gap-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>分析结果</CardTitle>
            <CardDescription>在您的草稿中找到的 AI 式模式。</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleCopyAnalysis} disabled={!analysis || isLoading}>
            <Copy className="h-4 w-4" />
             <span className="sr-only">复制分析结果</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/50 text-sm">
            {analysis || "分析结果将显示在此处..."}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>建议</CardTitle>
            <CardDescription>提高真实性的建议。</CardDescription>
          </div>
           <Button variant="outline" size="icon" onClick={handleCopySuggestions} disabled={suggestions.length === 0 || isLoading}>
            <Copy className="h-4 w-4" />
             <span className="sr-only">复制建议</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/50 text-sm">
            {suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            ) : (
              "建议将显示在此处..."
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );


  return (
    <div className="h-[calc(100vh-10rem)]">
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
