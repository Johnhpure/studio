
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Wand2, FileText, Info, Palette, ListChecks, Edit, Zap, Copy, Eye, Edit3, FilePenLine, WandSparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateDraft, type GenerateDraftInput } from "@/ai/flows/draft-generation";
import { refineTextWithPrompt, type RefineTextWithPromptInput, type RefineTextWithPromptOutput } from "@/ai/flows/generic-text-refinement-flow";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PromptEditModal } from "@/components/layout/prompt-edit-modal";
import { AiModificationModal } from "@/components/layout/ai-modification-modal";
import { useTemporaryPrompts } from "@/contexts/TemporaryPromptsContext";
import { STEP_4_DRAFT_GENERATION_PROMPT_TEMPLATE, getDefaultPromptTemplate } from "@/ai/prompt-templates";


const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";
const LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA = "step2_finalOutline_metadata";
const LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT = "app_userWritingStyleReport";
const LOCAL_STORAGE_KEY_STEP4_TEMP_INSTRUCTIONS = "step4_tempInstructions";
const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft";

const PROMPT_KEY_STEP4: "step4_draftGeneration" = "step4_draftGeneration";


interface OutlineMetadata {
  manuscriptType: string;
  selectedBrand: string;
  wordCount: string | number;
}

export default function Step4DraftCreationClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { getTemporaryPrompt, setTemporaryPrompt } = useTemporaryPrompts();

  const [clientRequirements, setClientRequirements] = useState("");
  const [creativeOutline, setCreativeOutline] = useState("");
  const [writingStyleGuide, setWritingStyleGuide] = useState("");
  const [outlineMetadata, setOutlineMetadata] = useState<OutlineMetadata | null>(null);
  
  const [tempFineTuneInstructions, setTempFineTuneInstructions] = useState("");
  const [isPreviewingTempInstructions, setIsPreviewingTempInstructions] = useState(false);
  
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isAiModificationModalOpen, setIsAiModificationModalOpen] = useState(false);
  const [generatedDraftCharCount, setGeneratedDraftCharCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientRequirements(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "未找到甲方核心需求。");
      setCreativeOutline(localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE) || "未找到创作大纲。");
      
      const styleReport = localStorage.getItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT);
      if (styleReport && styleReport.trim() !== "") {
        setWritingStyleGuide(styleReport);
      } else {
        setWritingStyleGuide("（已跳过风格学习，将使用通用专业风格）");
      }
      
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
      
      const currentDraft = localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT);
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

  useEffect(() => {
    setGeneratedDraftCharCount(generatedDraft.length);
  }, [generatedDraft]);

  const handleGeneratedDraftChange = (newDraft: string) => {
    setGeneratedDraft(newDraft);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, newDraft);
    }
  };

  const handleGenerateDraft = async () => {
    if (!clientRequirements || clientRequirements === "未找到甲方核心需求。" ||
        !creativeOutline || creativeOutline === "未找到创作大纲。" ||
        !outlineMetadata) {
      toast({ title: "创作要素不完整", description: "请确保已完成步骤一、二，并获取了所有必要的创作输入信息。", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const actualWritingStyleGuide = (writingStyleGuide === "（已跳过风格学习，将使用通用专业风格）" || !writingStyleGuide.trim()) 
                                     ? undefined 
                                     : writingStyleGuide;
      const temporaryPrompt = getTemporaryPrompt(PROMPT_KEY_STEP4);

      const input: GenerateDraftInput = {
        clientRequirements,
        creativeOutline,
        writingStyleGuide: actualWritingStyleGuide,
        manuscriptType: outlineMetadata.manuscriptType,
        brand: outlineMetadata.selectedBrand,
        wordCount: outlineMetadata.wordCount,
        tempFineTuneInstructions: tempFineTuneInstructions.trim() || undefined,
        overridePromptTemplate: temporaryPrompt,
      };
      const result = await generateDraft(input);
      handleGeneratedDraftChange(result.generatedDraft);

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
    router.push(path);
  };

  const handleCopyDraft = () => {
    if (!generatedDraft.trim()) {
      toast({ title: "无内容可复制", description: "稿件初稿为空。", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(generatedDraft)
      .then(() => {
        toast({ title: "复制成功", description: "稿件初稿已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy draft: ", err);
        toast({ title: "复制失败", description: "无法复制稿件初稿。", variant: "destructive" });
      });
  };

  const handleSaveTemporaryPrompt = (editedPrompt: string) => {
    setTemporaryPrompt(PROMPT_KEY_STEP4, editedPrompt);
    toast({ title: "提示词已临时保存", description: "本次AI生成将使用您编辑的提示词。" });
  };

  const handleApplyDraftModification = async (originalContent: string, userPrompt: string): Promise<string> => {
    const input: RefineTextWithPromptInput = {
      originalText: originalContent,
      userPrompt: userPrompt,
    };
    const result: RefineTextWithPromptOutput = await refineTextWithPrompt(input);
    return result.refinedText;
  };

  const handleSaveRefinedDraft = (refinedDraftContent: string) => {
    handleGeneratedDraftChange(refinedDraftContent); 
  };

  const ReviewItem = ({ title, content, icon: Icon, isMarkdown = true }: { title: string; content: string; icon?: React.ElementType, isMarkdown?: boolean }) => (
    <div className="mb-3">
      <Label className="text-sm font-medium flex items-center mb-1">
        {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
        {title}
      </Label>
      <ScrollArea className="min-h-[80px] max-h-[18vh] w-full rounded-md border p-2 bg-muted/30 text-xs prose-xs dark:prose-invert max-w-none">
        {isMarkdown ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <pre className="whitespace-pre-wrap">{content}</pre>}
      </ScrollArea>
    </div>
  );

  const leftPane = (
    <div className="flex flex-col space-y-3 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center"><Info className="mr-2 h-5 w-5" />创作依据回顾</CardTitle>
            <CardDescription className="text-xs">以下是AI创作本稿件所依据的核心信息。</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsPromptModalOpen(true)}>
            <FilePenLine className="mr-2 h-4 w-4" /> 查看/编辑提示词
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 px-4 pt-0 pb-3">
          <ReviewItem title="甲方核心需求 (步骤一)" content={clientRequirements} icon={FileText} />
          <ReviewItem title="创作大纲 (步骤二)" content={creativeOutline} icon={ListChecks} />
          {outlineMetadata && (
            <div className="text-xs p-2 border rounded-md bg-muted/30 mb-3 prose-xs dark:prose-invert max-w-none">
              <p><strong>稿件类型:</strong> {outlineMetadata.manuscriptType}</p>
              <p><strong>目标品牌:</strong> {outlineMetadata.selectedBrand}</p>
              <p><strong>期望字数:</strong> {outlineMetadata.wordCount.toString()}</p>
            </div>
          )}
          <ReviewItem title="写作风格指引 (步骤三)" content={writingStyleGuide} icon={Palette} isMarkdown={writingStyleGuide !== "（已跳过风格学习，将使用通用专业风格）"} />
          
          <div>
            <div className="flex justify-between items-center mb-1">
                <Label htmlFor="tempInstructions" className="text-sm font-medium flex items-center">
                    <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                    临时微调指令 (可选, Markdown)
                </Label>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsPreviewingTempInstructions(!isPreviewingTempInstructions)}
                  disabled={!tempFineTuneInstructions.trim()}
                >
                  {isPreviewingTempInstructions ? <Edit3 className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                  {isPreviewingTempInstructions ? "编辑" : "预览"}
                </Button>
            </div>
            {isPreviewingTempInstructions ? (
                 <ScrollArea className="rounded-md border p-2 bg-muted/30 text-xs flex-1 min-h-[80px] max-h-[18vh] prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{tempFineTuneInstructions || "指令预览..."}</ReactMarkdown>
                 </ScrollArea>
            ) : (
                <Textarea
                  id="tempInstructions"
                  placeholder="针对本次初稿生成，输入临时的、额外的指令 (Markdown)..."
                  value={tempFineTuneInstructions}
                  onChange={(e) => setTempFineTuneInstructions(e.target.value)}
                  className="text-xs resize-none flex-1 w-full min-h-[80px] max-h-[18vh]"
                />
            )}
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
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
            <CardTitle className="text-lg">AI生成的稿件初稿</CardTitle>
            <CardDescription>AI根据您的所有输入创作的初稿。可切换编辑/预览模式。</CardDescription>
            <p className="text-xs text-muted-foreground mt-1">字数统计: {generatedDraftCharCount} 字</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiModificationModalOpen(true)}
                disabled={!generatedDraft.trim() || isLoading}
                title="AI辅助修改初稿"
            >
                <WandSparkles className="mr-2 h-4 w-4" /> AI辅助修改
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewingDraft(!isPreviewingDraft)}
              disabled={!generatedDraft.trim()}
            >
              {isPreviewingDraft ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {isPreviewingDraft ? "编辑" : "预览"}
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyDraft} disabled={!generatedDraft.trim() || isLoading} title="复制初稿Markdown">
                <Copy className="h-4 w-4" />
                <span className="sr-only">复制初稿</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading && !generatedDraft ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : isPreviewingDraft ? (
            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/20 min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedDraft || "稿件预览将在此处显示..."}
              </ReactMarkdown>
            </ScrollArea>
        ) : (
            <Textarea
              id="generatedDraftOutput"
              placeholder="AI生成的稿件初稿将显示在此处..."
              value={generatedDraft}
              onChange={(e) => handleGeneratedDraftChange(e.target.value)}
              className="flex-1 resize-none text-sm min-h-[300px] bg-muted/20"
            />
        )}
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
      <PromptEditModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        defaultPromptTemplate={getDefaultPromptTemplate(PROMPT_KEY_STEP4)}
        currentEditedPromptTemplate={getTemporaryPrompt(PROMPT_KEY_STEP4)}
        onSave={handleSaveTemporaryPrompt}
        stepTitle="步骤四：AI智能创作初稿"
      />
      <AiModificationModal
        isOpen={isAiModificationModalOpen}
        onClose={() => setIsAiModificationModalOpen(false)}
        originalContent={generatedDraft}
        onApplyModification={handleApplyDraftModification}
        onSaveRefinedContent={handleSaveRefinedDraft}
        modalTitle="AI 辅助修改初稿"
      />
    </div>
  );
}
