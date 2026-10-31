"use client";

import { useEffect, useState } from "react";
import styles from "./classic.module.css";
import circle from "./assets/countdown-circle.svg";

const units = [["Hari", 86_400_000], ["Jam", 3_600_000], ["Menit", 60_000], ["Detik", 1_000]] as const;

export function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  let remaining = now === null ? 0 : Math.max(0, target - now);
  return (
    <div className={styles.countdown} aria-label="Hitung mundur menuju resepsi">
      {units.map(([label, ms]) => {
        const value = Math.floor(remaining / ms);
        remaining -= value * ms;
        return <div key={label}><img src={circle.src} alt="" /><strong>{now === null ? "–" : value}</strong><span>{label}</span></div>;
      })}
    </div>
  );
}
