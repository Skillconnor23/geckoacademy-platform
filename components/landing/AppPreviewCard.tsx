"use client";

import Image from "next/image";

/** A clean "App Preview" card. Uses hero gif if available; falls back to a simple UI mock. */
export function AppPreviewCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-3">
      <div className="overflow-hidden rounded-xl bg-slate-50">
        {/* Mock dashboard UI: header + content */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-200">
            <Image
              src="/gecko-logo.svg"
              alt=""
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="ml-auto h-3 w-16 rounded bg-slate-100" />
        </div>
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center p-4">
          {/* Placeholder for class/schedule UI */}
          <div className="flex w-full max-w-xs flex-col gap-2 rounded-lg bg-white p-3 shadow-sm">
            <div className="h-2 w-3/4 rounded bg-slate-200" />
            <div className="h-2 w-1/2 rounded bg-slate-100" />
            <div className="mt-2 flex gap-2">
              <div className="h-8 flex-1 rounded-md bg-[#7daf41]/20" />
              <div className="h-8 flex-1 rounded-md bg-slate-200" />
            </div>
            <div className="flex gap-1 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded bg-slate-200"
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
