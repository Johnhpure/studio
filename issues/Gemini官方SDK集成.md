# Gemini官方SDK集成任务

## 任务概述
将项目从Genkit框架迁移到Google官方Gemini SDK (@google/genai)，实现更直接的API调用方式。

## 执行计划
1. ✅ 安装Google官方Gemini SDK (@google/genai)
2. ✅ 重构ai-client.ts使用官方SDK
3. ✅ 重构ai-server.ts使用官方SDK  
4. ✅ 更新API路由以使用新的SDK
5. ✅ 增强设置页面的模型配置选项
6. ✅ 更新AI flows以使用官方SDK
7. 🔄 测试新集成是否正常工作

## 主要改进
- 使用Google官方`@google/genai` SDK替代Genkit
- 增加了丰富的模型配置选项（模型选择、温度、最大tokens）
- 优化了API key验证逻辑
- 改进了错误处理机制
- 提供了更直接的API调用方式

## 新增功能
- 支持多种Gemini模型选择（gemini-2.0-flash-exp, gemini-2.5-pro等）
- 可调节温度参数（0.0-2.0）
- 可配置最大输出长度（256-8192 tokens）
- 增强的设置页面UI

## 技术实现
- 客户端：`src/lib/ai-client.ts` - 配置管理和API调用
- 服务端：`src/lib/ai-server.ts` - SDK封装和内容生成
- API路由：`/api/ai/generate`, `/api/ai/validate`, `/api/ai/flows`
- 流处理：`src/ai/gemini-flows.ts` - 各种AI处理流程

## 状态
正在测试集成功能...
