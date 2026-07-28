"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Check,
  CalendarDays,
  CalendarRange,
  Calendar,
  X,
} from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Goal, GoalPeriod, PERIOD_META, goalProgress } from "@/lib/goals";

const PERIOD_ICONS: Record<GoalPeriod, typeof CalendarDays> = {
  weekly: CalendarDays,
  monthly: CalendarRange,
  yearly: Calendar,
};

const PERIOD_ORDER: GoalPeriod[] = ["weekly", "monthly", "yearly"];

export default function GoalsPage() {
  const [goals, setGoals, loaded] = useLocalStorage<Goal[]>("rawtin-goals", []);
  const [activePeriod, setActivePeriod] = useState<GoalPeriod>("weekly");
  const [openGoal, setOpenGoal] = useState<string | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newStepText, setNewStepText] = useState("");

  function addGoal() {
    if (!newGoalTitle.trim()) {
      setIsAddingGoal(false);
      return;
    }
    const goal: Goal = {
      id: crypto.randomUUID(),
      period: activePeriod,
      title: newGoalTitle.trim(),
      createdAt: new Date().toISOString(),
      steps: [],
    };
    setGoals((prev) => [...prev, goal]);
    setNewGoalTitle("");
    setIsAddingGoal(false);
  }

  function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function toggleStep(goalId: string, stepId: string) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              steps: g.steps.map((s) =>
                s.id === stepId ? { ...s, done: !s.done } : s
              ),
            }
          : g
      )
    );
  }

  function deleteStep(goalId: string, stepId: string) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, steps: g.steps.filter((s) => s.id !== stepId) }
          : g
      )
    );
  }

  function addStep(goalId: string) {
    if (!newStepText.trim()) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              steps: [
                ...g.steps,
                { id: crypto.randomUUID(), text: newStepText.trim(), done: false },
              ],
            }
          : g
      )
    );
    setNewStepText("");
  }

  const periodGoals = goals.filter((g) => g.period === activePeriod);

  if (!loaded) return null;

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-bold">الأهداف</h1>
      <p className="mb-4.5 text-sm" style={{ color: "var(--text-muted)" }}>
        {goals.length} هدف قيد التنفيذ
      </p>

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
        {periodGoals.length === 0 && !isAddingGoal && (
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
                      <AnimatePresence initial={false}>
                        {goal.steps.map((step) => (
                          <motion.div
                            key={step.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between py-1.5"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleStep(goal.id, step.id)}
                                className="flex h-[18px] w-[18px] items-center justify-center rounded-md border-2"
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
                            <button onClick={() => deleteStep(goal.id, step.id)} className="opacity-40">
                              <X size={13} color="var(--danger)" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <div className="mt-1 flex gap-1.5">
                        <input
                          value={newStepText}
                          onChange={(e) => setNewStepText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addStep(goal.id);
                          }}
                          placeholder="خطوة جديدة..."
                          className="flex-1 rounded-[10px] border px-2.5 py-1.5 text-[12.5px] outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--bg)",
                            color: "var(--text)",
                          }}
                        />
                        <button
                          onClick={() => addStep(goal.id)}
                          className="rounded-[10px] px-3 text-xs text-white"
                          style={{ backgroundColor: "var(--accent)" }}
                        >
                          إضافة
                        </button>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="mt-1.5 flex items-center justify-center gap-1 text-xs opacity-80"
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={12} /> حذف الهدف
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <AnimatePresence>
          {isAddingGoal ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 rounded-2xl border px-3 py-2.5"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--bg-elevated)" }}
            >
              <input
                autoFocus
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addGoal();
                  if (e.key === "Escape") setIsAddingGoal(false);
                }}
                placeholder="عنوان الهدف..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={addGoal}
                className="rounded-lg px-3.5 py-1 text-[13px] text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                إضافة
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => {
                setIsAddingGoal(true);
                setNewGoalTitle("");
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed py-2.5 text-[13.5px]"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}
            >
              <Plus size={15} /> إضافة هدف
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
