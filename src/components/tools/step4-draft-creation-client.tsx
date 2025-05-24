
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Wand2, FileText, Info, Palette, ListChecks, Edit, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateDraft, type GenerateDraftInput } from "@/ai/flows/draft-generation"; // Updated import if path changes

const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";
const LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA = "step2_finalOutline_metadata";
const LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT = "app_userWritingStyleReport";
const LOCAL_STORAGE_KEY_STEP4_TEMP_INSTRUCTIONS = "step4_tempInstructions";
const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft";


interface OutlineMetadata {
  manuscriptType: string;
  selectedBrand: string;
  wordCount: string | number;
}

export default function Step4DraftCreationClient() {
  const router = useRouter();
  const { toast } = useToast();

  // Inputs from previous steps (read-only display)
  const [clientRequirements, setClientRequirements] = useState("");
  const [creativeOutline, setCreativeOutline] = useState("");
  const [writingStyleGuide, setWritingStyleGuide] = useState("");
  const [outlineMetadata, setOutlineMetadata] = useState<OutlineMetadata | null>(null);

  // Input for this step
  const [tempFineTuneInstructions, setTempFineTuneInstructions] = useState("");
  
  // Output of this step
  const [generatedDraft, setGeneratedDraft] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientRequirements(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "未找到甲方核心需求。");
      setCreativeOutline(localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE) || "未找到创作大纲。");
      setWritingStyleGuide(localStorage.getItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT) || "未找到写作风格指引。");
      
      const metadataStr = localStorage.getItem(LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA);
      if (metadataStr) {
        try {
          setOutlineMetadata(JSON.parse(metadataStr));
        } catch (e) {
          console.error("Failed to parse outline metadata:", e);
          setOutlineMetadata(null);
        }
      } else {
        setOutlineMetadata(null);
      }

      setTempFineTuneInstructions(localStorage.getItem(LOCAL_STORAGE_KEY_STEP4_TEMP_INSTRUCTIONS) || "");
      
      // Load draft being worked on, if any
      const currentDraft = localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT);
      // Check if this draft likely originated from this step or a later step.
      // For now, if a draft exists, we assume it's the one to work with.
      if (currentDraft) {
        setGeneratedDraft(currentDraft);
      }
    }
  }, []);

  const saveTempInstructions = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STEP4_TEMP_INSTRUCTIONS, tempFineTuneInstructions);
    }
  }, [tempFineTuneInstructions]);

  useEffect(() => {
    saveTempInstructions();
  }, [saveTempInstructions]);

  const handleGeneratedDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDraft = e.target.value;
    setGeneratedDraft(newDraft);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, newDraft);
    }
  };

  const handleGenerateDraft = async () => {
    if (!clientRequirements || clientRequirements === "未找到甲方核心需求。" ||
        !creativeOutline || creativeOutline === "未找到创作大纲。" ||
        !writingStyleGuide || writingStyleGuide === "未找到写作风格指引。" ||
        !outlineMetadata) {
      toast({ title: "创作要素不完整", description: "请确保已完成步骤一、二、三，并获取了所有必要的创作输入信息。", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // setGeneratedDraft(""); // Clear previous draft before generating a new one
    try {
      const input: GenerateDraftInput = {
        clientRequirements,
        creativeOutline,
        writingStyleGuide,
        manuscriptType: outlineMetadata.manuscriptType,
        brand: outlineMetadata.selectedBrand,
        wordCount: outlineMetadata.wordCount,
        tempFineTuneInstructions: tempFineTuneInstructions.trim() || undefined,
      };
      const result = await generateDraft(input);
      setGeneratedDraft(result.generatedDraft);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, result.generatedDraft);
      }
      toast({ title: "成功", description: "稿件初稿已生成！您可以进行编辑或进入下一步。" });
    } catch (error: any) {
      console.error("Error generating draft:", error);
      toast({ title: "错误", description: `生成稿件初稿失败: ${error.message || '请重试。'}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToNextStep = (path: string) => {
    if (!generatedDraft.trim()) {
      toast({ title: "稿件内容为空", description: "请先生成或编辑稿件内容，再进入下一步。", variant: "destructive"});
      return;
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, generatedDraft);
    }
    router.push(path);
  };

  const ReviewItem = ({ title, content, icon: Icon }: { title: string; content: string; icon?: React.ElementType }) => (
    <div className="mb-3">
      <Label className="text-sm font-medium flex items-center mb-1">
        {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
        {title}
      </Label>
      <ScrollArea className="h-20 w-full rounded-md border p-2 bg-muted/30 text-xs">
        <pre className="whitespace-pre-wrap break-all">{content}</pre>
      </ScrollArea>
    </div>
  );

  const leftPane = (
    <div className="flex flex-col space-y-3 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center"><Info className="mr-2 h-5 w-5" />创作依据回顾</CardTitle>
          <CardDescription className="text-xs">以下是AI创作本稿件所依据的核心信息。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 px-4 pt-0 pb-3">
          <ReviewItem title="甲方核心需求 (步骤一)" content={clientRequirements} icon={FileText} />
          <ReviewItem title="创作大纲 (步骤二)" content={creativeOutline} icon={ListChecks} />
          {outlineMetadata && (
            <div className="text-xs p-2 border rounded-md bg-muted/30">
              <p><strong>稿件类型:</strong> {outlineMetadata.manuscriptType}</p>
              <p><strong>目标品牌:</strong> {outlineMetadata.selectedBrand}</p>
              <p><strong>期望字数:</strong> {outlineMetadata.wordCount.toString()}</p>
            </div>
          )}
          <ReviewItem title="写作风格指引 (步骤三)" content={writingStyleGuide} icon={Palette} />
          
          <div>
            <Label htmlFor="tempInstructions" className="text-sm font-medium flex items-center mb-1">
                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                临时微调指令 (可选)
            </Label>
            <Textarea
              id="tempInstructions"
              placeholder="针对本次初稿生成，输入临时的、额外的指令..."
              value={tempFineTuneInstructions}
              onChange={(e) => setTempFineTuneInstructions(e.target.value)}
              className="text-xs resize-none min-h-[60px] max-h-[15vh]"
            />
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-2">
          <Button onClick={handleGenerateDraft} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isLoading ? "生成中..." : "开始AI创作稿件"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">AI生成的稿件初稿</CardTitle>
        <CardDescription>AI根据您的所有输入创作的初稿。您可在此编辑，然后选择后续操作。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="generatedDraftOutput" className="sr-only">稿件初稿编辑区</Label>
        <Textarea
          id="generatedDraftOutput"
          placeholder="AI生成的稿件初稿将显示在此处..."
          value={generatedDraft}
          onChange={handleGeneratedDraftChange}
          className="flex-1 resize-none text-sm min-h-[300px] max-h-[68vh] bg-muted/20"
        />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button onClick={() => navigateToNextStep('/step5-ai-analysis')} className="w-full sm:w-auto" disabled={isLoading || !generatedDraft.trim()}>
            <Zap className="mr-2 h-4 w-4" /> 开始AI特征分析 (进入第五步)
          </Button>
          <Button onClick={() => navigateToNextStep('/step7-final-polishing')} variant="outline" className="w-full sm:w-auto" disabled={isLoading || !generatedDraft.trim()}>
            <ArrowRight className="mr-2 h-4 w-4" /> 直接最终润色 (进入第七步)
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

    