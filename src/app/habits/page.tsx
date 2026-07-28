"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, Sparkles, Dumbbell, Brain } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Habit, HabitSection, SECTION_META, todayKey } from "@/lib/habits";

const SECTION_ICONS: Record<HabitSection, typeof Sparkles> = {
  deeni: Sparkles,
  badani: Dumbbell,
  aqli: Brain,
};

const SECTION_ORDER: HabitSection[] = ["deeni", "badani", "aqli"];

export default function HabitsPage() {
  const [habits, setHabits, loaded] = useLocalStorage<Habit[]>("rawtin-habits", []);
  const [activeSection, setActiveSection] = useState<HabitSection>("deeni");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const today = todayKey();

  function toggleHabit(id: string) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.doneDates.includes(today);
        return {
          ...h,
          doneDates: has
            ? h.doneDates.filter((d) => d !== today)
            : [...h.doneDates, today],
        };
      })
    );
  }

  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function addHabit() {
    if (!newName.trim()) {
      setIsAdding(false);
      return;
    }
    const habit: Habit = {
      id: crypto.randomUUID(),
      section: activeSection,
      name: newName.trim(),
      createdAt: new Date().toISOString(),
      doneDates: [],
    };
    setHabits((prev) => [...prev, habit]);
    setNewName("");
    setIsAdding(false);
  }

  const doneToday = habits.filter((h) => h.doneDates.includes(today)).length;
  const sectionHabits = habits.filter((h) => h.section === activeSection);

  if (!loaded) return null;

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-bold">العادات</h1>
      <p className="mb-4.5 text-sm" style={{ color: "var(--text-muted)" }}>
        {doneToday} من {habits.length} منجزة اليوم
      </p>

      {/* Horizontal section selector */}
      <div className="mb-4.5 flex gap-2">
        {SECTION_ORDER.map((section) => {
          const Icon = SECTION_ICONS[section];
          const isActive = activeSection === section;
          const list = habits.filter((h) => h.section === section);
          const done = list.filter((h) => h.doneDates.includes(today)).length;
          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
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
                {SECTION_META[section].label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {list.length > 0 ? `${done}/${list.length}` : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected section content */}
      <div className="flex flex-col gap-2">
        {sectionHabits.length === 0 && !isAdding && (
          <p className="my-5 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            ما فيه عادات بهذا القسم بعد.
          </p>
        )}

        <AnimatePresence initial={false}>
          {sectionHabits.map((habit) => {
            const done = habit.doneDates.includes(today);
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between rounded-2xl border px-3 py-3"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-lg border-2 transition-colors"
                    style={{
                      borderColor: done ? "var(--accent)" : "var(--border)",
                      backgroundColor: done ? "var(--accent)" : "transparent",
                    }}
                  >
                    {done && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                  <span
                    className="text-sm"
                    style={{
                      color: done ? "var(--text-muted)" : "var(--text)",
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {habit.name}
                  </span>
                </div>
                <button onClick={() => deleteHabit(habit.id)} className="p-1 opacity-50">
                  <Trash2 size={15} color="var(--danger)" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 rounded-2xl border px-3 py-2.5"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--bg-elevated)" }}
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addHabit();
                  if (e.key === "Escape") setIsAdding(false);
                }}
                placeholder="اسم العادة..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={addHabit}
                className="rounded-lg px-3.5 py-1 text-[13px] text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                إضافة
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => {
                setIsAdding(true);
                setNewName("");
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed py-2.5 text-[13.5px]"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}
            >
              <Plus size={15} /> إضافة عادة
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
