"use client";

import { useMemo, useRef, useState } from "react";
import {
  Flame,
  CheckCircle2,
  Target,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Habit, computeStreak, totalHabitCompletions } from "@/lib/habits";
import { Goal, goalProgress } from "@/lib/goals";
import { useAccent, ACCENT_PRESETS } from "@/lib/accent-context";

const BACKUP_KEYS = ["rawtin-habits", "rawtin-goals", "rawtin-theme", "rawtin-accent"];
const DAYS_SHORT = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];

function startOfWeekSat(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - ((d.getDay() + 1) % 7));
  return r;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function MorePage() {
  const [habits, setHabits, habitsLoaded] = useLocalStorage<Habit[]>("rawtin-habits", []);
  const [goals, setGoals, goalsLoaded] = useLocalStorage<Goal[]>("rawtin-goals", []);
  const { accent, setAccent } = useAccent();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [weekMenuOpen, setWeekMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const stats = useMemo(() => {
    return {
      streak: computeStreak(habits),
      totalDone: totalHabitCompletions(habits),
      goalsCompleted: goals.filter((g) => g.steps.length > 0 && goalProgress(g) === 100).length,
    };
  }, [habits, goals]);

  const weeksList = useMemo(() => {
    const dates: Date[] = [];
    habits.forEach((h) => {
      if (h.createdAt) dates.push(new Date(h.createdAt));
      h.doneDates.forEach((k) => {
        const [y, m, d] = k.split("-").map(Number);
        dates.push(new Date(y, m - 1, d));
      });
    });
    const today = new Date();
    const earliest = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : today;
    const earliestWeekStart = startOfWeekSat(earliest);
    const currentWeekStart = startOfWeekSat(today);
    const totalWeeks =
      Math.round((currentWeekStart.getTime() - earliestWeekStart.getTime()) / (7 * 86400000)) + 1;
    return Array.from({ length: Math.max(totalWeeks, 1) }, (_, i) => ({
      index: i + 1,
      start: addDays(earliestWeekStart, i * 7),
    }));
  }, [habits]);

  const [weekIndex, setWeekIndex] = useState<number | null>(null);
  const activeWeekIndex = weekIndex ?? weeksList.length;
  const activeWeekStart = weeksList[activeWeekIndex - 1]?.start ?? startOfWeekSat(new Date());

  const weeklyProductivity = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(activeWeekStart, i);
      const key = dateKeyOf(d);
      if (habits.length === 0) return { pct: 0, day: d };
      const done = habits.filter((h) => h.doneDates.includes(key)).length;
      return { pct: Math.round((done / habits.length) * 100), day: d };
    });
  }, [habits, activeWeekStart]);
  const avgProductivity = Math.round(weeklyProductivity.reduce((s, v) => s + v.pct, 0) / 7);

  function handleExport() {
    const data: Record<string, unknown> = {};
    BACKUP_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rawtin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل النسخة الاحتياطية");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        BACKUP_KEYS.forEach((key) => {
          if (parsed[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(parsed[key]));
          }
        });
        showToast("تم الاسترجاع، جاري إعادة التحميل...");
        setTimeout(() => window.location.reload(), 800);
      } catch {
        showToast("الملف غير صالح");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    setHabits([]);
    setGoals([]);
    setConfirmingReset(false);
    showToast("تم حذف كل البيانات");
  }

  if (!habitsLoaded || !goalsLoaded) return null;

  const statList = [
    { icon: Flame, label: "سلسلة الأيام", value: stats.streak },
    { icon: CheckCircle2, label: "عادات منجزة", value: stats.totalDone },
    { icon: Target, label: "أهداف مكتملة", value: stats.goalsCompleted },
  ];

  return (
    <div className="relative px-5 pt-6">
      <h1 className="mb-5 text-xl font-bold">المزيد</h1>

      {/* Stats */}
      <div className="mb-3.5 grid grid-cols-3 gap-2">
        {statList.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-[18px] border px-2 py-3.5 text-center"
              style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
            >
              <Icon size={18} color="var(--accent)" className="mx-auto mb-1.5" />
              <div className="text-[17px] font-bold">{s.value}</div>
              <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly productivity chart */}
      <div
        className="mb-3.5 rounded-[22px] border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="relative mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            إنتاجية {activeWeekIndex === weeksList.length ? "هذا الأسبوع" : `الأسبوع ${activeWeekIndex}`}
          </p>
          <button
            onClick={() => setWeekMenuOpen((o) => !o)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            المعدل {avgProductivity}%
            <ChevronDown
              size={14}
              style={{ transform: weekMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            />
          </button>

          {weekMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setWeekMenuOpen(false)} />
              <div
                className="absolute left-0 top-8 z-40 max-h-52 w-32 overflow-y-auto rounded-xl border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-elevated)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                {weeksList.map((w) => (
                  <button
                    key={w.index}
                    onClick={() => {
                      setWeekIndex(w.index);
                      setWeekMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2.5 text-start text-xs font-semibold"
                    style={{
                      backgroundColor:
                        activeWeekIndex === w.index ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                      color: activeWeekIndex === w.index ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {w.index === weeksList.length ? "الأسبوع الحالي" : `أسبوع ${w.index}`}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex h-24 items-end gap-2">
          {weeklyProductivity.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className="text-[9px] font-semibold"
                style={{ color: w.pct >= 80 ? "var(--accent)" : "var(--text-muted)" }}
              >
                {w.pct}%
              </span>
              <div className="flex h-14 w-full items-end">
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: `${Math.max(w.pct, 3)}%`,
                    backgroundColor: w.pct > 0 ? "var(--accent)" : "var(--border)",
                    opacity: w.pct >= 80 ? 1 : 0.55,
                  }}
                />
              </div>
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                {DAYS_SHORT[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div
        className="mb-3.5 rounded-[22px] border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 text-sm font-semibold">لون التطبيق</div>
        <div className="flex gap-2.5">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setAccent(p.color)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-shadow"
              style={{
                backgroundColor: p.color,
                boxShadow:
                  accent === p.color
                    ? `0 0 0 2px var(--bg-elevated), 0 0 0 4px ${p.color}`
                    : "none",
              }}
            >
              {accent === p.color && <Check size={14} color="#fff" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      {/* Backup */}
      <div
        className="mb-3.5 rounded-[22px] border p-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 text-sm font-semibold">النسخ الاحتياطي</div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[13.5px] font-semibold"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <Download size={16} /> تصدير نسخة احتياطية
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 rounded-[14px] border px-3.5 py-2.5 text-[13.5px] font-semibold"
            style={{ borderColor: "var(--border)" }}
          >
            <Upload size={16} /> استرجاع نسخة احتياطية
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="rounded-[22px] border p-4"
        style={{
          backgroundColor: "color-mix(in srgb, var(--danger) 10%, var(--bg-elevated))",
          borderColor: "color-mix(in srgb, var(--danger) 30%, transparent)",
        }}
      >
        <div
          className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "var(--danger)" }}
        >
          <AlertTriangle size={15} /> منطقة الخطر
        </div>

        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border px-3.5 py-2.5 text-[13.5px] font-semibold"
            style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
          >
            <Trash2 size={15} /> حذف كل البيانات
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[12.5px]">
              متأكد؟ هذا الإجراء بيحذف كل العادات والأهداف نهائيًا وما ينرجع.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-white"
                style={{ backgroundColor: "var(--danger)" }}
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="flex-1 rounded-xl border py-2.5 text-[13px]"
                style={{ borderColor: "var(--border)" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px]"
          style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
