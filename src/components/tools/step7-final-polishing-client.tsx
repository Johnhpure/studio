
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Copy, Save, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft";
const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";

export default function Step7FinalPolishingClient() {
  const { toast } = useToast();

  const [finalDraft, setFinalDraft] = useState("");
  const [clientRequirements, setClientRequirements] = useState("");
  const [creativeOutline, setCreativeOutline] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFinalDraft(localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT) || "请在此处开始您的最终编辑...");
      setClientRequirements(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "无甲方需求信息。");
      setCreativeOutline(localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE) || "无创作大纲信息。");
    }
  }, []);

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDraft = e.target.value;
    setFinalDraft(newDraft);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, newDraft);
    }
  };

  const handleSaveChanges = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, finalDraft);
      toast({
        title: "保存成功！",
        description: "当前稿件修改已保存到浏览器本地存储。",
      });
    }
  };

  const handleCopyContent = () => {
    if (!finalDraft.trim()) {
      toast({
        title: "无内容可复制",
        description: "编辑区内容为空。",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(finalDraft)
      .then(() => {
        toast({
          title: "复制成功！",
          description: "稿件内容已成功复制到剪贴板！",
        });
      })
      .catch(err => {
        console.error("Failed to copy content: ", err);
        toast({
          title: "复制失败",
          description: "无法将内容复制到剪贴板，请重试或手动复制。",
          variant: "destructive",
        });
      });
  };

  const leftPane = (
    <div className="flex flex-col space-y-4 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-blue-500" />关键信息回顾</CardTitle>
          <CardDescription>在此查阅甲方需求和您确认的创作大纲。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
          <div>
            <Label htmlFor="clientReqReview" className="text-sm font-medium">甲方核心需求 (步骤一)</Label>
            <ScrollArea className="h-full max-h-[35vh] w-full rounded-md border p-3 bg-muted/30 text-sm mt-1">
              <pre className="whitespace-pre-wrap break-all">{clientRequirements}</pre>
            </ScrollArea>
          </div>
          <div>
            <Label htmlFor="outlineReview" className="text-sm font-medium">创作大纲 (步骤二)</Label>
            <ScrollArea className="h-full max-h-[35vh] w-full rounded-md border p-3 bg-muted/30 text-sm mt-1">
               <pre className="whitespace-pre-wrap break-all">{creativeOutline}</pre>
            </ScrollArea>
          </div>
        </CardContent>
         <CardFooter>
          <Button onClick={handleSaveChanges} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            保存当前修改
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>最终稿件编辑区</CardTitle>
        <CardDescription>请在此处进行最终的修改、润色和校对。您的修改会自动保存到浏览器。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="finalDraftEditor" className="sr-only">最终稿件编辑器</Label>
        <Textarea
          id="finalDraftEditor"
          placeholder="在此处加载并编辑您的稿件..."
          value={finalDraft}
          onChange={handleDraftChange}
          className="flex-1 resize-none text-sm min-h-[300px] max-h-[70vh] bg-background"
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleCopyContent} className="w-full md:w-auto">
          <Copy className="mr-2 h-4 w-4" />
          复制稿件内容
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
