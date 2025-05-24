"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

const pageTitles: { [key: string]: string } = {
  "/distiller": "源文本提取器",
  "/draft-generator": "AI 草稿生成",
  "/signature-analyzer": "AI 写作特征分析器",
  "/refinement": "AI 辅助优化",
  "/settings": "AI 配置",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "敬若涵的搞钱神器！";

  // Retrieve sidebar state from cookie
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
