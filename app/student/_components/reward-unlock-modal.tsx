"use client";

import { useEffect, useRef } from "react";
import { getLearningTool, type WeekNumber } from "@/lib/student-map";

type RewardUnlockModalProps = {
  week: WeekNumber;
  open: boolean;
  onClose: () => void;
};

export default function RewardUnlockModal({
  week,
  open,
  onClose
}: RewardUnlockModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reward = getLearningTool(week);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    buttonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#302a24]/45 px-4 py-6 backdrop-blur-[2px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-unlock-title"
        aria-describedby="reward-unlock-description"
        className="w-full max-w-[420px] rounded-[28px] border-[3px] border-[#67594b] bg-[#fffaf0] px-6 py-7 text-center shadow-[0_24px_70px_rgba(45,37,29,0.32)]"
      >
        <p className="text-xs font-black tracking-[0.16em] text-[#8a745d]">第 {week} 週關卡完成</p>
        <h2 id="reward-unlock-title" className="mt-2 font-serif text-3xl font-black text-[#39736a]">
          取得新的探究工具
        </h2>

        <div className="mx-auto mt-5 flex h-[200px] w-[200px] items-center justify-center rounded-[34px] border-2 border-[#ddcca8] bg-[#fff5d9] p-3 shadow-inner">
          <img
            src={reward.image}
            alt={reward.name}
            draggable={false}
            className="h-full w-full rounded-[26px] object-contain"
          />
        </div>

        <h3 className="mt-5 text-2xl font-black text-[#443a31]">{reward.name}</h3>
        <p id="reward-unlock-description" className="mx-auto mt-2 max-w-[330px] text-sm font-semibold leading-7 text-[#6d6258]">
          {reward.description}
        </p>

        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="mt-6 min-h-11 rounded-full border-2 border-[#315f56] bg-[#4d8375] px-8 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#3f7064] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9fc8b8]"
        >
          收下工具
        </button>
      </section>
    </div>
  );
}
