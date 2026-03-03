/** Mock UI preview: score ring + weekly quizzes + activity cards */
export function PlatformPreviewRow() {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6">
      {/* Score ring */}
      <div className="flex shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          aria-hidden
        >
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#7daf41"
              strokeWidth="3"
              strokeDasharray="68 24"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-lg font-semibold text-[#3d4236]">85</span>
        </div>
        <span className="mt-2 text-xs font-medium text-[#5a5f57]">
          Class average
        </span>
      </div>

      {/* Weekly quizzes card */}
      <div className="min-w-[140px] flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:min-w-[160px]">
        <div className="text-sm font-medium text-[#3d4236]">Weekly quizzes</div>
        <p className="mt-1 text-xs text-[#5a5f57]">
          Short checks after each class. Scores visible to parents.
        </p>
      </div>

      {/* Activity / Progress card */}
      <div className="min-w-[140px] flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:min-w-[160px]">
        <div className="text-sm font-medium text-[#3d4236]">Activity</div>
        <p className="mt-1 text-xs text-[#5a5f57]">
          Attendance, participation, and improvement over time.
        </p>
      </div>
    </div>
  );
}
