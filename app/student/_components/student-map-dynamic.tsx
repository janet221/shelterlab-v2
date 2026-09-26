"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StudentProfileModal, { type StudentProfileView } from "./student-profile-modal";
import {
  buildWeekMapNodes,
  getCompletedCount,
  getLearningTool,
  LEARNING_TOOLS,
  type LearningToolKind,
  type StudentMapProgress,
  type WeekMapNode,
  type WeekNumber,
  type WeekStatus
} from "@/lib/student-map";

const STATUS_LABEL: Record<WeekStatus, string> = {
  locked: "未解鎖",
  in_progress: "進行中",
  pending: "等待審核",
  completed: "已完成"
};

const IMAGE_STATE_CLASS: Record<WeekStatus, string> = {
  locked: "grayscale opacity-55 saturate-0",
  in_progress: "opacity-100 saturate-100",
  pending: "opacity-100 saturate-100",
  completed: "opacity-100 saturate-100"
};

const STATUS_BADGE_POSITION: Record<WeekNumber, { left: string; top: string }> = {
  1: { left: "50%", top: "6%" },
  2: { left: "68%", top: "64%" },
  3: { left: "69%", top: "64%" },
  4: { left: "68%", top: "65%" },
  5: { left: "69%", top: "65%" },
  6: { left: "50%", top: "69%" }
};

const MAP_ASPECT_RATIO = 16 / 9;

type StageSize = {
  width: number;
  height: number;
};

function useViewportCoverStage() {
  const [stageSize, setStageSize] = useState<StageSize | null>(null);

  useEffect(() => {
    const updateStageSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const viewportRatio = viewportWidth / viewportHeight;

      if (viewportRatio >= MAP_ASPECT_RATIO) {
        setStageSize({
          width: viewportWidth,
          height: viewportWidth / MAP_ASPECT_RATIO
        });
      } else {
        setStageSize({
          width: viewportHeight * MAP_ASPECT_RATIO,
          height: viewportHeight
        });
      }
    };

    updateStageSize();
    window.addEventListener("resize", updateStageSize);

    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  return stageSize;
}

function MapBackground() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="absolute inset-0 bg-[linear-gradient(#d7ebf4_0_32%,#bfd79d_32%_100%)]" />;
  }

  return (
    <img
      src="/student-map/map-background.webp?v=20260915-user-background-v2"
      alt="六週學習地圖背景"
      draggable={false}
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full select-none object-fill"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill" }}
    />
  );
}

function LearningToolIcon({ kind, muted = false }: { kind: LearningToolKind; muted?: boolean }) {
  const tool = LEARNING_TOOLS.find((item) => item.kind === kind);

  if (!tool) return null;

  return (
    <img
      src={tool.image}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`h-full w-full rounded-md object-contain ${muted ? "grayscale opacity-45" : ""}`}
    />
  );
}

