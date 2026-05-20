"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateDraft, nextStep, prevStep } from "@/app/store/listingSlice";
import { useState, useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDay = first.getDay();
  return { lastDay, startDay };
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function AvailabilityStep() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState<string | null>(null);

  const { lastDay, startDay } = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDates = useMemo(() => {
    const set = new Set<string>();
    draft.availableRanges.forEach(({ start, end }) => {
      const s = new Date(start);
      const e = new Date(end);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        set.add(d.toISOString().slice(0, 10));
      }
    });
    return set;
  }, [draft.availableRanges]);

  const blockedSet = useMemo(() => new Set(draft.blockedDates), [draft.blockedDates]);

  function toggleDate(dateStr: string) {
    if (blockedSet.has(dateStr)) {
      dispatch(updateDraft({ blockedDates: draft.blockedDates.filter((d) => d !== dateStr) }));
      return;
    }

    if (selectedDates.has(dateStr)) {
      const newRanges = draft.availableRanges.filter(({ start, end }) => {
        const s = new Date(start);
        const e = new Date(end);
        const d = new Date(dateStr);
        return d < s || d > e;
      });
      dispatch(updateDraft({ availableRanges: newRanges }));
      return;
    }

    if (selecting) {
      const start = selecting < dateStr ? selecting : dateStr;
      const end = selecting > dateStr ? selecting : dateStr;
      dispatch(updateDraft({ availableRanges: [...draft.availableRanges, { start, end }] }));
      setSelecting(null);
    } else {
      setSelecting(dateStr);
      dispatch(updateDraft({ availableRanges: [...draft.availableRanges, { start: dateStr, end: dateStr }] }));
    }
  }

  function blockDate(dateStr: string) {
    if (blockedSet.has(dateStr)) {
      dispatch(updateDraft({ blockedDates: draft.blockedDates.filter((d) => d !== dateStr) }));
    } else {
      dispatch(updateDraft({ blockedDates: [...draft.blockedDates, dateStr] }));
      const newRanges = draft.availableRanges.filter(({ start, end }) => {
        const s = new Date(start);
        const e = new Date(end);
        const d = new Date(dateStr);
        return d < s || d > e;
      });
      dispatch(updateDraft({ availableRanges: newRanges }));
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function selectAllWeekdays() {
    const newRanges = [...draft.availableRanges];
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const day = date.getDay();
      const dateStr = toDateStr(viewYear, viewMonth, d);
      if (day >= 1 && day <= 5 && !selectedDates.has(dateStr) && !blockedSet.has(dateStr)) {
        newRanges.push({ start: dateStr, end: dateStr });
      }
    }
    dispatch(updateDraft({ availableRanges: newRanges }));
  }

  function clearMonth() {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    dispatch(updateDraft({
      availableRanges: draft.availableRanges.filter(({ start }) => !start.startsWith(monthPrefix)),
      blockedDates: draft.blockedDates.filter((d) => !d.startsWith(monthPrefix)),
    }));
  }

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Availability</h2>
        <p className="text-muted-foreground text-sm mt-1">Set when your item is available for rent. Click dates to select, right-click to block.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <h3 className="font-bold text-accent font-heading">{MONTHS[viewMonth]} {viewYear}</h3>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2">{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: lastDay }).map((_, i) => {
                const day = i + 1;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const isPast = dateStr < todayStr;
                const isSelected = selectedDates.has(dateStr);
                const isBlocked = blockedSet.has(dateStr);
                const isSelecting = selecting === dateStr;

                return (
                  <button
                    key={day}
                    disabled={isPast}
                    onClick={() => toggleDate(dateStr)}
                    onContextMenu={(e) => { e.preventDefault(); blockDate(dateStr); }}
                    className={`aspect-square rounded-xl text-sm font-semibold transition-all ${
                      isPast ? "text-muted-foreground/30 cursor-not-allowed"
                      : isBlocked ? "bg-destructive/10 text-destructive border border-destructive/20 line-through"
                      : isSelected ? "bg-primary text-white shadow-sm"
                      : isSelecting ? "bg-primary/30 text-primary ring-2 ring-primary"
                      : "hover:bg-muted text-accent"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={selectAllWeekdays} className="text-xs font-semibold text-primary hover:underline">Select Weekdays</button>
              <span className="text-border">|</span>
              <button onClick={clearMonth} className="text-xs font-semibold text-destructive hover:underline">Clear Month</button>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" /> Blocked</span>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        <div className="space-y-5">
          <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-5">
            <h3 className="font-bold text-accent font-heading text-sm">Rental Settings</h3>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Quantity Available</label>
              <input type="number" value={draft.quantity} onChange={(e) => dispatch(updateDraft({ quantity: Math.max(1, Number(e.target.value)) }))} min="1" className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              <p className="text-[10px] text-muted-foreground">Number of identical items.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Max Concurrent Bookings</label>
              <input type="number" value={draft.maxConcurrent} onChange={(e) => dispatch(updateDraft({ maxConcurrent: Math.max(1, Number(e.target.value)) }))} min="1" className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Buffer Days Between Bookings</label>
              <input type="number" value={draft.bufferDays} onChange={(e) => dispatch(updateDraft({ bufferDays: Math.max(0, Number(e.target.value)) }))} min="0" className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              <p className="text-[10px] text-muted-foreground">Rest days after each rental for cleaning / maintenance.</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-primary">💡 Tip</p>
            <p className="text-xs text-muted-foreground">Click to mark dates available. Right-click to block dates for maintenance. Use quick actions below the calendar for bulk operations.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch(prevStep())} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <button onClick={() => dispatch(nextStep())} className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30 transition-all">
          Next: Location
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
