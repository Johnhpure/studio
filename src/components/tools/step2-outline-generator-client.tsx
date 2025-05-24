
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Wand2, FileText, ListChecks, Copy, Eye, Edit3, SkipForward } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateOutline, type GenerateOutlineInput } from "@/ai/flows/outline-generation-flow";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_USER_INSTRUCTIONS = "step2_userInstructions";
const LOCAL_STORAGE_KEY_MANUSCRIPT_TYPE = "step2_manuscriptType";
const LOCAL_STORAGE_KEY_SELECTED_BRAND = "step2_selectedBrand";
const LOCAL_STORAGE_KEY_WORD_COUNT_OPTION = "step2_wordCountOption";
const LOCAL_STORAGE_KEY_CUSTOM_WORD_COUNT = "step2_customWordCount";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";
const LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA = "step2_finalOutline_metadata";
const LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT = "app_userWritingStyleReport";


const MANUSCRIPT_TYPES = ["预热品牌稿", "品牌稿", "产品稿", "行业稿", "预热稿", "新闻通稿", "活动稿"] as const;
const BRANDS = ["添可", "创维", "酷开", "美的", "美芝威灵", "京东方"] as const;
const WORD_COUNT_OPTIONS = ["1500字", "2000字", "自定义"] as const;

export default function Step2OutlineGeneratorClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [clientRequirements, setClientRequirements] = useState("");
  const [userInstructions, setUserInstructions] = useState("");
  const [isPreviewingUserInstructions, setIsPreviewingUserInstructions] = useState(false);
  const [manuscriptType, setManuscriptType] = useState<string>(MANUSCRIPT_TYPES[5]); 
  const [selectedBrand, setSelectedBrand] = useState<string>(BRANDS[0]); 
  const [wordCountOption, setWordCountOption] = useState<string>(WORD_COUNT_OPTIONS[0]); 
  const [customWordCount, setCustomWordCount] = useState<string>("");

  const [generatedOutline, setGeneratedOutline] = useState("");
  const [editedOutline, setEditedOutline] = useState("");
  const [isPreviewingEditedOutline, setIsPreviewingEditedOutline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientRequirements(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "");
      setUserInstructions(localStorage.getItem(LOCAL_STORAGE_KEY_USER_INSTRUCTIONS) || "");
      setManuscriptType(localStorage.getItem(LOCAL_STORAGE_KEY_MANUSCRIPT_TYPE) || MANUSCRIPT_TYPES[5]);
      setSelectedBrand(localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_BRAND) || BRANDS[0]);
      setWordCountOption(localStorage.getItem(LOCAL_STORAGE_KEY_WORD_COUNT_OPTION) || WORD_COUNT_OPTIONS[0]);
      setCustomWordCount(localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_WORD_COUNT) || "");
      const initialEditedOutline = localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE);
      if (initialEditedOutline) {
        setEditedOutline(initialEditedOutline);
        setGeneratedOutline(initialEditedOutline); 
      }
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_INSTRUCTIONS, userInstructions);
      localStorage.setItem(LOCAL_STORAGE_KEY_MANUSCRIPT_TYPE, manuscriptType);
      localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_BRAND, selectedBrand);
      localStorage.setItem(LOCAL_STORAGE_KEY_WORD_COUNT_OPTION, wordCountOption);
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_WORD_COUNT, customWordCount);
      localStorage.setItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE, editedOutline);
    }
  }, [userInstructions, manuscriptType, selectedBrand, wordCountOption, customWordCount, editedOutline]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  const handleGenerateOutline = async () => {
    if (!clientRequirements.trim()) {
      toast({ title: "错误", description: "未找到甲方核心需求，请先完成步骤一。", variant: "destructive" });
      return;
    }
    if (!userInstructions.trim()) {
      toast({ title: "请输入您的创作指令", variant: "destructive" });
      return;
    }
    if (wordCountOption === "自定义" && !customWordCount.trim()) {
      toast({ title: "请输入自定义文章字数", variant: "destructive" });
      return;
    }
    if (wordCountOption === "自定义" && (isNaN(parseInt(customWordCount)) || parseInt(customWordCount) <=0)) {
      toast({ title: "自定义文章字数必须是正整数", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedOutline(""); 
    setEditedOutline("");
    try {
      const wordCountValue = wordCountOption === "自定义" ? parseInt(customWordCount) : wordCountOption;
      const input: GenerateOutlineInput = {
        clientRequirements,
        userInstructions,
        manuscriptType: manuscriptType as typeof MANUSCRIPT_TYPES[number],
        brand: selectedBrand as typeof BRANDS[number],
        wordCount: wordCountValue,
      };
      const result = await generateOutline(input);
      setGeneratedOutline(result.generatedOutline);
      setEditedOutline(result.generatedOutline); 
      toast({ title: "成功", description: "稿件大纲已生成！您可以进行编辑。" });
    } catch (error) {
      console.error("Error generating outline:", error);
      toast({ title: "错误", description: "生成大纲失败，请重试。", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const prepareForNextStep = () => {
    if (!editedOutline.trim()) {
      toast({ title: "大纲内容为空", description: "请确保大纲不为空再进入下一步。", variant: "destructive" });
      return false;
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE, editedOutline);
    const metadata = {
        manuscriptType,
        selectedBrand,
        wordCount: wordCountOption === "自定义" ? customWordCount : wordCountOption,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA, JSON.stringify(metadata));
    return true;
  };

  const handleConfirmOutline = () => {
    if (!prepareForNextStep()) return;
    toast({ title: "大纲已确认", description: "正在前往风格学习步骤。" });
    router.push('/step3-style-learning'); 
  };

  const handleSkipToStep4 = () => {
    if (!prepareForNextStep()) return;
    // Clear any existing style report as we are skipping Step 3
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY_APP_USER_STYLE_REPORT);
    }
    toast({ title: "大纲已确认，跳过风格学习", description: "正在前往初稿创作步骤。" });
    router.push('/step4-draft-creation');
  };

  const handleCopyOutline = () => {
    if (!editedOutline.trim()) {
      toast({ title: "无内容可复制", description: "大纲编辑区为空。", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(editedOutline)
      .then(() => {
        toast({ title: "复制成功", description: "大纲内容已复制到剪贴板。" });
      })
      .catch(err => {
        console.error("Failed to copy outline: ", err);
        toast({ title: "复制失败", description: "无法复制大纲内容。", variant: "destructive" });
      });
  };

  const leftPane = (
    <div className="flex flex-col space-y-4 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />甲方核心需求回顾</CardTitle>
          <CardDescription>步骤一输入的核心需求将作为大纲生成的重要依据。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full max-h-[20vh] w-full rounded-md border p-3 bg-muted/50 text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{clientRequirements || "未找到甲方核心需求，请返回步骤一输入。"}</ReactMarkdown>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex-grow-[2] flex flex-col">
        <CardHeader>
          <CardTitle>您的创作指令与参数</CardTitle>
          <CardDescription>请提供详细的创作指令，并选择相关参数，以指导AI生成符合要求的大纲。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[calc(60vh-4rem)]">
          <div className="grid gap-1.5 flex-shrink-0">
            <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="userInstructions">创作要求与指令 (Markdown)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewingUserInstructions(!isPreviewingUserInstructions)}
                >
                  {isPreviewingUserInstructions ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {isPreviewingUserInstructions ? "编辑" : "预览"}
                </Button>
            </div>
            {isPreviewingUserInstructions ? (
                 <ScrollArea className="rounded-md border p-3 bg-muted/30 text-sm flex-1 min-h-[120px] prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{userInstructions || "指令预览..."}</ReactMarkdown>
                 </ScrollArea>
            ) : (
                <Textarea
                  id="userInstructions"
                  placeholder="输入您对稿件大纲结构、各部分侧重点等详细的创作要求和指令 (Markdown)..."
                  value={userInstructions}
                  onChange={(e) => setUserInstructions(e.target.value)}
                  className="text-sm resize-none flex-1 min-h-[120px]"
                />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
            <div>
              <Label htmlFor="manuscriptType">稿件类型</Label>
              <Select value={manuscriptType} onValueChange={setManuscriptType}>
                <SelectTrigger id="manuscriptType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MANUSCRIPT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="selectedBrand">品牌选择</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="selectedBrand"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BRANDS.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Label>文章字数</Label>
            <RadioGroup value={wordCountOption} onValueChange={setWordCountOption} className="flex items-center space-x-4 mt-2">
              {WORD_COUNT_OPTIONS.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`wc-${option}`} />
                  <Label htmlFor={`wc-${option}`} className="font-normal">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {wordCountOption === "自定义" && (
              <Input
                type="number"
                placeholder="输入期望字数 (正整数)"
                value={customWordCount}
                onChange={(e) => setCustomWordCount(e.target.value)}
                className="mt-2 w-full md:w-1/2"
                min="1"
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-shrink-0 mt-auto pt-4">
          <Button onClick={handleGenerateOutline} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isLoading ? "生成中..." : "AI生成稿件大纲"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const rightPane = (
     <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5" />AI生成的稿件大纲</CardTitle>
            <CardDescription>AI根据您的需求和指令生成的大纲初稿。您可以切换编辑/预览模式，或直接复制Markdown。</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewingEditedOutline(!isPreviewingEditedOutline)}
            >
              {isPreviewingEditedOutline ? <Edit3 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {isPreviewingEditedOutline ? "编辑" : "预览"}
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyOutline} disabled={!editedOutline.trim() || isLoading} title="复制大纲Markdown">
                <Copy className="h-4 w-4" />
                <span className="sr-only">复制大纲</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isPreviewingEditedOutline ? (
             <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/30 min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {editedOutline || "大纲预览将在此处显示..."}
              </ReactMarkdown>
            </ScrollArea>
        ) : (
            <Textarea
              id="editedOutline"
              placeholder="AI生成的大纲将显示在此处，您可以直接编辑..."
              value={editedOutline}
              onChange={(e) => setEditedOutline(e.target.value)}
              className="flex-1 resize-none text-sm min-h-[300px] bg-muted/30" 
            />
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button onClick={handleConfirmOutline} className="w-full sm:w-auto flex-1" disabled={!editedOutline.trim() || isLoading}>
          <ArrowRight className="mr-2 h-4 w-4" />
          确认大纲并学习风格 (下一步)
        </Button>
        <Button onClick={handleSkipToStep4} variant="outline" className="w-full sm:w-auto flex-1" disabled={!editedOutline.trim() || isLoading}>
          <SkipForward className="mr-2 h-4 w-4" />
          跳过风格学习，直接创作初稿
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

    