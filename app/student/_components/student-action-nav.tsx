"use client";

import { useRef, useState } from "react";

export default function StudentActionNav() {
  const musicRef = useRef<HTMLAudioElement>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);

  const toggleMusic = async () => {
    const music = musicRef.current;
    if (!music) return;
    if (!music.paused) {
      music.pause();
      setMusicPlaying(false);
      return;
    }
    music.volume = 0.28;
    try {
      await music.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={musicRef}
        src="/audio/monas-streetlamp-wind-364927.mp3"
        loop
        preload="none"
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
        onEnded={() => setMusicPlaying(false)}
      />
      <div className="fixed bottom-4 right-0 z-[200] flex items-center sm:bottom-6">
        <button
          type="button"
          onClick={() => setControlsOpen((open) => !open)}
          className="grid h-9 w-6 place-items-center rounded-l-full border border-r-0 border-white/40 bg-[#fffdf8]/38 text-xl font-light leading-none text-[#51483f]/55 shadow-[0_4px_14px_rgba(45,52,42,0.09)] backdrop-blur-sm transition hover:bg-[#fffdf8]/72 hover:text-[#3f493d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f8770]"
          aria-label={controlsOpen ? "隱藏音樂控制" : "顯示音樂控制"}
          aria-expanded={controlsOpen}
          title={controlsOpen ? "隱藏音樂控制" : "顯示音樂控制"}
        >
          <span aria-hidden="true">{controlsOpen ? "›" : "‹"}</span>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-out ${controlsOpen ? "mr-4 w-12 opacity-100 sm:mr-6" : "mr-0 w-0 opacity-0"}`} aria-hidden={!controlsOpen}>
          <button
            type="button"
            onClick={toggleMusic}
            className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-white/45 bg-[#fffdf8]/45 text-[#51483f]/70 shadow-[0_5px_18px_rgba(45,52,42,0.12)] backdrop-blur-sm transition hover:bg-[#fffdf8]/75 hover:text-[#3f493d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f8770]"
            aria-label={musicPlaying ? "暫停學生區背景音樂" : "播放學生區背景音樂"}
            aria-pressed={musicPlaying}
            tabIndex={controlsOpen ? 0 : -1}
            title={musicPlaying ? "暫停背景音樂" : "播放背景音樂"}
          >
            {musicPlaying ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z"/><path d="M15.2 9.1a4.2 4.2 0 0 1 0 5.8"/><path d="M18 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z"/><path d="m15 9 6 6"/><path d="m21 9-6 6"/></svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
