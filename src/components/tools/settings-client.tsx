"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function SettingsClient() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real application, you would securely save these settings.
    // For this example, we'll just show a toast.
    console.log("Attempting to save API Key:", apiKey ? "********" : "empty");
    toast({
      title: "设置操作",
      description: "API密钥保存功能仅为占位符。请在生产环境中实现安全存储。",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI 配置</CardTitle>
        <CardDescription>管理您的 AI 模型 API 密钥及其他相关设置。
        <br />
        <strong className="text-destructive-foreground bg-destructive p-1 rounded-sm">注意：此演示中的 API 密钥存储未安全实现。请勿使用真实密钥。</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey">AI 提供商 API 密钥</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="输入您的 API 密钥"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            您的 API 密钥用于验证对 AI 模型的请求。
          </p>
        </div>
        {/* Add more settings fields as needed */}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} className="ml-auto">
          <Save className="mr-2 h-4 w-4" /> 保存设置
        </Button>
      </CardFooter>
    </Card>
  );
}
