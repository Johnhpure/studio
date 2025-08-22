
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { validateApiKey } from "@/lib/ai-client";

const LOCAL_STORAGE_API_KEY = "app_aiApiKey";
const LOCAL_STORAGE_API_ENDPOINT = "app_aiApiEndpoint";

export default function SettingsClient() {
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);
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

  // 验证 API key 的函数
  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "验证失败",
        description: "请先输入 API 密钥",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setIsValidKey(null);

    try {
      const result = await validateApiKey(apiKey.trim());
      setIsValidKey(result.success);
      
      toast({
        title: result.success ? "验证成功" : "验证失败",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      setIsValidKey(false);
      toast({
        title: "验证错误",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

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
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="输入您的 Google Gemini API 密钥"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValidKey(null); // 重置验证状态
              }}
              className={isValidKey === true ? "border-green-500" : isValidKey === false ? "border-red-500" : ""}
            />
            <Button 
              onClick={handleValidateApiKey}
              disabled={isValidating || !apiKey.trim()}
              variant="outline"
              size="sm"
              className="min-w-[80px]"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isValidKey === true ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : isValidKey === false ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                "验证"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            请输入您的 Google Gemini API 密钥。获取地址：
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline ml-1"
            >
              Google AI Studio
            </a>
          </p>
          {isValidKey === true && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              API 密钥验证成功
            </p>
          )}
          {isValidKey === false && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              API 密钥验证失败，请检查密钥是否正确
            </p>
          )}
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
