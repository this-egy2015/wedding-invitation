"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listWishesAction, type WishItem } from "@/features/rsvp/wishes";
import styles from "./classic.module.css";

export function WishList({ slug, refreshKey }: { slug: string; refreshKey: number }) {
  const [items, setItems] = useState<WishItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);
  const requestRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (reset: boolean) => {
    if (!reset && inFlightRef.current) return;
    inFlightRef.current = true;
    const requestId = ++requestRef.current;
    const offset = reset ? 0 : offsetRef.current;
    setLoading(true);
    try {
      const result = await listWishesAction(slug, offset);
      if (requestId !== requestRef.current) return;
      setItems((previous) => (reset ? result.items : [...previous, ...result.items]));
      offsetRef.current = offset + result.items.length;
      setHasMore(result.hasMore);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        inFlightRef.current = false;
      }
    }
  }, [slug]);

  useEffect(() => {
    offsetRef.current = 0;
    void load(true);
  }, [load, refreshKey]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void load(false);
      },
      { root: rootRef.current, rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [load, hasMore, loading]);

  return (
    <div className={styles.wishes} ref={rootRef} aria-label="Ucapan tamu" aria-live="polite">
      {items.length === 0 && !loading && <p className={styles.emptyWishes}>Belum ada ucapan.</p>}
      {items.map((wish) => (
        <article key={wish.id}>
          <h3>{[wish.name, wish.partnerName].filter(Boolean).join(" & ")}</h3>
          <p>{wish.wish}</p>
        </article>
      ))}
      {loading && <p className={styles.emptyWishes}>Memuat ucapan...</p>}
      <div ref={sentinelRef} className={styles.wishSentinel} aria-hidden="true" />
    </div>
  );
}
