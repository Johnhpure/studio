
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

const pageTitles: { [key: string]: string } = {
  "/step1-requirements": "步骤一：输入甲方核心需求",
  "/step2-outline-generator": "步骤二：AI生成稿件创作大纲",
  "/step3-style-learning": "步骤三：AI学习您的写作风格",
  "/step4-draft-creation": "步骤四：AI智能创作初稿", // Added Step 4 title
  "/step5-ai-analysis": "步骤五：AI特征检测与分析",
  "/step6-ai-elimination": "步骤六：AI智能消除AI特征",
  "/step7-final-polishing": "步骤七：最终人工审核与润色",
  "/settings": "AI模型配置",
  "/distiller": "步骤一：输入甲方核心需求", 
  "/draft-generator": "步骤四：AI智能创作初稿", // Updated old route to point to new step 4
  "/signature-analyzer": "步骤五：AI特征检测与分析", 
  "/refinement": "步骤六：AI智能消除AI特征", 
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "敬若涵的搞钱助手";

  const [defaultOpen, setDefaultOpen] = React.useState(true);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sidebar_state='))
        ?.split('=')[1];
      if (cookieValue) {
        setDefaultOpen(cookieValue === 'true');
      }
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

    