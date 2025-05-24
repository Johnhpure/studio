
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Copy, Save, Info, FileText, ListChecks, Eye, Edit3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft";
const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";

export default function Step7FinalPolishingClient() {
  const { toast } = useToast();

  const [finalDraft, setFinalDraft] = useState("");
  const [isPreviewingFinalDraft, setIsPreviewingFinalDraft] = useState(false);
  const [clientRequirements, setClientRequirements] = useState("");
  const [creativeOutline, setCreativeOutline] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFinalDraft(localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT) || "请在此处开始您的最终编辑...");
      setClientRequirements(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "无甲方需求信息。");
      setCreativeOutline(localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE) || "无创作大纲信息。");
    }
  }, []);

  const handleDraftChange = (newDraft: string) => {
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
  
  const ReviewItem = ({ title, content, icon: Icon }: { title: string; content: string; icon?: React.ElementType }) => (
    <div className="mb-2">
      <Label className="text-xs font-medium flex items-center mb-0.5">
        {Icon && <Icon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />}
        {title}
      </Label>
      <ScrollArea className="min-h-[60px] max-h-[calc(35vh-2rem)] w-full rounded-md border p-2 bg-muted/30 text-xs prose dark:prose-invert max-w-none">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "无相关信息"}</ReactMarkdown>
      </ScrollArea>
    </div>
  );


  const leftPane = (
    <div className="flex flex-col space-y-3 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center"><Info className="mr-2 h-4 w-4 text-blue-500" />关键信息回顾</CardTitle>
          <CardDescription className="text-xs">在此查阅甲方需求和您确认的创作大纲。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1.5 px-4 pt-0 pb-2">
          <ReviewItem title="甲方核心需求 (步骤一)" content={clientRequirements} icon={FileText} />
          <ReviewItem title="创作大纲 (步骤二)" content={creativeOutline} icon={ListChecks} />
        </CardContent>
         <CardFooter className="px-4 pb-3 pt-2">
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>最终稿件编辑区</CardTitle>
            <CardDescription>请在此处进行最终的修改、润色和校对。可切换编辑/预览模式。</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewingFinalDraft(!isPreviewingFinalDraft)}
            >
              {isPreviewingFinalDraft ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {isPreviewingFinalDraft ? "编辑" : "预览"}
            </Button>
             <Button onClick={handleCopyContent} variant="outline" size="icon" title="复制稿件内容 (Markdown)">
                <Copy className="h-4 w-4" />
                <span className="sr-only">复制稿件</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isPreviewingFinalDraft ? (
             <ScrollArea className="flex-1 rounded-md border p-4 bg-background min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {finalDraft || "稿件预览将在此处显示..."}
              </ReactMarkdown>
            </ScrollArea>
        ) : (
            <Textarea
              id="finalDraftEditor"
              placeholder="在此处加载并编辑您的稿件 (Markdown)..."
              value={finalDraft}
              onChange={(e) => handleDraftChange(e.target.value)}
              className="flex-1 resize-none text-sm min-h-[300px] bg-background"
            />
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleCopyContent} className="w-full md:w-auto">
          <Copy className="mr-2 h-4 w-4" />
          复制稿件内容 (Markdown)
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
