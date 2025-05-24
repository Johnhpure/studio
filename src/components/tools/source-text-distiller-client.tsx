
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { distillSourceText, type DistillSourceTextInput } from "@/ai/flows/source-text-distiller";
import { useToast } from "@/hooks/use-toast";
import { Loader2, WandSparkles, Copy } from "lucide-react";

const LOCAL_STORAGE_KEY_SOURCE_TEXT = "sourceTextDistiller_sourceText";

export default function SourceTextDistillerClient() {
  const [sourceText, setSourceText] = useState("");
  const [distilledText, setDistilledText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSourceText = localStorage.getItem(LOCAL_STORAGE_KEY_SOURCE_TEXT);
      if (savedSourceText) {
        setSourceText(savedSourceText);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_SOURCE_TEXT, sourceText);
    }
  }, [sourceText]);

  const handleDistill = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "请输入必填项",
        description: "请输入要提取的源文本。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDistilledText(""); 
    try {
      const input: DistillSourceTextInput = { sourceText };
      const result = await distillSourceText(input);
      setDistilledText(result.summary);
      toast({
        title: "成功！",
        description: "源文本已成功提取。",
      });
    } catch (error) {
      console.error("Error distilling source text:", error);
      toast({
        title: "错误",
        description: "提取源文本失败，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDistilledText = () => {
    if (!distilledText) {
      toast({
        title: "无内容可复制",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(distilledText)
      .then(() => {
        toast({ title: "成功！", description: "提取的信息已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({ title: "错误", description: "复制失败，请重试。", variant: "destructive" });
      });
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>源文本</CardTitle>
        <CardDescription>粘贴您想要提取关键信息的文本。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="在此处输入您的源文本..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="flex-1 resize-none text-sm"
          rows={15}
        />
        <Button onClick={handleDistill} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <WandSparkles />}
          <span>{isLoading ? "提取中..." : "提取关键信息"}</span>
        </Button>
      </CardContent>
    </Card>
  );

  const rightPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>提取的信息</CardTitle>
          <CardDescription>从您的源文本中提取的关键见解。</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopyDistilledText} disabled={!distilledText || isLoading}>
          <Copy className="h-4 w-4" />
          <span className="sr-only">复制提取的信息</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="提取的信息将显示在此处..."
          value={distilledText}
          readOnly
          className="flex-1 resize-none bg-muted/50 text-sm"
          rows={15}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
