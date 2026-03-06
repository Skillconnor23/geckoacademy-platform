type EduSession = { id: string; startsAt: Date | string; title?: string | null };

type Props = {
  nextSessions: EduSession[];
  quizThisWeek?: boolean;
  homeworkThisWeek?: boolean;
};

function formatSessionTime(d: Date | string): string {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function WeekAgendaCard({
  nextSessions,
  quizThisWeek = false,
  homeworkThisWeek = false,
}: Props) {
  const nextClass = nextSessions[0];
  const bullets: string[] = [];
  if (nextClass) {
    bullets.push(`Next class: ${formatSessionTime(nextClass.startsAt)}`);
  }
  if (quizThisWeek) {
    bullets.push('Upcoming quiz this week');
  }
  if (homeworkThisWeek) {
    bullets.push('Homework due this week');
  }
  const hasContent = bullets.length > 0;

  return (
    <div
      className="flex min-h-24 shrink-0 items-start rounded-2xl border border-[#e5e7eb] bg-[#7daf41] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:min-h-[120px] sm:py-5"
      aria-label="This week"
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">This week</h3>
        {hasContent ? (
          <ul className="space-y-1 text-sm text-white/90">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-white/70">•</span>
                {b}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/80">
            Your teacher will post this week&apos;s plan soon.
          </p>
        )}
      </div>
    </div>
  );
}
