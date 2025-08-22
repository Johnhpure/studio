
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Save, CheckCircle, XCircle, Loader2, Settings, Zap, Brain } from "lucide-react";
import { validateApiKey, GEMINI_MODELS, getStoredAIConfig, saveAIConfig, type GeminiModelId } from "@/lib/ai-client";

export default function SettingsClient() {
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>("gemini-2.5-flash");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const config = getStoredAIConfig();
      if (config.apiKey) setApiKey(config.apiKey);
      if (config.apiEndpoint) setApiEndpoint(config.apiEndpoint);
      if (config.model) setSelectedModel(config.model);
      if (config.temperature !== undefined) setTemperature([config.temperature]);
      if (config.maxTokens !== undefined) setMaxTokens([config.maxTokens]);
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
      const config = {
        apiKey,
        apiEndpoint,
        model: selectedModel,
        temperature: temperature[0],
        maxTokens: maxTokens[0],
      };
      
      saveAIConfig(config);
      
      toast({
        title: "设置已保存",
        description: "AI模型配置已成功保存到浏览器本地存储。",
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
        
        {/* 模型选择 */}
        <div className="space-y-2">
          <Label htmlFor="model">
            <Brain className="inline h-4 w-4 mr-1" />
            AI 模型
          </Label>
          <Select value={selectedModel} onValueChange={(value: GeminiModelId) => setSelectedModel(value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择 Gemini 模型" />
            </SelectTrigger>
            <SelectContent>
              {GEMINI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            选择要使用的 Gemini 模型。不同模型在性能、速度和成本方面有所差异。
          </p>
        </div>

        {/* 温度设置 */}
        <div className="space-y-3">
          <Label htmlFor="temperature">
            <Zap className="inline h-4 w-4 mr-1" />
            创造性 (Temperature): {temperature[0]}
          </Label>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>保守 (0.0)</span>
            <span>平衡 (1.0)</span>
            <span>创新 (2.0)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            控制AI回答的创造性。较低值产生更一致的回答，较高值产生更多样化的回答。
          </p>
        </div>

        {/* 最大令牌数设置 */}
        <div className="space-y-3">
          <Label htmlFor="maxTokens">
            <Settings className="inline h-4 w-4 mr-1" />
            最大输出长度: {maxTokens[0]} tokens
          </Label>
          <Slider
            value={maxTokens}
            onValueChange={setMaxTokens}
            max={8192}
            min={256}
            step={256}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>短 (256)</span>
            <span>中 (2048)</span>
            <span>长 (8192)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            控制AI回答的最大长度。更高的值允许更长的回答，但会消耗更多配额。
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} className="ml-auto">
          <Save className="mr-2 h-4 w-4" /> 保存设置
        </Button>
      </CardFooter>
    </Card>
  );
}
