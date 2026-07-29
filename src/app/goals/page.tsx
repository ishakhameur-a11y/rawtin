"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Check,
  CalendarDays,
  CalendarRange,
  Calendar,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Goal, GoalStep, GoalPeriod, PERIOD_META, goalProgress } from "@/lib/goals";

const PERIOD_ICONS: Record<GoalPeriod, typeof CalendarDays> = {
  weekly: CalendarDays,
  monthly: CalendarRange,
  yearly: Calendar,
};

const PERIOD_ORDER: GoalPeriod[] = ["weekly", "monthly", "yearly"];

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/45" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-[26px] px-5 pb-7 pt-2.5"
        style={{ backgroundColor: "var(--bg)", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}
      >
        <div
          className="mx-auto mb-4 h-1 w-9 rounded-full"
          style={{ backgroundColor: "var(--border)" }}
        />
        <h2 className="mb-4 text-center text-base font-bold">{title}</h2>
        {children}
      </motion.div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals, loaded] = useLocalStorage<Goal[]>("rawtin-goals", []);
  const [activePeriod, setActivePeriod] = useState<GoalPeriod>("weekly");
  const [openGoal, setOpenGoal] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addSteps, setAddSteps] = useState<string[]>([""]);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSteps, setEditSteps] = useState<GoalStep[]>([]);

  function openAdd() {
    setAddTitle("");
    setAddSteps([""]);
    setAddOpen(true);
  }

  function confirmAdd() {
    if (!addTitle.trim()) return;
    const steps: GoalStep[] = addSteps
      .filter((s) => s.trim())
      .map((s, i) => ({ id: crypto.randomUUID() + i, text: s.trim(), done: false }));
    const goal: Goal = {
      id: crypto.randomUUID(),
      period: activePeriod,
      title: addTitle.trim(),
      createdAt: new Date().toISOString(),
      steps,
    };
    setGoals((prev) => [...prev, goal]);
    setAddOpen(false);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditSteps(goal.steps.map((s) => ({ ...s })));
  }

  function confirmEdit() {
    if (!editTitle.trim() || !editingGoal) return;
    const steps = editSteps.filter((s) => s.text.trim());
    setGoals((prev) =>
      prev.map((g) => (g.id === editingGoal.id ? { ...g, title: editTitle.trim(), steps } : g))
    );
    setEditingGoal(null);
  }

  function confirmDeleteGoal() {
    if (!editingGoal) return;
    setGoals((prev) => prev.filter((g) => g.id !== editingGoal.id));
    setEditingGoal(null);
  }

  function toggleStep(goalId: string, stepId: string) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              steps: g.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
            }
          : g
      )
    );
  }

  const periodGoals = goals.filter((g) => g.period === activePeriod);

  if (!loaded) return null;

  return (
    <div className="relative min-h-full px-5 pt-6">
      {/* Header: title centered, + button on the right */}
      <div className="relative mb-4.5 flex items-center justify-center">
        <h1 className="text-lg font-bold">الأهداف</h1>
        <button
          onClick={openAdd}
          className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white"
          style={{
            backgroundColor: "var(--accent)",
            boxShadow: "0 4px 12px color-mix(in srgb, var(--accent) 35%, transparent)",
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Horizontal period selector */}
      <div className="mb-4.5 flex gap-2">
        {PERIOD_ORDER.map((period) => {
          const Icon = PERIOD_ICONS[period];
          const isActive = activePeriod === period;
          const count = goals.filter((g) => g.period === period).length;
          return (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors"
              style={{
                borderColor: isActive ? "var(--accent)" : "var(--border)",
                backgroundColor: isActive ? "var(--accent-soft)" : "var(--bg-elevated)",
              }}
            >
              <Icon size={15} color={isActive ? "var(--accent)" : "var(--text-muted)"} />
              <span
                className="text-xs font-semibold"
                style={{ color: isActive ? "var(--accent)" : "var(--text)" }}
              >
                {PERIOD_META[period].label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {count > 0 ? count : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected period content */}
      <div className="flex flex-col gap-2">
        {periodGoals.length === 0 && (
          <p className="my-5 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            ما فيه أهداف بهذه الفترة بعد.
          </p>
        )}

        {periodGoals.map((goal) => {
          const pct = goalProgress(goal);
          const goalOpen = openGoal === goal.id;
          return (
            <div
              key={goal.id}
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
            >
              <button
                onClick={() => setOpenGoal(goalOpen ? null : goal.id)}
                className="w-full p-[13px] text-right"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">{goal.title}</span>
                  <span className="text-[12.5px] font-bold" style={{ color: "var(--accent)" }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--border)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {goalOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="flex flex-col gap-1.5 border-t px-[13px] pb-[13px] pt-2.5"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {goal.steps.length === 0 && (
                        <p className="mb-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
                          ما فيه خطوات بعد.
                        </p>
                      )}
                      {goal.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 py-1.5">
                          <button
                            onClick={() => toggleStep(goal.id, step.id)}
                            className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md border-2"
                            style={{
                              borderColor: step.done ? "var(--accent)" : "var(--border)",
                              backgroundColor: step.done ? "var(--accent)" : "transparent",
                            }}
                          >
                            {step.done && <Check size={11} color="#fff" strokeWidth={3} />}
                          </button>
                          <span
                            className="text-[13px]"
                            style={{
                              color: step.done ? "var(--text-muted)" : "var(--text)",
                              textDecoration: step.done ? "line-through" : "none",
                            }}
                          >
                            {step.text}
                          </span>
                        </div>
                      ))}

                      <button
                        onClick={() => openEdit(goal)}
                        className="mt-2 flex items-center justify-center gap-1.5 rounded-lg p-1.5 text-[12.5px] opacity-60"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Pencil size={13} /> تعديل
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add goal sheet */}
      <AnimatePresence>
        {addOpen && (
          <Sheet title="إضافة هدف جديد" onClose={() => setAddOpen(false)}>
            <input
              autoFocus
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="عنوان الهدف..."
              className="mb-3 w-full rounded-2xl border px-3.5 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text)" }}
            />
            <p className="mb-2 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
              خطوات الهدف (اختياري)
            </p>
            <div className="mb-3 flex flex-col gap-2">
              {addSteps.map((step, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={step}
                    onChange={(e) =>
                      setAddSteps((prev) => prev.map((s, idx) => (idx === i ? e.target.value : s)))
                    }
                    placeholder={`خطوة ${i + 1}...`}
                    className="flex-1 rounded-xl border px-3 py-2.5 text-[13px] outline-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text)" }}
                  />
                  {addSteps.length > 1 && (
                    <button
                      onClick={() => setAddSteps((prev) => prev.filter((_, idx) => idx !== i))}
                      className="px-1 opacity-50"
                    >
                      <X size={16} color="var(--danger)" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setAddSteps((prev) => [...prev, ""])}
              className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-[12.5px]"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}
            >
              <Plus size={13} /> إضافة خطوة
            </button>
            <button
              onClick={confirmAdd}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              إضافة الهدف
            </button>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Edit / delete goal sheet */}
      <AnimatePresence>
        {editingGoal && (
          <Sheet title="تعديل الهدف" onClose={() => setEditingGoal(null)}>
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mb-3 w-full rounded-2xl border px-3.5 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text)" }}
            />
            <p className="mb-2 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
              الخطوات
            </p>
            <div className="mb-3 flex flex-col gap-2">
              {editSteps.map((step, i) => (
                <div key={step.id} className="flex gap-1.5">
                  <input
                    value={step.text}
                    onChange={(e) =>
                      setEditSteps((prev) =>
                        prev.map((s, idx) => (idx === i ? { ...s, text: e.target.value } : s))
                      )
                    }
                    className="flex-1 rounded-xl border px-3 py-2.5 text-[13px] outline-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text)" }}
                  />
                  <button
                    onClick={() => setEditSteps((prev) => prev.filter((_, idx) => idx !== i))}
                    className="px-1 opacity-50"
                  >
                    <X size={16} color="var(--danger)" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                setEditSteps((prev) => [...prev, { id: crypto.randomUUID(), text: "", done: false }])
              }
              className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-[12.5px]"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}
            >
              <Plus size={13} /> إضافة خطوة
            </button>
            <button
              onClick={confirmEdit}
              className="mb-2.5 w-full rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              حفظ التعديل
            </button>
            <button
              onClick={confirmDeleteGoal}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              <Trash2 size={16} /> حذف الهدف
            </button>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}
