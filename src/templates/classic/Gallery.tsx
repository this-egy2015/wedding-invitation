"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./classic.module.css";

export function Gallery({ urls, coupleName }: { urls: string[]; coupleName: string }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const interaction = useRef({ held: false, lastX: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const looping = urls.length > 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery || !looping || reducedMotion) return;
    let visible = false;
    let previous = 0;
    let position = gallery.scrollLeft;
    let lastScrollLeft = position;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(gallery);

    const advance = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      // Keep native wheel/swipe changes instead of restoring the previous animation position.
      if (gallery.scrollLeft !== lastScrollLeft) position = gallery.scrollLeft;
      if (visible && !document.hidden && !interaction.current.held) {
        const first = gallery.children[0] as HTMLElement;
        const repeat = gallery.children[urls.length] as HTMLElement;
        const distance = repeat.offsetLeft - first.offsetLeft;
        if (distance > 0) {
          // A repeated strip makes the last-to-first boundary visually continuous.
          // Prototype travels 9,029 pixels in 146.98 seconds.
          position = (position + elapsed * .06143) % distance;
          gallery.scrollLeft = position;
        }
      } else position = gallery.scrollLeft;
      lastScrollLeft = gallery.scrollLeft;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [looping, reducedMotion, urls.length]);

  // Native panning cancels pointer events before the finger lifts; touchend tracks the actual release.
  return (
    <div
      ref={galleryRef}
      className={styles.gallery}
      tabIndex={0}
      role="region"
      aria-label="Galeri Momen Kami, geser untuk melihat foto berikutnya"
      onPointerDown={(event) => {
        if (event.pointerType === "touch" || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        interaction.current = { held: true, lastX: event.clientX };
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "touch" || !interaction.current.held) return;
        event.currentTarget.scrollLeft += interaction.current.lastX - event.clientX;
        interaction.current.lastX = event.clientX;
      }}
      onPointerUp={(event) => { if (event.pointerType !== "touch") interaction.current.held = false; }}
      onPointerCancel={(event) => { if (event.pointerType !== "touch") interaction.current.held = false; }}
      onLostPointerCapture={(event) => { if (event.pointerType !== "touch") interaction.current.held = false; }}
      onTouchStart={() => { interaction.current.held = true; }}
      onTouchEnd={(event) => { interaction.current.held = event.touches.length > 0; }}
      onTouchCancel={(event) => { interaction.current.held = event.touches.length > 0; }}
    >
      {(looping ? [...urls, ...urls] : urls).map((url, index) => (
        <div className={styles.galleryPhoto} key={`${index}-${url}`} aria-hidden={index >= urls.length ? true : undefined}>
          <Image src={url} alt={index < urls.length ? `Momen ${coupleName} ${index + 1}` : ""} fill sizes="300px" className={styles.photo} draggable={false} />
        </div>
      ))}
    </div>
  );
}
