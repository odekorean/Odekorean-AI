"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  GraduationCap,
  BookMarked,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/ai-teacher", label: "AI Teacher", icon: Bot },
  { href: "/topik", label: "TOPIK Center", icon: GraduationCap },
  { href: "/vocabulary", label: "Vocabulary", icon: BookMarked },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-white/60 p-4 backdrop-blur lg:flex lg:flex-col">
      <Link href="/" className="mb-8 px-2 font-display text-lg font-bold">
        Ode<span className="gradient-text">Korean</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-gradient-to-r from-aurora-blue/10 to-aurora-indigo/10 text-aurora-indigo" : "text-graphite/70 hover:bg-mist"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
