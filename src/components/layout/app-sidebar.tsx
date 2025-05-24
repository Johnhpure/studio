
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Settings, FileText, Sparkles, ClipboardList, DraftingCompass, BotMessageSquare, Microscope, FileCheck } from "lucide-react"; // Added FileCheck

const navItems = [
  { href: "/step1-requirements", label: "步骤一：需求捕获", icon: ClipboardList },
  { href: "/step2-outline-generator", label: "步骤二：大纲构建", icon: DraftingCompass },
  // { href: "/step3-style-learning", label: "步骤三：风格学习", icon: BrainCircuit }, // To be implemented
  { href: "/draft-generator", label: "草稿生成 (旧)", icon: FileText }, 
  { href: "/step5-ai-analysis", label: "步骤五：特征分析", icon: Microscope },
  { href: "/step6-ai-elimination", label: "步骤六：AI消除", icon: Sparkles },
  { href: "/step7-final-polishing", label: "步骤七：人工定稿", icon: FileCheck }, // Added Step 7
];


export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <BotMessageSquare className="h-7 w-7 text-primary" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            搞钱助手
          </span>
        </Link>
        <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">敬若涵的创作助手</p>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || 
                           (item.href === "/step1-requirements" && pathname === "/distiller") ||
                           (item.href === "/step5-ai-analysis" && pathname === "/signature-analyzer") || 
                           (item.href === "/step6-ai-elimination" && pathname === "/refinement") 
                          }
                tooltip={{ children: item.label, side: "right", align: "center" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <Separator className="my-2"/>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === "/settings"}
                    tooltip={{ children: "AI模型配置", side: "right", align: "center" }}
                >
                    <Link href="/settings">
                        <Settings />
                        <span>AI模型配置</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
