import { SkillEventType, SkillStatus, type Skill, type SkillEvent } from "@prisma/client";
import { eachDayOfInterval, format, isSameDay, subDays, subMonths, subWeeks } from "date-fns";

export type AnalyticsPayload = {
  total: number;
  inProgress: number;
  completed: number;
  completionRate: number;
  unfinishedCommitments: number;
  activeStreak: number;
  weeklyCompletions: { label: string; value: number }[];
  monthlyCompletions: { label: string; value: number }[];
  categoryBreakdown: { category: string; inProgress: number; completed: number }[];
};

export function computeAnalytics(skills: Skill[], events: SkillEvent[]): AnalyticsPayload {
  const total = skills.length;
  const completed = skills.filter((item) => item.status === SkillStatus.COMPLETED).length;
  const inProgress = skills.filter((item) => item.status === SkillStatus.IN_PROGRESS).length;
  const completionRate = total === 0 ? 0 : completed / total;

  const completedEvents = events.filter((e) => e.eventType === SkillEventType.COMPLETED);
  const completedDates = completedEvents.map((e) => new Date(e.eventAt));
  const uniqueDates = Array.from(new Set(completedDates.map((d) => d.toDateString()))).map((d) => new Date(d));

  let activeStreak = 0;
  let cursor = new Date();
  while (uniqueDates.some((d) => isSameDay(d, cursor))) {
    activeStreak += 1;
    cursor = subDays(cursor, 1);
  }

  const weeklyCompletions = Array.from({ length: 8 }, (_, index) => {
    const start = subWeeks(new Date(), 7 - index);
    const end = subWeeks(new Date(), 6 - index);
    const days = eachDayOfInterval({ start, end });
    const value = completedDates.filter((date) => days.some((day) => isSameDay(day, date))).length;
    return { label: format(start, "MMM d"), value };
  });

  const monthlyCompletions = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(new Date(), 5 - index);
    const monthLabel = format(date, "MMM yy");
    const value = completedDates.filter((d) => format(d, "MMM yy") === monthLabel).length;
    return { label: monthLabel, value };
  });

  const byCategory = new Map<string, { inProgress: number; completed: number }>();
  for (const skill of skills) {
    const current = byCategory.get(skill.category) ?? { inProgress: 0, completed: 0 };
    if (skill.status === SkillStatus.COMPLETED) {
      current.completed += 1;
    } else {
      current.inProgress += 1;
    }
    byCategory.set(skill.category, current);
  }

  const categoryBreakdown = Array.from(byCategory.entries()).map(([category, values]) => ({
    category,
    ...values,
  }));

  return {
    total,
    inProgress,
    completed,
    completionRate,
    unfinishedCommitments: inProgress,
    activeStreak,
    weeklyCompletions,
    monthlyCompletions,
    categoryBreakdown,
  };
}
