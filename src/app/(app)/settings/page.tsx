import SettingsClient from "@/components/tools/settings-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 配置 | 敬若涵的搞钱神器！',
  description: '配置 AI API 密钥及相关设置。',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
