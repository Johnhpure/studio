
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

const pageTitles: { [key: string]: string } = {
  "/step1-requirements": "步骤一：输入甲方核心需求", // Changed
  "/distiller": "步骤一：输入甲方核心需求", // Fallback for old route
  "/draft-generator": "AI 草稿生成", // Placeholder, will be Step 4
  "/signature-analyzer": "AI 写作特征分析器", // Placeholder, will be Step 5
  "/refinement": "AI 辅助优化", // Placeholder, will be Step 6
  "/settings": "AI模型配置", // Updated title
  // Future steps, to be added as implemented
  // "/step2-outline-generator": "步骤二：稿件大纲生成",
  // "/step3-style-learning": "步骤三：个性化风格学习",
  // "/step4-draft-creation": "步骤四：AI智能初稿创作",
  // "/step5-ai-signature": "步骤五：AI特征深度洞察",
  // "/step6-ai-refinement": "步骤六：智能化AI痕迹消除",
  // "/step7-final-edit": "步骤七：专业人工最终定稿",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "敬若涵的搞钱助手";

  const [defaultOpen, setDefaultOpen] = React.useState(true);
  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    if (cookieValue) {
      setDefaultOpen(cookieValue === 'true');
    }
  }, []);


  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
