import SettingsClient from "@/components/tools/settings-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Configuration | 敬若涵的搞钱神器！',
  description: 'Configure AI API keys and related settings.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
