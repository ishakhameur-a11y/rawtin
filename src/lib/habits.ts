export type HabitSection = "deeni" | "badani" | "aqli";

export interface Habit {
  id: string;
  section: HabitSection;
  name: string;
  createdAt: string;
  // dates (YYYY-MM-DD) the habit was marked done
  doneDates: string[];
}

export const SECTION_META: Record<
  HabitSection,
  { label: string }
> = {
  deeni: { label: "ديني" },
  badani: { label: "بدني" },
  aqli: { label: "عقلي" },
};

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function dateKeyOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function computeStreak(habits: Habit[]): number {
  const doneDaysSet = new Set<string>();
  habits.forEach((h) => h.doneDates.forEach((d) => doneDaysSet.add(d)));

  let streak = 0;
  let i = 0;
  // today counts even if not done yet, so start checking from yesterday if today is empty
  while (doneDaysSet.has(dateKeyOffset(i))) {
    streak++;
    i++;
  }
  return streak;
}

export function totalHabitCompletions(habits: Habit[]): number {
  return habits.reduce((sum, h) => sum + h.doneDates.length, 0);
}
