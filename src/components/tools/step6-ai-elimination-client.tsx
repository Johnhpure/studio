
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiAssistedRefinement, type AiAssistedRefinementInput } from "@/ai/flows/ai-assisted-refinement";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkle, Copy, ArrowRight, Info, FileText, ListChecks, Palette, Edit, Eye, Edit3, FilePenLine } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PromptEditModal } from "@/components/layout/prompt-edit-modal";
import { useTemporaryPrompts } from "@/contexts/TemporaryPromptsContext";
import { STEP_6_AI_REFINEMENT_PROMPT_TEMPLATE, getDefaultPromptTemplate } from "@/ai/prompt-templates";

const LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT = "app_currentDraft";
const LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS = "app_aiSuggestions"; 
const LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT = "app_userWritingStyleReport"; 
const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";
const LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA = "step2_finalOutline_metadata";

const LOCAL_STORAGE_KEY_STEP6_EXTRA_INSTRUCTIONS = "step6_extraInstructions";
const LOCAL_STORAGE_KEY_STEP6_REFINED_DRAFT = "step6_refinedDraft"; 

const PROMPT_KEY_STEP6: "step6_aiRefinement" = "step6_aiRefinement";


interface OutlineMetadata {
  manuscriptType: string;
  selectedBrand: string;
  wordCount: string | number;
}


