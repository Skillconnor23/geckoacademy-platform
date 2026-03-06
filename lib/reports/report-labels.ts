import type { Locale } from '@/lib/i18n/config';
import { getMessagesForLocale } from '@/lib/i18n/messages';

export type MonthlyReportLabels = {
  cardTitle: string;
  cardDescription: string;
  monthLabel: string;
  languageLabel: string;
  downloadButton: string;
  generating: string;
  brandName: string;
  reportTitle: string;
  studentInfo: string;
  studentName: string;
  class: string;
  school?: string;
  teacher: string;
  reportingMonth: string;
  performanceMetrics: string;
  thisMonth: string;
  attendance: string;
  sessions: string;
  avgQuizScore: string;
  attempts: string;
  homeworkCompletion: string;
  completed: string;
  readingCompleted: string;
  participationAvg: string;
  teacherFeedback: string;
  recommendedNextSteps: string;
  summary: string;
  noActivity: string;
  footerGenerated: string;
  summaryAttendance: string;
  summaryQuiz: string;
  summaryHomework: string;
  summaryReading: string;
  summaryParticipation: string;
  summaryAreasToImprove: string;
};

export function getMonthlyReportLabels(locale: Locale): MonthlyReportLabels {
  const messages = getMessagesForLocale(locale);
  const r = (messages as { report?: { monthlyProgress?: Record<string, string> } }).report?.monthlyProgress;
  if (!r) {
    return getMonthlyReportLabels('en' as Locale);
  }
  return r as unknown as MonthlyReportLabels;
}

/** Format month key (YYYY-MM) as localized "Month YYYY". */
export function formatMonthLabelForLocale(locale: Locale, monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 1, 1);
  const localeTag = locale === 'mn' ? 'mn-MN' : 'en-US';
  return d.toLocaleDateString(localeTag, { month: 'long', year: 'numeric' });
}
