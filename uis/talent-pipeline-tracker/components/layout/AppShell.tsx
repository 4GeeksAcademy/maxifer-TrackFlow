"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  GitBranch,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  activeFor?: "pipeline" | "candidates";
};

const navItems: NavItem[] = [
  { label: "Pipeline", icon: GitBranch, activeFor: "pipeline" },
  { label: "Candidates", icon: Users, activeFor: "candidates" },
  { label: "Jobs", icon: BriefcaseBusiness },
  { label: "Interviews", icon: CalendarDays },
  { label: "Reports", icon: BarChart3 },
];

function getActiveSection(pathname: string): NavItem["activeFor"] {
  if (pathname.startsWith("/candidates/")) return "candidates";
  return "pipeline";
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d] lg:flex">
      <aside className="hidden w-62 shrink-0 border-r border-[#c6c6cd] bg-[#f6f3f5] px-3 py-5 lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <Link href="/" className="mb-6 flex items-center gap-3 px-2">
          <Image src="/trackflow-logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg" />
          <span>
            <span className="block text-lg font-bold leading-5 text-black">TrackFlow</span>
            <span className="text-xs font-semibold text-[#45464d]/70">People & Talent</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activeFor === activeSection;
            return (
              <Link
                key={item.label}
                href={item.activeFor ? "/" : "#"}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold",
                  isActive
                    ? "bg-[#2170e4] text-white shadow-sm"
                    : "text-[#45464d] hover:bg-[#eae7e9] hover:text-black",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2">
          <button className="mb-3 w-full rounded-lg bg-black px-3 py-2.5 text-sm font-bold text-white hover:opacity-90">
            New Job Requisition
          </button>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#45464d] hover:bg-[#eae7e9]" href="#">
            <CircleHelp className="h-4 w-4" />
            Help Center
          </a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#45464d] hover:bg-[#eae7e9]" href="#">
            <Settings className="h-4 w-4" />
            Settings
          </a>
        </div>
      </aside>

      <div className="min-h-screen flex-1 lg:ml-62">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#c6c6cd] bg-[#fcf8fa]/95 px-4 backdrop-blur sm:px-5">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 lg:hidden">
              <Image src="/trackflow-logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg" />
              <span className="font-bold text-black">TrackFlow</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {["Dashboard", "Talent Pipeline", "Analytics", "Settings"].map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={[
                    "flex h-14 items-center border-b-2 px-1 text-sm font-medium",
                    index === 0
                      ? "border-[#0058be] text-[#0058be]"
                      : "border-transparent text-[#1b1b1d] hover:text-[#0058be]",
                  ].join(" ")}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-[#1b1b1d] hover:bg-[#f0edef]" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-[#1b1b1d] hover:bg-[#f0edef]" aria-label="Ayuda">
              <CircleHelp className="h-4 w-4" />
            </button>
            <div className="hidden h-8 w-px bg-[#c6c6cd] sm:block" />
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c6c6cd] bg-white text-xs font-bold text-[#0058be]">
                AU
              </span>
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-bold leading-4 text-black">Admin User</span>
                <span className="text-xs text-[#45464d]">HR Manager</span>
              </span>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
