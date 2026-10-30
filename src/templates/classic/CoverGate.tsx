"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import bouquet from "./assets/bouquet.png";
import glow from "./assets/glow.svg";

type Props = {
  coupleName: string;
  title: string;
  guestName: string | null;
  /** Full-bleed background photo (next/image with `fill`). */
  coverImage: React.ReactNode;
  /** Photo shown inside the hexagon frame (next/image with `fill`). */
  portraitImage: React.ReactNode;
  musicUrl: string;
  children: React.ReactNode;
};

// Pointy-top hexagon, matching Figma "Polygon 1" (255.5 x 295).
const HEXAGON = "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)";

// Layout follows the Figma cover frame (node 5:2, 390 x 799); offsets are its spacing between layers.
export function CoverGate({ coupleName, title, guestName, coverImage, portraitImage, musicUrl, children }: Props) {
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
            className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-cocoa"
          >
            {/* Figma crops the photo 1.45x larger than cover-fit and 15.6% higher, so the couple sits behind the frame. */}
            <div className="fixed inset-0 -translate-y-[15.6%] scale-[1.45]">{coverImage}</div>
            <div className="fixed inset-0 bg-black/55" />

            <div className="relative flex min-h-full flex-col items-center justify-center">
              <div className="relative flex w-full max-w-[390px] flex-col items-center px-4 pt-[68px] pb-[86px] text-center text-blush">
                {/* Figma stacks this glow under the 55% black overlay; brightness(0.45) over the overlay is equivalent. */}
                <Image
                  src={glow}
                  alt=""
                  className="pointer-events-none absolute top-[396px] left-1/2 h-[529px] w-[812px] max-w-none -translate-x-[calc(50%-29px)] brightness-[0.45]"
                />

                <div className="relative -left-[2.75px] h-[295px] w-[255.5px]">
                  <div className="absolute inset-0" style={{ clipPath: HEXAGON }}>
                    {portraitImage}
                  </div>
                  <div className="pointer-events-none absolute top-[134px] left-[-83.5px] flex h-[145.5px] w-[179.5px] items-center justify-center">
                    <Image src={bouquet} alt="" sizes="163px" className="h-[122px] w-[162.7px] rotate-[8.83deg] object-cover" />
                  </div>
                </div>

                <p className="relative left-[10px] mt-[21px] font-serif text-2xl leading-[1.21] uppercase">{title}</p>
                <h1 className="relative mt-[9px] font-script text-[57px] leading-[48px] text-white">{coupleName}</h1>

                <p className="relative mt-[59px] font-serif text-xl leading-[1.2]">Kepada Yth.</p>
                <p className="relative font-serif text-2xl leading-[1.21]">{guestName ?? "Tamu Undangan"}</p>
                <p className="relative mt-[10px] min-h-[42px] font-serif text-lg leading-[0.95]">
                  Kami mengundang anda untuk hadir
                  <br />
                  di acara pernikahan kami
                </p>

                <button
                  type="button"
                  onClick={open}
                  className="relative mt-[29px] h-[50px] w-[200px] rounded-[25px] bg-terracotta font-serif text-lg font-bold text-white uppercase transition hover:brightness-110"
                >
                  Buka Undangan
                </button>
              </div>
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
