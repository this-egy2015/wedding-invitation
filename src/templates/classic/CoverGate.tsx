"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./classic.module.css";
import bouquet from "./assets/bouquet.png";
import glow from "./assets/glow.svg";

type Props = {
  coupleName: string;
  title: string;
  guestName: string | null;
  coverImage: React.ReactNode;
  portraitImage: React.ReactNode;
  musicUrl: string;
  children: React.ReactNode;
};

export function CoverGate({ coupleName, title, guestName, coverImage, portraitImage, musicUrl, children }: Props) {
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const coverRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [opened]);

  useEffect(() => {
    if (opened) contentRef.current?.focus({ preventScroll: true });
  }, [opened]);

  useEffect(() => {
    if (!opening || !coverRef.current) return;
    const finish = () => setOpened(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    // Completion belongs to this animation, not bubbling transition events from the button.
    const animation = coverRef.current.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }],
      { duration: 1500, easing: "linear", fill: "forwards" },
    );
    animation.onfinish = finish;
    return () => { animation.onfinish = null; animation.cancel(); };
  }, [opening]);

  async function toggleMusic(play: boolean) {
    const audio = audioRef.current;
    if (!audio) return;
    if (play) await audio.play().then(() => setPlaying(true), () => setPlaying(false));
    else { audio.pause(); setPlaying(false); }
  }

  function open() {
    if (opening) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    setOpening(true);
    void toggleMusic(true);
  }

  return (
    <div className={styles.shell} data-template="classic">
      {!opened && (
        <section ref={coverRef} className={styles.coverOverlay} data-cover aria-labelledby="couple-name">
          <div className={styles.cover}>
            <div className={styles.coverBackground}>{coverImage}</div>
            <img className={styles.coverGlow} src={glow.src} alt="" />
            <div className={styles.coverScrim} />
            <div className={styles.coverArtwork}>
              <div className={styles.coverPortrait}>{portraitImage}</div>
              <img className={styles.coverBouquet} src={bouquet.src} alt="" />
              <div className={styles.coverCopy}>
                <p className={styles.eyebrow}>{title}</p>
                <h1 id="couple-name">{coupleName}</h1>
                <p className={styles.recipientLabel}>Kepada Yth.</p>
                <p className={styles.recipient}>{guestName ?? "Tamu Undangan"}</p>
                <p className={styles.coverMessage}>Kami mengundang anda untuk hadir<br />di acara pernikahan kami</p>
                <button type="button" onClick={open} disabled={opening} className={styles.openButton}>Buka Undangan</button>
              </div>
            </div>
          </div>
        </section>
      )}
      <div ref={contentRef} tabIndex={-1} className={styles.content} hidden={!opening} inert={!opened} aria-label="Isi undangan">
        {children}
      </div>
      {musicUrl && (
        <>
          <audio ref={audioRef} src={musicUrl} loop preload="none" />
          {opened && <button type="button" onClick={() => void toggleMusic(!playing)} aria-label={playing ? "Matikan musik" : "Putar musik"} className={styles.musicButton}>{playing ? "❚❚" : "♪"}</button>}
        </>
      )}
    </div>
  );
}
