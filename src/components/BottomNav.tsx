"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Repeat, Target, Menu } from "lucide-react";

const TABS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/habits", label: "العادات", icon: Repeat },
  { href: "/goals", label: "الأهداف", icon: Target },
  { href: "/more", label: "المزيد", icon: Menu },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-elevated) 88%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <ul className="flex items-center justify-between">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="relative flex-1">
              <Link
                href={tab.href}
                className="relative flex flex-col items-center gap-1 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-2 top-0 h-full rounded-2xl"
                    style={{ backgroundColor: "var(--accent-soft)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    color={isActive ? "var(--accent)" : "var(--text-muted)"}
                  />
                </span>
                <span
                  className="relative z-10 text-[11px] font-medium"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
