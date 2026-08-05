"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Sparkles, Dumbbell, Brain, Pencil, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Habit, HabitSection, SECTION_META } from "@/lib/habits";

const SECTION_ICONS: Record<HabitSection, typeof Sparkles> = {
  deeni: Sparkles,
  badani: Dumbbell,
  aqli: Brain,
};

const SECTION_ORDER: HabitSection[] = ["deeni", "badani", "aqli"];
const DAY_NAMES_FULL_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function addDaysTo(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function startOfWeekSat(d: Date): Date {
  return addDaysTo(d, -((d.getDay() + 1) % 7));
}
function getWeekDays(anchorDate: Date): Date[] {
  const start = startOfWeekSat(anchorDate);
  return Array.from({ length: 7 }, (_, i) => addDaysTo(start, i));
}

function DayRing({
  pct,
  size = 44,
  stroke = 3,
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  children: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border)" strokeWidth={stroke} fill="none" />
        {pct > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--accent)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[60] flex items-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/45" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 w-full rounded-t-[26px] px-5 pb-7 pt-2.5"
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

export default function HabitsPage() {
  const [habits, setHabits, loaded] = useLocalStorage<Habit[]>("rawtin-habits", []);
  const [activeSection, setActiveSection] = useState<HabitSection>("deeni");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [addSection, setAddSection] = useState<HabitSection>("deeni");
  const [newName, setNewName] = useState("");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState("");

  const selectedKey = dateKeyOf(selectedDate);
  const weekDays = getWeekDays(selectedDate);
  const todayDateObj = new Date();

  function toggleHabit(id: string) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.doneDates.includes(selectedKey);
        return {
          ...h,
          doneDates: has
            ? h.doneDates.filter((d) => d !== selectedKey)
            : [...h.doneDates, selectedKey],
        };
      })
    );
  }

  function openAdd() {
    setAddSection(activeSection);
    setNewName("");
    setAddOpen(true);
  }

  function confirmAdd() {
    if (!newName.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      section: addSection,
      name: newName.trim(),
      createdAt: new Date().toISOString(),
      doneDates: [],
    };
    setHabits((prev) => [...prev, habit]);
    setAddOpen(false);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setEditName(habit.name);
  }

  function confirmEdit() {
    if (!editName.trim() || !editingHabit) return;
    setHabits((prev) =>
      prev.map((h) => (h.id === editingHabit.id ? { ...h, name: editName.trim() } : h))
    );
    setEditingHabit(null);
  }

  function confirmDelete() {
    if (!editingHabit) return;
    setHabits((prev) => prev.filter((h) => h.id !== editingHabit.id));
    setEditingHabit(null);
  }

  const sectionHabits = habits.filter((h) => h.section === activeSection);

  if (!loaded) return null;

  return (
    <div className="relative min-h-full px-5 pt-6">
      {/* Header: title centered, + button on the right */}
      <div className="relative mb-4.5 flex items-center justify-center">
        <h1 className="text-lg font-bold">العادات</h1>
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

      {/* Week day circles */}
      <div className="mb-5 flex justify-between">
        {weekDays.map((day) => {
          const key = dateKeyOf(day);
          const done = habits.filter((h) => h.doneDates.includes(key)).length;
          const total = habits.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isSelected = key === selectedKey;
          const isFuture = day > todayDateObj && dateKeyOf(day) !== dateKeyOf(todayDateObj);
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(day)}
              disabled={isFuture}
              className="flex flex-1 flex-col items-center gap-1.5"
              style={{ opacity: isFuture ? 0.35 : 1, cursor: isFuture ? "default" : "pointer" }}
            >
              <span
                className="whitespace-nowrap text-[9.5px]"
                style={{
                  color: isSelected ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {DAY_NAMES_FULL_AR[day.getDay()]}
              </span>
              <DayRing pct={pct}>
                <div
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isSelected ? "var(--accent-soft)" : "transparent",
                    border: isSelected ? "1.5px solid var(--accent)" : "none",
                  }}
                >
                  <span
                    className="text-[12.5px] font-bold"
                    style={{ color: isSelected ? "var(--accent)" : "var(--text)" }}
                  >
                    {day.getDate()}
                  </span>
                </div>
              </DayRing>
            </button>
          );
        })}
      </div>

      {/* Horizontal section selector */}
      <div className="mb-4.5 flex gap-2">
        {SECTION_ORDER.map((section) => {
          const Icon = SECTION_ICONS[section];
          const isActive = activeSection === section;
          const list = habits.filter((h) => h.section === section);
          const done = list.filter((h) => h.doneDates.includes(selectedKey)).length;
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
        {sectionHabits.length === 0 && (
          <p className="my-5 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            ما فيه عادات بهذا القسم بعد.
          </p>
        )}

        <AnimatePresence initial={false}>
          {sectionHabits.map((habit) => {
            const done = habit.doneDates.includes(selectedKey);
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
                <button onClick={() => openEdit(habit)} className="p-1 opacity-35">
                  <Pencil size={15} color="var(--text-muted)" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add habit sheet */}
      <AnimatePresence>
        {addOpen && (
          <Sheet title="إضافة عادة جديدة" onClose={() => setAddOpen(false)}>
            <div className="mb-3.5 flex gap-2">
              {SECTION_ORDER.map((section) => {
                const Icon = SECTION_ICONS[section];
                const isActive = addSection === section;
                return (
                  <button
                    key={section}
                    onClick={() => setAddSection(section)}
                    className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5"
                    style={{
                      borderColor: isActive ? "var(--accent)" : "var(--border)",
                      backgroundColor: isActive ? "var(--accent-soft)" : "var(--bg-elevated)",
                    }}
                  >
                    <Icon size={16} color={isActive ? "var(--accent)" : "var(--text-muted)"} />
                    <span
                      className="text-[11.5px] font-semibold"
                      style={{ color: isActive ? "var(--accent)" : "var(--text)" }}
                    >
                      {SECTION_META[section].label}
                    </span>
                  </button>
                );
              })}
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd();
              }}
              placeholder="اسم العادة..."
              className="mb-3.5 w-full rounded-2xl border px-3.5 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text)" }}
            />
            <button
              onClick={confirmAdd}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              إضافة العادة
            </button>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Edit / delete habit sheet */}
      <AnimatePresence>
        {editingHabit && (
          <Sheet title="تعديل العادة" onClose={() => setEditingHabit(null)}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmEdit();
              }}
              className="mb-3.5 w-full rounded-2xl border px-3.5 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text)" }}
            />
            <button
              onClick={confirmEdit}
              className="mb-2.5 w-full rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              حفظ التعديل
            </button>
            <button
              onClick={confirmDelete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              <Trash2 size={16} /> حذف العادة
            </button>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}
