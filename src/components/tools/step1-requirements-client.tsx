
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

const LOCAL_STORAGE_KEY_CLIENT_REQUIREMENTS = "step1_clientRequirements";

export default function Step1RequirementsClient() {
  const [clientRequirements, setClientRequirements] = useState("");
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
    router.push('/step2-outline-generator'); // Navigate to step 2 (page to be created)
  };

  return (
    <Card className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
      <CardHeader>
        <CardTitle>步骤一：输入甲方核心需求</CardTitle>
        <CardDescription>请在此处粘贴甲方对稿件的核心需求文本内容。这些信息将作为后续AI智能辅助的基础。</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="在此处粘贴甲方需求..."
          value={clientRequirements}
          onChange={(e) => setClientRequirements(e.target.value)}
          className="flex-1 resize-none text-sm min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
        />
        <Button onClick={handleNextStep} className="mt-4 w-full">
          <ArrowRight className="mr-2 h-4 w-4" />
          下一步：生成创作大纲
        </Button>
      </CardContent>
    </Card>
  );
}
