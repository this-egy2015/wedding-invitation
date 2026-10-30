"use client";

import { useEffect, useState } from "react";

const UNITS = [
  ["Hari", 86_400_000],
  ["Jam", 3_600_000],
  ["Menit", 60_000],
  ["Detik", 1_000],
] as const;

/** `target` is an absolute epoch ms computed on the server in the event time zone. */
export function Countdown({ target }: { target: number }) {
  // null until mounted: server and client clocks differ, so render nothing time-based on the server.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="h-16" />;

  let remaining = Math.max(0, target - now);
  if (remaining === 0) return <p className="font-serif text-xl">Hari bahagia telah tiba</p>;

  return (
    <div className="grid grid-cols-4 gap-2">
      {UNITS.map(([label, ms]) => {
        const value = Math.floor(remaining / ms);
        remaining -= value * ms;
        return (
          <div key={label} className="rounded-lg bg-white/70 py-3">
            <p className="font-serif text-3xl tabular-nums">{value}</p>
            <p className="text-xs tracking-wide text-neutral-600 uppercase">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
