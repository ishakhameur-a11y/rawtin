"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Dumbbell,
  Brain,
  CalendarDays,
  CalendarRange,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Habit, HabitSection, SECTION_META, todayKey } from "@/lib/habits";
import { Goal, GoalPeriod, PERIOD_META, goalProgress } from "@/lib/goals";

const SECTION_ICONS: Record<HabitSection, typeof Sparkles> = {
  deeni: Sparkles,
  badani: Dumbbell,
  aqli: Brain,
};
const SECTION_ORDER: HabitSection[] = ["deeni", "badani", "aqli"];

const PERIOD_ICONS: Record<GoalPeriod, typeof CalendarDays> = {
  weekly: CalendarDays,
  monthly: CalendarRange,
  yearly: Calendar,
};
const PERIOD_ORDER: GoalPeriod[] = ["weekly", "monthly", "yearly"];

const RING_SIZE = 84;
const STROKE = 8;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomePage() {
  const [habits, , habitsLoaded] = useLocalStorage<Habit[]>("rawtin-habits", []);
  const [goals, , goalsLoaded] = useLocalStorage<Goal[]>("rawtin-goals", []);
  const today = todayKey();

  const habitStats = useMemo(() => {
    const bySection = SECTION_ORDER.map((section) => {
      const list = habits.filter((h) => h.section === section);
      const done = list.filter((h) => h.doneDates.includes(today)).length;
      return { section, done, total: list.length };
    });
    const totalDone = bySection.reduce((s, x) => s + x.done, 0);
    const totalHabits = bySection.reduce((s, x) => s + x.total, 0);
    const pct = totalHabits ? Math.round((totalDone / totalHabits) * 100) : 0;
    return { bySection, totalDone, totalHabits, pct };
  }, [habits, today]);

  const goalStats = useMemo(() => {
    return PERIOD_ORDER.map((period) => {
      const list = goals.filter((g) => g.period === period);
      const avg = list.length
        ? Math.round(list.reduce((s, g) => s + goalProgress(g), 0) / list.length)
        : 0;
      return { period, count: list.length, avg };
    });
  }, [goals]);

  if (!habitsLoaded || !goalsLoaded) return null;

  const offset = CIRCUMFERENCE - (habitStats.pct / 100) * CIRCUMFERENCE;

  return (
    <div className="px-5 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border"
            style={{
              backgroundColor: "var(--accent-soft)",
              borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="2" />
              <path
                d="M8 12.5L10.5 15L16 9"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[19px] font-extrabold tracking-tight">روتين</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Habits summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-3.5 rounded-3xl border p-[18px]"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-[84px] w-[84px] flex-shrink-0">
            <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="var(--border)"
                strokeWidth={STROKE}
                fill="none"
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="var(--accent)"
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[17px] font-bold">{habitStats.pct}%</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-0.5 text-sm font-semibold">العادات اليوم</div>
            <div className="mb-2.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {habitStats.totalDone} من {habitStats.totalHabits} منجزة
            </div>
            <div className="flex gap-2.5">
              {habitStats.bySection.map(({ section, done, total }) => {
                const Icon = SECTION_ICONS[section];
                return (
                  <div key={section} className="flex items-center gap-1">
                    <Icon size={13} color="var(--accent)" />
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {done}/{total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-3xl border p-[18px]"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-sm font-semibold">الأهداف</span>
          <Link
            href="/goals"
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--accent)" }}
          >
            الكل <ArrowLeft size={12} />
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {goalStats.map(({ period, count, avg }) => {
            const Icon = PERIOD_ICONS[period];
            return (
              <div key={period} className="flex items-center gap-2.5">
                <div
                  className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                >
                  <Icon size={14} color="var(--accent)" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="text-[12.5px]">
                      {PERIOD_META[period].label}{" "}
                      <span style={{ color: "var(--text-muted)" }}>({count})</span>
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                      {avg}%
                    </span>
                  </div>
                  <div
                    className="h-[5px] overflow-hidden rounded-full"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${avg}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
