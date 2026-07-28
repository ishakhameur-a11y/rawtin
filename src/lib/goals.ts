export type GoalPeriod = "weekly" | "monthly" | "yearly";

export interface GoalStep {
  id: string;
  text: string;
  done: boolean;
}

export interface Goal {
  id: string;
  period: GoalPeriod;
  title: string;
  createdAt: string;
  steps: GoalStep[];
}

export const PERIOD_META: Record<GoalPeriod, { label: string }> = {
  weekly: { label: "أسبوعية" },
  monthly: { label: "شهرية" },
  yearly: { label: "سنوية" },
};

export function goalProgress(goal: Goal): number {
  if (goal.steps.length === 0) return 0;
  return Math.round(
    (goal.steps.filter((s) => s.done).length / goal.steps.length) * 100
  );
}
