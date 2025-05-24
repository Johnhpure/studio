"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiSignatureAnalyzer, type AiSignatureAnalyzerInput } from "@/ai/flows/ai-signature-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SearchCode } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SignatureAnalyzerClient() {
  const [draftCopy, setDraftCopy] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>分析草稿副本</CardTitle>
          <CardDescription>粘贴您的草稿以检查 AI 式模式并获取建议。</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="在此处输入您的草稿副本..."
            value={draftCopy}
            onChange={(e) => setDraftCopy(e.target.value)}
            className="min-h-[200px] resize-none text-sm"
          />
          <Button onClick={handleAnalyze} disabled={isLoading} className="mt-4 w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <SearchCode />}
            <span>{isLoading ? "分析中..." : "分析特征"}</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>分析结果</CardTitle>
            <CardDescription>在您的草稿中找到的 AI 式模式。</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/50 text-sm">
              {analysis || "分析结果将显示在此处..."}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>建议</CardTitle>
            <CardDescription>提高真实性的建议。</CardDescription>
          </CardHeader>
          <CardContent>
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
    </div>
  );
}
