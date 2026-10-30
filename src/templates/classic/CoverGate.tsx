"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

type Props = {
  coupleName: string;
  guestName: string | null;
  coverImage: React.ReactNode;
  musicUrl: string;
  children: React.ReactNode;
};

export function CoverGate({ coupleName, guestName, coverImage, musicUrl, children }: Props) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function toggleMusic(play: boolean) {
    const audio = audioRef.current;
    if (!audio) return;
    if (play) {
      // play() rejects if the browser blocks playback; leave the button in the paused state.
      await audio.play().then(() => setPlaying(true), () => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function open() {
    setOpened(true);
    // Music starts only after this user interaction, never on page load.
    void toggleMusic(true);
  }

  return (
    <>
      <AnimatePresence>
        {!opened && (
          <motion.section
            key="cover"
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink"
          >
            <div className="absolute inset-0 opacity-60">{coverImage}</div>
            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-6 text-center text-ivory">
              <p className="text-xs tracking-[0.3em] uppercase">The Wedding of</p>
              <h1 className="mt-3 font-serif text-5xl">{coupleName}</h1>
              <div className="mt-10 text-sm">
                <p className="opacity-80">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                <p className="mt-2 font-serif text-2xl">{guestName ?? "Tamu Undangan"}</p>
              </div>
              <button
                type="button"
                onClick={open}
                className="mt-8 rounded-full bg-ivory px-6 py-2.5 text-sm font-medium text-ink hover:bg-sand"
              >
                Buka Undangan
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {children}

      {musicUrl && (
        <>
          <audio ref={audioRef} src={musicUrl} loop preload="none" />
          {opened && (
            <button
              type="button"
              onClick={() => toggleMusic(!playing)}
              aria-label={playing ? "Matikan musik" : "Putar musik"}
              className="fixed right-4 bottom-4 z-40 flex size-11 items-center justify-center rounded-full bg-ink text-ivory shadow-lg"
            >
              {playing ? "❚❚" : "♪"}
            </button>
          )}
        </>
      )}
    </>
  );
}
