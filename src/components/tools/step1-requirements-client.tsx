
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Eye, Edit3 } from "lucide-react"; // Added Eye and Edit3
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";

export default function Step1RequirementsClient() {
  const [clientRequirements, setClientRequirements] = useState("");
  const [isPreviewingRequirements, setIsPreviewingRequirements] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRequirements = localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS);
      if (savedRequirements) {
        setClientRequirements(savedRequirements);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS, clientRequirements);
    }
  }, [clientRequirements]);

  const handleNextStep = () => {
    if (!clientRequirements.trim()) {
      toast({
        title: "请输入核心需求",
        description: "请输入甲方对稿件的核心需求文本内容。",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "需求已保存",
      description: "甲方核心需求已保存到浏览器本地存储。",
    });
    router.push('/step2-outline-generator'); 
  };

  return (
    <Card className="flex-1 flex flex-col max-w-3xl mx-auto w-full h-full">
      <CardHeader>
        <CardTitle>步骤一：输入甲方核心需求</CardTitle>
        <CardDescription>请在此处粘贴甲方对稿件的核心需求文本内容。这些信息将作为后续AI智能辅助的基础。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="clientRequirementsInput">甲方核心需求 (Markdown)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewingRequirements(!isPreviewingRequirements)}
            >
              {isPreviewingRequirements ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {isPreviewingRequirements ? "编辑" : "预览"}
            </Button>
          </div>
          {isPreviewingRequirements ? (
            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/30 min-h-[300px] max-h-[70vh] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {clientRequirements || "在此处输入Markdown以查看预览..."}
              </ReactMarkdown>
            </ScrollArea>
          ) : (
            <Textarea
              id="clientRequirementsInput"
              placeholder="在此处粘贴甲方需求 (Markdown)..."
              value={clientRequirements}
              onChange={(e) => setClientRequirements(e.target.value)}
              className="flex-1 resize-none text-sm rounded-md border border-input bg-background px-3 py-2 shadow-sm placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[300px] max-h-[70vh]"
            />
          )}
        </div>
        <Button onClick={handleNextStep} className="mt-auto w-full">
          <ArrowRight className="mr-2 h-4 w-4" />
          下一步：生成创作大纲
        </Button>
      </CardContent>
    </Card>
  );
}
