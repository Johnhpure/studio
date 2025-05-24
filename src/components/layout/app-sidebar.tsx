
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
import { AppLogo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Settings, FileText, SearchCheck, Sparkles, BrainCircuit, ClipboardList, DraftingCompass, BotMessageSquare, CheckCircle } from "lucide-react"; // Added ClipboardList, DraftingCompass

const navItems = [
  { href: "/step1-requirements", label: "步骤一：需求捕获", icon: ClipboardList }, // Changed
  { href: "/draft-generator", label: "草稿生成", icon: FileText }, // Placeholder for Step 4
  { href: "/signature-analyzer", label: "特征分析器", icon: SearchCheck }, // Placeholder for Step 5
  { href: "/refinement", label: "AI 优化", icon: Sparkles }, // Placeholder for Step 6
];

// Future steps placeholder icons and labels, can be integrated as implemented
// { href: "/step2-outline-generator", label: "步骤二：大纲构建", icon: DraftingCompass },
// { href: "/step3-style-learning", label: "步骤三：风格学习", icon: BrainCircuit }, // Re-using BrainCircuit or another
// { href: "/step4-draft-creation", label: "步骤四：AI初稿", icon: FileText },
// { href: "/step5-ai-signature", label: "步骤五：AI特征洞察", icon: SearchCheck },
// { href: "/step6-ai-refinement", label: "步骤六：AI痕迹消除", icon: Sparkles },
// { href: "/step7-final-edit", label: "步骤七：人工定稿", icon: CheckCircle },


export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <BotMessageSquare className="h-7 w-7 text-primary" /> {/* Changed icon to BotMessageSquare */}
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
                isActive={pathname === item.href || (item.href === "/step1-requirements" && pathname === "/distiller")} // Handle old route during transition
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
                    tooltip={{ children: "AI模型配置", side: "right", align: "center" }} // Updated label
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
