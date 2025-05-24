
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
import { Loader2, ArrowRight, Wand2, FileText, ListChecks } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateOutline, type GenerateOutlineInput } from "@/ai/flows/outline-generation-flow";

const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";
const LOCAL_STORAGE_KEY_USER_INSTRUCTIONS = "step2_userInstructions";
const LOCAL_STORAGE_KEY_MANUSCRIPT_TYPE = "step2_manuscriptType";
const LOCAL_STORAGE_KEY_SELECTED_BRAND = "step2_selectedBrand";
const LOCAL_STORAGE_KEY_WORD_COUNT_OPTION = "step2_wordCountOption";
const LOCAL_STORAGE_KEY_CUSTOM_WORD_COUNT = "step2_customWordCount";
const LOCAL_STORAGE_KEY_EDITED_OUTLINE = "step2_editedOutline";
const LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA = "step2_finalOutline_metadata";


const MANUSCRIPT_TYPES = ["预热品牌稿", "品牌稿", "产品稿", "行业稿", "预热稿", "新闻通稿", "活动稿"] as const;
const BRANDS = ["添可", "创维", "酷开", "美的", "美芝威灵", "京东方"] as const;
const WORD_COUNT_OPTIONS = ["1500字", "2000字", "自定义"] as const;

export default function Step2OutlineGeneratorClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [clientRequirements, setClientRequirements] = useState("");
  const [userInstructions, setUserInstructions] = useState("");
  const [manuscriptType, setManuscriptType] = useState<string>(MANUSCRIPT_TYPES[5]); // Default: 新闻通稿
  const [selectedBrand, setSelectedBrand] = useState<string>(BRANDS[0]); // Default: 添可
  const [wordCountOption, setWordCountOption] = useState<string>(WORD_COUNT_OPTIONS[0]); // Default: 1500字
  const [customWordCount, setCustomWordCount] = useState<string>("");

  const [generatedOutline, setGeneratedOutline] = useState("");
  const [editedOutline, setEditedOutline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientRequirements(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS) || "");
      setUserInstructions(localStorage.getItem(LOCAL_STORAGE_KEY_USER_INSTRUCTIONS) || "");
      setManuscriptType(localStorage.getItem(LOCAL_STORAGE_KEY_MANUSCRIPT_TYPE) || MANUSCRIPT_TYPES[5]);
      setSelectedBrand(localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_BRAND) || BRANDS[0]);
      setWordCountOption(localStorage.getItem(LOCAL_STORAGE_KEY_WORD_COUNT_OPTION) || WORD_COUNT_OPTIONS[0]);
      setCustomWordCount(localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_WORD_COUNT) || "");
      setEditedOutline(localStorage.getItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE) || "");
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
    if (wordCountOption === "自定义" && isNaN(parseInt(customWordCount))) {
      toast({ title: "自定义文章字数必须是数字", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedOutline(""); // Clear previous outline
    // setEditedOutline(""); // Also clear edited outline if re-generating
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
      setEditedOutline(result.generatedOutline); // Populate editor with new outline
      toast({ title: "成功", description: "稿件大纲已生成！您可以进行编辑。" });
    } catch (error) {
      console.error("Error generating outline:", error);
      toast({ title: "错误", description: "生成大纲失败，请重试。", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOutline = () => {
    if (!editedOutline.trim()) {
      toast({ title: "大纲内容为空", description: "请确保大纲不为空再进入下一步。", variant: "destructive" });
      return;
    }
    // Save final outline and metadata
    localStorage.setItem(LOCAL_STORAGE_KEY_EDITED_OUTLINE, editedOutline); // Already saved by useEffect, but explicit save is fine.
    const metadata = {
        manuscriptType,
        selectedBrand,
        wordCount: wordCountOption === "自定义" ? customWordCount : wordCountOption,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_FINAL_OUTLINE_METADATA, JSON.stringify(metadata));

    toast({ title: "大纲已确认", description: "正在前往下一步：AI学习您的写作风格。" });
    router.push('/step3-style-learning'); // Navigate to Step 3 (to be created)
  };

  const leftPane = (
    <div className="flex flex-col space-y-4 h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />甲方核心需求回顾</CardTitle>
          <CardDescription>步骤一输入的核心需求将作为大纲生成的重要依据。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[150px] md:h-[200px] w-full rounded-md border p-3 bg-muted/50 text-sm">
            {clientRequirements || "未找到甲方核心需求，请返回步骤一输入。"}
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex-grow-[2] flex flex-col">
        <CardHeader>
          <CardTitle>您的创作指令与参数</CardTitle>
          <CardDescription>请提供详细的创作指令，并选择相关参数，以指导AI生成符合要求的大纲。</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div className="grid gap-1.5 flex-1">
            <Label htmlFor="userInstructions">创作要求与指令</Label>
            <Textarea
              id="userInstructions"
              placeholder="输入您对稿件大纲结构、各部分侧重点等详细的创作要求和指令..."
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              className="min-h-[100px] resize-none text-sm flex-1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
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
                placeholder="输入期望字数"
                value={customWordCount}
                onChange={(e) => setCustomWordCount(e.target.value)}
                className="mt-2 w-full md:w-1/2"
              />
            )}
          </div>
        </CardContent>
        <CardFooter>
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
      <CardHeader>
        <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5" />AI生成的稿件大纲</CardTitle>
        <CardDescription>AI根据您的需求和指令生成的大纲初稿。您可以在下方文本框中进行编辑和修改。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Label htmlFor="editedOutline" className="mb-1.5">大纲编辑区 (Markdown)</Label>
        <Textarea
          id="editedOutline"
          placeholder="AI生成的大纲将显示在此处，您可以直接编辑..."
          value={editedOutline}
          onChange={(e) => setEditedOutline(e.target.value)}
          className="flex-1 resize-none text-sm min-h-[300px] bg-muted/30"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleConfirmOutline} className="w-full" disabled={!editedOutline.trim() || isLoading}>
          <ArrowRight className="mr-2 h-4 w-4" />
          确认大纲并进入下一步
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-8rem)] p-1 md:p-0"> {/* Adjusted height slightly */}
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
