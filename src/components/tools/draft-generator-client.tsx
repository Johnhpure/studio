
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { generateDraft, type GenerateDraftInput } from "@/ai/flows/draft-generation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3, Copy } from "lucide-react";

const LOCAL_STORAGE_KEY_OUTLINE = "draftGenerator_outline";
const LOCAL_STORAGE_KEY_STYLE_EXAMPLES = "draftGenerator_styleExamples";

export default function DraftGeneratorClient() {
  const [outline, setOutline] = useState("");
  const [styleExamples, setStyleExamples] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOutline = localStorage.getItem(LOCAL_STORAGE_KEY_OUTLINE);
      if (savedOutline) {
        setOutline(savedOutline);
      }
      const savedStyleExamples = localStorage.getItem(LOCAL_STORAGE_KEY_STYLE_EXAMPLES);
      if (savedStyleExamples) {
        setStyleExamples(savedStyleExamples);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_OUTLINE, outline);
    }
  }, [outline]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STYLE_EXAMPLES, styleExamples);
    }
  }, [styleExamples]);

  const handleGenerateDraft = async () => {
    if (!outline.trim() || !styleExamples.trim()) {
      toast({
        title: "请输入必填项",
        description: "请同时提供大纲和风格示例。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedDraft("");
    try {
      const input: GenerateDraftInput = { outline, styleExamples };
      const result = await generateDraft(input);
      setGeneratedDraft(result.draft);
      toast({
        title: "成功！",
        description: "草稿已成功生成。",
      });
    } catch (error) {
      console.error("Error generating draft:", error);
      toast({
        title: "错误",
        description: "生成草稿失败，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyGeneratedDraft = () => {
    if (!generatedDraft) {
      toast({
        title: "无内容可复制",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(generatedDraft)
      .then(() => {
        toast({ title: "成功！", description: "生成的草稿已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({ title: "错误", description: "复制失败，请重试。", variant: "destructive" });
      });
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>草稿输入</CardTitle>
        <CardDescription>提供大纲和风格示例以生成草稿。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="grid gap-2 flex-grow">
          <Label htmlFor="outline">大纲</Label>
          <Textarea
            id="outline"
            placeholder="输入您草稿的大纲..."
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            className="min-h-[150px] resize-none text-sm flex-1"
          />
        </div>
        <div className="grid gap-2 flex-grow">
          <Label htmlFor="styleExamples">风格示例</Label>
          <Textarea
            id="styleExamples"
            placeholder="提供所需写作风格的示例..."
            value={styleExamples}
            onChange={(e) => setStyleExamples(e.target.value)}
            className="min-h-[150px] resize-none text-sm flex-1"
          />
        </div>
        <Button onClick={handleGenerateDraft} disabled={isLoading} className="w-full mt-auto">
          {isLoading ? <Loader2 className="animate-spin" /> : <Edit3 />}
          <span>{isLoading ? "生成中..." : "生成草稿"}</span>
        </Button>
      </CardContent>
    </Card>
  );

  const rightPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>生成的草稿</CardTitle>
          <CardDescription>AI 生成的草稿将显示在此处。</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopyGeneratedDraft} disabled={!generatedDraft || isLoading}>
          <Copy className="h-4 w-4" />
          <span className="sr-only">复制生成的草稿</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="生成的草稿..."
          value={generatedDraft}
          readOnly
          className="flex-1 resize-none bg-muted/50 text-sm"
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
