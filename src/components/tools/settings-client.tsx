
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const LOCAL_STORAGE_API_KEY = "app_aiApiKey";
const LOCAL_STORAGE_API_ENDPOINT = "app_aiApiEndpoint";

export default function SettingsClient() {
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      const savedApiEndpoint = localStorage.getItem(LOCAL_STORAGE_API_ENDPOINT);
      if (savedApiEndpoint) {
        setApiEndpoint(savedApiEndpoint);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_API_KEY, apiKey);
      localStorage.setItem(LOCAL_STORAGE_API_ENDPOINT, apiEndpoint);
      toast({
        title: "设置已保存",
        description: "API密钥和API端点已成功保存到浏览器本地存储。",
      });
    } else {
      toast({
        title: "保存失败",
        description: "无法访问本地存储。",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI 模型配置</CardTitle>
        <CardDescription>
          管理您的 AI 大模型 API 接口和密钥。请注意：API 密钥等敏感信息存储在浏览器本地，请确保在受信任的环境中使用。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiEndpoint">AI API 端点 (URL)</Label>
          <Input
            id="apiEndpoint"
            type="url"
            placeholder="例如：https://api.example.com/v1/generate"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            您的AI服务提供商的API请求地址。
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiKey">AI API 密钥</Label>
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
        {/* TODO: FR8.1.2 Add advanced parameters (model, temperature, max tokens) here if needed */}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} className="ml-auto">
          <Save className="mr-2 h-4 w-4" /> 保存设置
        </Button>
      </CardFooter>
    </Card>
  );
}