export default function Step6AiEliminationClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { getTemporaryPrompt, setTemporaryPrompt } = useTemporaryPrompts();

  const [draftToRefine, setDraftToRefine] = useState("");
  const [aiAnalysisSuggestions, setAiAnalysisSuggestions] = useState(""); 
  const [userWritingStyleReference, setUserWritingStyleReference] = useState(""); 
  const [clientRequirementsAndOutlineReview, setClientRequirementsAndOutlineReview] = useState(""); 

  const [extraInstructions, setExtraInstructions] = useState("");
  const [isPreviewingExtraInstructions, setIsPreviewingExtraInstructions] = useState(false);
  
  const [refinedDraft, setRefinedDraft] = useState(""); 
  const [isPreviewingRefinedDraft, setIsPreviewingRefinedDraft] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [refinedDraftCharCount, setRefinedDraftCharCount] = useState(0);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDraftToRefine(localStorage.getItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT) || "");
      setAiAnalysisSuggestions(localStorage.getItem(LOCAL_STORAGE_KEY_APP_AI_SUGGESTIONS) || "未提供AI分析建议。");
      setUserWritingStyleReference(localStorage.getItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT) || "未进行风格学习或无风格报告。");
      
      const req = localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "未提供甲方需求。";
      const outline = localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE) || "未提供大纲。";
      const metadataStr = localStorage.getItem(LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA);
      let metadataText = "稿件参数：未提供。";
      if (metadataStr) {
          try {
              const parsedMeta = JSON.parse(metadataStr) as OutlineMetadata;
              metadataText = `稿件类型: ${parsedMeta.manuscriptType}, 品牌: ${parsedMeta.selectedBrand}, 字数: ${parsedMeta.wordCount}`;
          } catch (e) { console.error("Error parsing metadata for review:", e); }
      }
      setClientRequirementsAndOutlineReview(`【甲方核心需求】\n${req}\n\n【创作大纲与参数】\n${outline}\n${metadataText}`);

      setExtraInstructions(localStorage.getItem(LOCAL_STORAGE_KEY_STEP6_EXTRA_INSTRUCTIONS) || "");
      const savedRefinedDraft = localStorage.getItem(LOCAL_STORAGE_KEY_STEP6_REFINED_DRAFT);
      if (savedRefinedDraft) {
        setRefinedDraft(savedRefinedDraft);
      }
    }
  }, []);

  const saveUIDataToLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STEP6_EXTRA_INSTRUCTIONS, extraInstructions);
    }
  }, [extraInstructions]);

  useEffect(() => {
    saveUIDataToLocalStorage();
  }, [saveUIDataToLocalStorage]);

  useEffect(() => {
    setRefinedDraftCharCount(refinedDraft.length);
  }, [refinedDraft]);

  const handleRefinedDraftChange = (newDraft: string) => {
    setRefinedDraft(newDraft);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_STEP6_REFINED_DRAFT, newDraft);
      localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, newDraft); 
    }
  };


  const handleRefineDraft = async () => {
    if (!draftToRefine.trim()) {
      toast({
        title: "请输入待优化稿件",
        description: "请确保有待优化的稿件内容。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const temporaryPrompt = getTemporaryPrompt(PROMPT_KEY_STEP6);
      const input: AiAssistedRefinementInput = {
        draftText: draftToRefine,
        analysisAndSuggestions: aiAnalysisSuggestions !== "未提供AI分析建议。" ? aiAnalysisSuggestions : undefined,
        writingStyleReference: userWritingStyleReference !== "未进行风格学习或无风格报告。" ? userWritingStyleReference : undefined,
        clientRequirementsAndOutline: clientRequirementsAndOutlineReview,
        extraOptimizationInstructions: extraInstructions.trim() || undefined,
        overridePromptTemplate: temporaryPrompt,
      };
      const result = await aiAssistedRefinement(input);
      handleRefinedDraftChange(result.refinedText); 
      toast({
        title: "成功！",
        description: "稿件已完成AI特征消除与优化。",
      });
    } catch (error: any) {
      console.error("Error refining draft in Step 6:", error);
      toast({
        title: "错误",
        description: `AI特征消除失败: ${error.message || '请重试。'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (textToCopy: string, type: string) => {
    if (!textToCopy) {
      toast({ title: `无${type}内容可复制`, variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "成功！", description: `${type}已复制到剪贴板。` }))
      .catch(err => {
        console.error(`Failed to copy ${type}: `, err);
        toast({ title: "复制失败", description: `无法复制${type}，请重试。`, variant: "destructive" });
      });
  };

  const handleProceedToFinalPolishing = () => {
    const draftToPass = refinedDraft.trim() ? refinedDraft : draftToRefine;
     if (!draftToPass.trim()) { 
      toast({ title: "稿件为空", description: "请先生成或输入稿件内容。", variant: "destructive" });
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_APP_CURRENT_DRAFT, draftToPass);
    toast({ title: "准备就绪", description: "正在前往最终润色步骤..." });
    router.push('/step7-final-polishing'); 
  };
  
  const handleSaveTemporaryPrompt = (editedPrompt: string) => {
    setTemporaryPrompt(PROMPT_KEY_STEP6, editedPrompt);
    toast({ title: "提示词已临时保存", description: "本次AI生成将使用您编辑的提示词。" });
  };

  const ReviewItem = ({ title, content, icon: Icon }: { title: string; content: string; icon?: React.ElementType }) => (
    <div className="mb-2">
      <Label className="text-xs font-medium flex items-center mb-0.5">
        {Icon && <Icon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />}
        {title}
      </Label>
      <ScrollArea className="min-h-[60px] max-h-[13vh] w-full rounded-md border p-2 bg-muted/30 text-xs prose-xs dark:prose-invert max-w-none">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "无相关信息"}</ReactMarkdown>
      </ScrollArea>
    </div>
  );

  const leftPane = (
    <div className="flex flex-col space-y-3 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center"><Info className="mr-2 h-4 w-4" />优化依据回顾</CardTitle>
            <CardDescription className="text-xs">AI将依据以下信息进行优化，您也可以提供额外指令。</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsPromptModalOpen(true)}>
            <FilePenLine className="mr-2 h-4 w-4" /> 查看/编辑提示词
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1.5 px-4 pt-0 pb-2 text-xs">
          <ReviewItem title="待优化稿件原文 (来自步骤四或五)" content={draftToRefine} icon={FileText} />
          <ReviewItem title="AI特征分析与建议 (来自步骤五)" content={aiAnalysisSuggestions} icon={ListChecks} />
          <ReviewItem title="写作风格参考 (来自步骤三)" content={userWritingStyleReference} icon={Palette} />
          <ReviewItem title="甲方需求与大纲参考 (来自步骤一/二)" content={clientRequirementsAndOutlineReview} icon={FileText} />
          
          <div>
            <div className="flex justify-between items-center mb-0.5">
                <Label htmlFor="extraInstructions" className="text-xs font-medium flex items-center">
                    <Edit className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    额外优化指令 (可选, Markdown)
                </Label>
                <Button
                  variant="outline"
                  size="xs" 
                  onClick={() => setIsPreviewingExtraInstructions(!isPreviewingExtraInstructions)}
                  disabled={!extraInstructions.trim()}
                >
                  {isPreviewingExtraInstructions ? <Edit3 className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                  {isPreviewingExtraInstructions ? "编辑" : "预览"}
                </Button>
            </div>
            {isPreviewingExtraInstructions ? (
                <ScrollArea className="rounded-md border p-2 bg-muted/30 text-xs flex-1 min-h-[80px] max-h-[13vh] prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{extraInstructions || "指令预览..."}</ReactMarkdown>
                 </ScrollArea>
            ) : (
                <Textarea
                  id="extraInstructions"
                  placeholder="例如：请特别注意保持品牌调性一致..."
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  className="text-xs resize-none flex-1 w-full min-h-[80px] max-h-[13vh]"
                />
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-3 pt-2">
          <Button onClick={handleRefineDraft} disabled={isLoading || !draftToRefine.trim()} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkle className="mr-2 h-4 w-4" />}
            {isLoading ? "优化中..." : "开始AI智能消除AI特征"}
          </Button>
        </CardFooter>
      </Card>
      <PromptEditModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        defaultPromptTemplate={getDefaultPromptTemplate(PROMPT_KEY_STEP6)}
        currentEditedPromptTemplate={getTemporaryPrompt(PROMPT_KEY_STEP6)}
        onSave={handleSaveTemporaryPrompt}
        stepTitle="步骤六：AI智能消除AI特征"
      />
    </div>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
            <CardTitle>优化后稿件</CardTitle>
            <CardDescription>经AI特征消除和优化后的稿件。可切换编辑/预览模式。</CardDescription>
            <p className="text-xs text-muted-foreground mt-1">字数统计: {refinedDraftCharCount} 字</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewingRefinedDraft(!isPreviewingRefinedDraft)}
              disabled={!refinedDraft.trim()}
            >
              {isPreviewingRefinedDraft ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {isPreviewingRefinedDraft ? "编辑" : "预览"}
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(refinedDraft, "优化后稿件")} disabled={!refinedDraft.trim() || isLoading} title="复制优化稿Markdown">
                <Copy className="h-4 w-4" />
                <span className="sr-only">复制优化后稿件</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
         {isLoading && !refinedDraft ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) :isPreviewingRefinedDraft ? (
            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/30 min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {refinedDraft || "优化稿预览将在此处显示..."}
              </ReactMarkdown>
            </ScrollArea>
        ) : (
            <Textarea
              id="refinedDraftOutput"
              placeholder="AI优化后的稿件将显示在此处..."
              value={refinedDraft}
              onChange={(e) => handleRefinedDraftChange(e.target.value)} 
              className="flex-1 resize-none text-sm min-h-[300px] bg-muted/30"
            />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleProceedToFinalPolishing} className="w-full" disabled={isLoading || (!refinedDraft.trim() && !draftToRefine.trim())}>
          <ArrowRight className="mr-2 h-4 w-4" />
          完成AI优化，进入最终润色
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
