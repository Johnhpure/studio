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
import { ExternalLink, Settings, Bot, Filter, FileText, SearchCheck, Sparkles, BrainCircuit } from "lucide-react";

const navItems = [
  { href: "/distiller", label: "源文本提取器", icon: Filter },
  { href: "/draft-generator", label: "草稿生成", icon: FileText },
  { href: "/signature-analyzer", label: "特征分析器", icon: SearchCheck },
  { href: "/refinement", label: "AI 优化", icon: Sparkles },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            搞钱神器
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
                isActive={pathname === item.href}
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
                    tooltip={{ children: "设置", side: "right", align: "center" }}
                >
                    <Link href="/settings">
                        <Settings />
                        <span>设置</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
