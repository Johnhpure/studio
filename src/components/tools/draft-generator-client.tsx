"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateDraft, type GenerateDraftInput } from "@/ai/flows/draft-generation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3 } from "lucide-react";

export default function DraftGeneratorClient() {
  const [outline, setOutline] = useState("");
  const [styleExamples, setStyleExamples] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>草稿输入</CardTitle>
          <CardDescription>提供大纲和风格示例以生成草稿。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="outline">大纲</Label>
            <Textarea
              id="outline"
              placeholder="输入您草稿的大纲..."
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              className="min-h-[150px] resize-none text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="styleExamples">风格示例</Label>
            <Textarea
              id="styleExamples"
              placeholder="提供所需写作风格的示例..."
              value={styleExamples}
              onChange={(e) => setStyleExamples(e.target.value)}
              className="min-h-[150px] resize-none text-sm"
            />
          </div>
          <Button onClick={handleGenerateDraft} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <Edit3 />}
            <span>{isLoading ? "生成中..." : "生成草稿"}</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>生成的草稿</CardTitle>
          <CardDescription>AI 生成的草稿将显示在此处。</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="生成的草稿..."
            value={generatedDraft}
            readOnly
            className="min-h-[250px] resize-none bg-muted/50 text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
