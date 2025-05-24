
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiAssistedRefinement, type AiAssistedRefinementInput } from "@/ai/flows/ai-assisted-refinement";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkle, Copy } from "lucide-react";

const LOCAL_STORAGE_KEY_DRAFT_TEXT = "refinement_draftText";
const LOCAL_STORAGE_KEY_STYLE_TRAITS = "refinement_styleTraits";

export default function RefinementClient() {
  const [draftText, setDraftText] = useState("");
  const [styleTraits, setStyleTraits] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraftText = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT_TEXT);
      if (savedDraftText) {
        setDraftText(savedDraftText);
      }
      const savedStyleTraits = localStorage.getItem(LOCAL_STORAGE_KEY_STYLE_TRAITS);
      if (savedStyleTraits) {
        setStyleTraits(savedStyleTraits);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT_TEXT, draftText);
    }
  }, [draftText]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STYLE_TRAITS, styleTraits);
    }
  }, [styleTraits]);

  const handleRefine = async () => {
    if (!draftText.trim()) {
      toast({
        title: "请输入必填项",
        description: "请输入要优化的草稿文本。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRefinedText("");
    try {
      const input: AiAssistedRefinementInput = { draftText, styleTraits };
      const result = await aiAssistedRefinement(input);
      setRefinedText(result.refinedText);
      toast({
        title: "成功！",
        description: "文本已成功优化。",
      });
    } catch (error) {
      console.error("Error refining text:", error);
      toast({
        title: "错误",
        description: "优化文本失败，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRefinedText = () => {
    if (!refinedText) {
      toast({
        title: "无内容可复制",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(refinedText)
      .then(() => {
        toast({ title: "成功！", description: "优化后的文本已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({ title: "错误", description: "复制失败，请重试。", variant: "destructive" });
      });
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>优化输入</CardTitle>
        <CardDescription>提供您的草稿和可选的风格特点以进行 AI 辅助优化。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="grid gap-2 flex-1">
          <Label htmlFor="draftText">草稿文本</Label>
          <Textarea
            id="draftText"
            placeholder="输入您想要优化的草稿文本..."
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="flex-1 resize-none text-sm"
            rows={10}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="styleTraits">风格特点 (可选)</Label>
          <Textarea
            id="styleTraits"
            placeholder="描述所需的风格特点 (例如, '正式, 简洁', '风趣, 引人入胜')..."
            value={styleTraits}
            onChange={(e) => setStyleTraits(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>
        <Button onClick={handleRefine} disabled={isLoading} className="w-full mt-auto">
          {isLoading ? <Loader2 className="animate-spin" /> : <Sparkle />}
          <span>{isLoading ? "优化中..." : "优化文本"}</span>
        </Button>
      </CardContent>
    </Card>
  );

  const rightPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>优化后的文本</CardTitle>
          <CardDescription>改进后的文本，风格增强，AI 特征减少。</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopyRefinedText} disabled={!refinedText || isLoading}>
          <Copy className="h-4 w-4" />
          <span className="sr-only">复制优化后的文本</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="优化后的文本将显示在此处..."
          value={refinedText}
          readOnly
          className="flex-1 resize-none bg-muted/50 text-sm"
          rows={15}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-10rem)]">
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
