
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
import { Settings, FileText, Sparkles, ClipboardList, DraftingCompass, BotMessageSquare, Microscope, FileCheck, BrainCircuit, PenSquare } from "lucide-react";

const navItems = [
  { href: "/step1-requirements", label: "步骤一：需求捕获", icon: ClipboardList },
  { href: "/step2-outline-generator", label: "步骤二：大纲构建", icon: DraftingCompass },
  { href: "/step3-style-learning", label: "步骤三：风格学习", icon: BrainCircuit },
  { href: "/step4-draft-creation", label: "步骤四：AI初稿创作", icon: PenSquare },
  { href: "/step5-ai-analysis", label: "步骤五：特征分析", icon: Microscope },
  { href: "/step6-ai-elimination", label: "步骤六：AI消除", icon: Sparkles },
  { href: "/step7-final-polishing", label: "步骤七：人工定稿", icon: FileCheck },
];

const progressLabels = [
  "磨刀霍霍向甲方！",             // 0%
  "需求分析中... 目标锁定25大洋！",   // After Step 1
  "大纲布局已成... 50大洋在望！",   // After Step 2
  "AI正在偷师学艺... 风格拿捏80大洋！",   // After Step 3
  "AI爆肝输出中... 120大洋初见雏形！",  // After Step 4
  "AI火眼金睛找bug... 净化稿件冲150！",  // After Step 5
  "AI注入灵魂... 180大洋闪闪发光！",   // After Step 6
  "收工！¥200入袋为安，敬若涵YYDS！",      // After Step 7 (100%)
];

// Animated Coin Character SVG
const AnimatedCoinCharacter = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    className="animate-bobble text-yellow-400 dark:text-yellow-500 mb-1"
    aria-hidden="true" // Decorative element
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <ellipse cx="10" cy="8" rx="2.5" ry="1.5" fill="white" fillOpacity="0.7" transform="rotate(-20 10 8)" /> {/* Shine */}
    <circle cx="9" cy="11" r="1.2" fill="black" /> {/* Left eye */}
    <circle cx="15" cy="11" r="1.2" fill="black" /> {/* Right eye */}
    <path
      d="M9.5 15.5 C10.5 16.5, 13.5 16.5, 14.5 15.5"
      stroke="black"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    /> {/* Smile */}
  </svg>
);


export function AppSidebar() {
  const pathname = usePathname();

  let currentStepIndex = -1;
  navItems.forEach((item, index) => {
    if (pathname === item.href ||
        (item.href === "/step1-requirements" && pathname === "/distiller") ||
        (item.href === "/step4-draft-creation" && pathname === "/draft-generator") ||
        (item.href === "/step5-ai-analysis" && pathname === "/signature-analyzer") ||
        (item.href === "/step6-ai-elimination" && pathname === "/refinement")
       ) {
      currentStepIndex = index;
    }
  });

  let progressPercent = 0;
  let displayedLabel = progressLabels[0]; // Default

  if (currentStepIndex !== -1) {
    progressPercent = ((currentStepIndex + 1) / navItems.length) * 100;
    displayedLabel = progressLabels[currentStepIndex + 1];
  } else if (pathname === "/settings") {
    progressPercent = 0; // Settings page is 0%
    displayedLabel = progressLabels[0];
  }


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
      <SidebarContent className="p-2 flex flex-col"> {/* Added flex flex-col */}
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href ||
                           (item.href === "/step1-requirements" && pathname === "/distiller") ||
                           (item.href === "/step4-draft-creation" && pathname === "/draft-generator") ||
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

        {/* Progress Section */}
        <div className="mt-auto pt-6 group-data-[collapsible=icon]:hidden">
          <div className="flex flex-col items-center px-2 py-3 space-y-2">
            <AnimatedCoinCharacter /> {/* Added animated character */}
            <p
              className="text-xs font-medium text-center text-sidebar-accent-foreground/90 h-8 flex items-center justify-center"
              title={`当前搞钱进度: ${Math.round(progressPercent)}%`}
            >
              {displayedLabel}
            </p>
            <div
              className="relative h-40 w-4 bg-sidebar-foreground/10 rounded-full overflow-hidden" 
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="搞钱进度"
            >
              <div
                className="absolute bottom-0 left-0 w-full bg-sidebar-accent rounded-full transition-[height] duration-700 ease-in-out"
                style={{ height: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
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