function StatusBadge({ node }: { node: WeekMapNode }) {
  const config = node.status === "locked"
    ? { symbol: "🔒", cls: "bg-[#77736D]", text: "未解鎖" }
    : node.status === "pending"
      ? { symbol: "⌛", cls: "bg-[#C58F3D]", text: "等待審核" }
      : node.status === "completed"
        ? { symbol: "✓", cls: "bg-[#5E9163]", text: "已完成" }
        : { symbol: "▶", cls: "bg-[#E0AD43]", text: "進入關卡" };

  const position = STATUS_BADGE_POSITION[node.week];

  return (
    <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: position.left, top: position.top }}>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FFF9EE] text-sm font-black text-white shadow-[0_3px_9px_rgba(61,52,42,0.24)] sm:h-11 sm:w-11 sm:text-base ${config.cls}`}
        title={config.text}
        aria-label={config.text}
      >
        {config.symbol}
      </div>
    </div>
  );
}

function WeekArtwork({ node }: { node: WeekMapNode }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[48%] border-4 border-[#E8DCCB] bg-[#FFF8EC]/95 px-5 text-center text-sm font-bold text-[#685B50] shadow-md">
        {node.label}<br />{node.title}
      </div>
    );
  }

  return (
    <div
      className="flex aspect-square w-full items-center justify-center"
      style={{ display: "flex", width: "100%", height: "100%", aspectRatio: "1 / 1" }}
    >
      <img
        src={`/student-map/week-${node.week}.png?v=20260915-lock-overlay-only-v2`}
        alt={`${node.label} ${node.title}`}
        draggable={false}
        onError={() => setFailed(true)}
        className={`block h-full w-full select-none object-contain object-center transition-[filter,opacity] duration-300 ${IMAGE_STATE_CLASS[node.status]}`}
        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
      />
    </div>
  );
}

function EarnedToolBadge({ node }: { node: WeekMapNode }) {
  if (node.status !== "completed" || node.week === 6) return null;
  const tool = getLearningTool(node.week);

  return (
    <div
      className="absolute right-[2%] top-[3%] z-20 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#FFF8E7] bg-[#FFF4CF] p-1 shadow-[0_4px_10px_rgba(80,60,30,0.22)] sm:h-10 sm:w-10"
      title={`已獲得：${tool.name}`}
      aria-label={`已獲得 ${tool.name}`}
    >
      <LearningToolIcon kind={tool.kind} />
    </div>
  );
}

function WeekNodeButton({ node }: { node: WeekMapNode }) {
  const router = useRouter();
  const locked = node.week !== 1 && node.status === "locked";

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => !locked && router.push(node.route)}
      aria-label={`${node.label} ${node.title}，${STATUS_LABEL[node.status]}`}
      title={`${node.label}｜${node.title}｜${STATUS_LABEL[node.status]}`}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E0B14C]/70 disabled:cursor-not-allowed"
      style={{
        position: "absolute",
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: "clamp(105px, 10.5vw, 170px)",
        aspectRatio: "1 / 1",
        transform: "translate(-50%, -50%)",
        padding: 0,
        border: 0,
        background: "transparent"
      }}
    >
      <div
        className={`relative transition-transform duration-200 ease-out ${
          locked
            ? ""
            : node.status === "in_progress"
              ? "drop-shadow-[0_0_15px_rgba(56,145,132,0.42)] group-hover:scale-[1.055]"
              : "group-hover:scale-[1.035]"
        }`}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <WeekArtwork node={node} />
        <StatusBadge node={node} />
        <EarnedToolBadge node={node} />

        {node.status === "pending" && (
          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#D0AF72] bg-[#FFF8E8]/95 px-3 py-1 text-[11px] font-bold text-[#72582B] shadow-sm">
            等待審核
          </div>
        )}

        {node.status === "in_progress" && (
          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#DDBB6D] bg-[#FFF8E5]/95 px-3 py-1 text-[11px] font-bold text-[#6C5424] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
            點擊進入
          </div>
        )}
      </div>
    </button>
  );
}

function ToolInventory({ progress }: { progress: StudentMapProgress }) {
  const [open, setOpen] = useState(false);
  const earnedWeeks = new Set(
    progress.weeks.filter((item) => item.status === "completed").map((item) => item.week)
  );
  const earnedCount = LEARNING_TOOLS.filter((tool) => earnedWeeks.has(tool.week)).length;

  return (
    <div className="relative z-40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-white/75 bg-[#FFFDF8]/94 px-4 py-2 shadow-sm backdrop-blur-sm transition hover:bg-white"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[#51483F] sm:text-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E8C66D]/35 text-[11px]">▣</span>
          <span>探索工具 {earnedCount}/5</span>
        </div>
        <div className="mt-1 flex gap-1.5">
          {LEARNING_TOOLS.map((tool) => {
            const earned = earnedWeeks.has(tool.week);
            return (
              <span
                key={tool.week}
                className={`block h-1.5 w-4 rounded-full ${earned ? "bg-[#C89832]" : "bg-[#DDD6CC]"}`}
              />
            );
          })}
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+10px)] w-[330px] rounded-2xl border border-[#E0D5C6] bg-[#FFFDF8]/97 p-3 shadow-[0_14px_34px_rgba(68,55,40,0.18)] backdrop-blur-md sm:w-[390px]">
          <div className="px-2 pb-2">
            <p className="text-sm font-black text-[#443A31]">探索工具包</p>
            <p className="mt-1 text-xs leading-5 text-[#776B60]">完成一週取得工具，下一週只啟用指定的一件；第五週工具作為最終收藏。</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LEARNING_TOOLS.map((tool) => {
              const earned = earnedWeeks.has(tool.week);
              return (
                <div
                  key={tool.week}
                  className={`flex min-h-[76px] gap-3 rounded-xl border p-2.5 ${
                    earned
                      ? "border-[#DFC27A] bg-[#FFF8E7]"
                      : "border-[#E7E2DB] bg-[#F4F1EC] opacity-60"
                  }`}
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white/75 p-1">
                    <LearningToolIcon kind={tool.kind} muted={!earned} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#4A4037]">{earned ? tool.name : `第 ${tool.week} 週`}</p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#776B60]">
                      {earned ? tool.description : "完成關卡後取得"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

export default function StudentMapDynamic({ profile, progress, onIdentitySaved }: { profile: StudentProfileView; progress: StudentMapProgress; onIdentitySaved: (identity: { realName: string; studentNumber: string }) => void }) {
  const nodes = buildWeekMapNodes(progress.weeks);
  const completed = getCompletedCount(progress.weeks);
  const progressPercent = Math.round((completed / 6) * 100);
  const stageSize = useViewportCoverStage();
  const [profileOpen, setProfileOpen] = useState(profile.requiresIdentity);

  useEffect(() => {
    if (profile.requiresIdentity) setProfileOpen(true);
  }, [profile.requiresIdentity]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  return (
    <main
      className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[#F6F1E8]"
      aria-label="ShelterLab 六週學習地圖"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", overflow: "hidden" }}
    >
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden -translate-x-1/2 -translate-y-1/2"
        style={
          stageSize
            ? {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${stageSize.width}px`,
                height: `${stageSize.height}px`,
                overflow: "hidden",
                transform: "translate(-50%, -50%)"
              }
            : {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "100vw",
                height: "100dvh",
                overflow: "hidden",
                transform: "translate(-50%, -50%)"
              }
        }
      >
        <MapBackground />

        {nodes.map((node) => (
          <WeekNodeButton key={node.week} node={node} />
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-[#536743]/10 to-transparent" />
      </div>

      <div className="fixed left-4 top-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-start gap-2 sm:left-6 sm:top-6">
        <Link href="/" className="rounded-full border border-white/75 bg-[#FFFDF8]/94 px-4 py-2 text-xs font-bold text-[#51483F] shadow-sm backdrop-blur-sm transition hover:bg-white sm:text-sm">← 返回首頁</Link>

        <div className="rounded-full border border-white/75 bg-[#FFFDF8]/94 px-4 py-2 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#51483F] sm:text-sm">
            <span aria-hidden="true">◆</span>
            <span>闖關進度 {completed}/6</span>
          </div>
          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[#E7E0D7] sm:w-32">
            <div
              className="h-full rounded-full bg-[#6C9270] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ToolInventory progress={progress} />

        <button type="button" onClick={() => setProfileOpen(true)} className="rounded-full border border-white/75 bg-[#FFFDF8]/94 px-4 py-2 text-xs font-bold text-[#51483F] shadow-sm backdrop-blur-sm transition hover:bg-white sm:text-sm">個人中心</button>
      </div>

      <StudentProfileModal
        open={profileOpen}
        profile={profile}
        weeks={progress.weeks}
        onClose={() => { if (!profile.requiresIdentity) setProfileOpen(false); }}
        onSaved={(identity) => { onIdentitySaved(identity); setProfileOpen(false); }}
      />
    </main>
  );
}
