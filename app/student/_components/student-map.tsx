"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildWeekMapNodes,
  getCompletedCount,
  type StudentMapProgress,
  type WeekMapNode,
  type WeekStatus,
  type WeekVisual
} from "@/lib/student-map";

const statusText: Record<WeekStatus, string> = {
  locked: "未解鎖",
  in_progress: "進行中",
  pending: "等待審核",
  completed: "已完成"
};

const statusClass: Record<WeekStatus, string> = {
  locked: "grayscale opacity-50 cursor-not-allowed",
  in_progress:
    "cursor-pointer hover:scale-[1.045] drop-shadow-[0_0_16px_rgba(224,177,76,0.72)]",
  pending:
    "cursor-pointer hover:scale-[1.025] drop-shadow-[0_0_14px_rgba(194,147,73,0.52)]",
  completed:
    "cursor-pointer hover:scale-[1.045] drop-shadow-[0_0_14px_rgba(93,139,96,0.58)]"
};

function VectorMapBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8E3F1" />
          <stop offset="100%" stopColor="#EFF3E7" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9DEA8" />
          <stop offset="100%" stopColor="#AFC58C" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B5DEE4" />
          <stop offset="100%" stopColor="#75B8C7" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#5F5549" floodOpacity="0.16" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />
      <path
        d="M0 250 C210 110 420 225 610 148 C810 70 985 220 1190 135 C1375 58 1500 120 1600 105 L1600 430 L0 430 Z"
        fill="#90B28A"
        opacity="0.75"
      />
      <path
        d="M0 308 C250 195 440 320 650 230 C870 138 1040 300 1250 210 C1425 135 1535 190 1600 175 L1600 470 L0 470 Z"
        fill="#A6C49A"
      />
      <rect y="338" width="1600" height="562" fill="url(#grass)" />

      <path
        d="M835 500 C920 454 1000 456 1095 485 C1225 525 1305 615 1600 625 L1600 850 C1390 828 1240 785 1120 720 C1000 654 916 605 805 557 Z"
        fill="url(#water)"
      />
      <path
        d="M882 521 C1020 493 1135 535 1230 590"
        fill="none"
        stroke="#DDF2F3"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path
        d="M175 690 C260 635 345 585 470 535 C575 494 660 480 740 414 C835 334 950 318 1075 343 C1205 370 1290 430 1445 462"
        fill="none"
        stroke="#E5C48A"
        strokeWidth="50"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M175 690 C260 635 345 585 470 535 C575 494 660 480 740 414 C835 334 950 318 1075 343 C1205 370 1290 430 1445 462"
        fill="none"
        stroke="#F4DEAE"
        strokeWidth="33"
        strokeLinecap="round"
        strokeDasharray="3 28"
      />
      <path d="M620 500 C660 590 725 670 820 760" fill="none" stroke="#E5C48A" strokeWidth="46" strokeLinecap="round" />
      <path d="M620 500 C660 590 725 670 820 760" fill="none" stroke="#F4DEAE" strokeWidth="30" strokeLinecap="round" strokeDasharray="3 28" />

      <g filter="url(#softShadow)">
        <path d="M760 516 C815 478 875 478 930 516 L930 554 C874 522 814 523 760 557 Z" fill="#806047" />
        <path d="M772 508 C820 480 870 480 918 507" fill="none" stroke="#C39668" strokeWidth="15" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={786 + i * 30} y1={497} x2={786 + i * 30} y2={550} stroke="#654B3A" strokeWidth="5" />
        ))}
      </g>

      {[
        [110, 360], [285, 310], [500, 355], [720, 285], [900, 280],
        [1180, 265], [1420, 320], [235, 610], [510, 690], [1325, 720]
      ].map(([x, y], index) => (
        <g key={index} transform={`translate(${x} ${y})`} opacity="0.94">
          <rect x="-7" y="22" width="14" height="40" rx="6" fill="#766147" />
          <circle cx="0" cy="0" r="37" fill="#788F61" />
          <circle cx="-23" cy="12" r="24" fill="#8AA16D" />
          <circle cx="24" cy="12" r="26" fill="#6E8759" />
        </g>
      ))}
    </svg>
  );
}

function MapBackground() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) return <VectorMapBackground />;

  return (
    <img
      src="/student-map/map-background.webp?v=20260915-user-background-v2"
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setImageFailed(true)}
      draggable={false}
    />
  );
}

function DogFace({ visual }: { visual: Exclude<WeekVisual, "shelter"> }) {
  if (visual === "poodle") {
    return (
      <g transform="translate(110 151)">
        {[[0,-32],[-25,-24],[25,-24],[-31,0],[31,0],[-18,20],[18,20]].map(([x,y], index) => (
          <circle key={index} cx={x} cy={y} r="23" fill="#FAF8F2" stroke="#D5D1C8" strokeWidth="2" />
        ))}
        <circle cx="-11" cy="-10" r="4" fill="#302A26" />
        <circle cx="11" cy="-10" r="4" fill="#302A26" />
        <circle cx="0" cy="1" r="5" fill="#302A26" />
        <path d="M-9 10 Q0 18 9 10" fill="none" stroke="#8A5A51" strokeWidth="3" />
      </g>
    );
  }

  if (visual === "bulldog") {
    return (
      <g transform="translate(110 154)">
        <ellipse cx="0" cy="26" rx="38" ry="29" fill="#8D7669" />
        <circle cx="0" cy="-7" r="35" fill="#9D8577" />
        <path d="M-31 -27 L-14 -38 L-18 -12 Z" fill="#665248" />
        <path d="M31 -27 L14 -38 L18 -12 Z" fill="#665248" />
        <ellipse cx="0" cy="6" rx="23" ry="16" fill="#E8DDD2" />
        <circle cx="-12" cy="-11" r="4" fill="#282321" />
        <circle cx="12" cy="-11" r="4" fill="#282321" />
        <circle cx="0" cy="1" r="5" fill="#282321" />
        <path d="M-13 13 Q0 19 13 13" fill="none" stroke="#79534A" strokeWidth="3" />
      </g>
    );
  }

  const isShepherd = visual === "shepherd";
  const isCorgi = visual === "corgi";
  const isRetriever = visual === "retriever";
  const body = isShepherd ? "#B77A47" : isCorgi ? "#C97843" : "#D5A35E";
  const dark = isShepherd ? "#44352F" : isCorgi ? "#9E5838" : "#B67F46";
  const muzzle = isShepherd ? "#B98C68" : isCorgi ? "#F4E2CE" : "#E5BD7F";

  return (
    <g transform="translate(110 150)">
      <ellipse cx="0" cy="28" rx="35" ry="30" fill={body} />
      {isRetriever ? (
        <>
          <ellipse cx="-32" cy="-12" rx="13" ry="29" fill={dark} transform="rotate(14 -32 -12)" />
          <ellipse cx="32" cy="-12" rx="13" ry="29" fill={dark} transform="rotate(-14 32 -12)" />
        </>
      ) : (
        <>
          <path d="M-31 -18 L-20 -53 L-5 -20 Z" fill={dark} />
          <path d="M31 -18 L20 -53 L5 -20 Z" fill={dark} />
        </>
      )}
      <circle cx="0" cy="-9" r="34" fill={body} />
      {isShepherd && <path d="M-25 -26 Q0 -43 25 -26 L18 -2 Q0 -14 -18 -2 Z" fill="#44352F" opacity="0.92" />}
      <ellipse cx="0" cy="5" rx="20" ry="15" fill={muzzle} />
      <circle cx="-12" cy="-12" r="4" fill="#29231F" />
      <circle cx="12" cy="-12" r="4" fill="#29231F" />
      <circle cx="0" cy="0" r="5" fill="#29231F" />
      <path d="M-8 10 Q0 17 8 10" fill="none" stroke="#80534B" strokeWidth="3" strokeLinecap="round" />
      {isCorgi && <path d="M-27 14 Q0 34 27 14 L24 35 Q0 45 -24 35 Z" fill="#F4E2CE" opacity="0.96" />}
    </g>
  );
}

function DogHouse({ node }: { node: WeekMapNode }) {
  return (
    <svg viewBox="0 0 220 238" className="h-auto w-full" aria-hidden="true">
      <ellipse cx="110" cy="220" rx="78" ry="10" fill="#635A4E" opacity="0.18" />
      <path d="M37 88 L110 24 L183 88 L167 99 L110 52 L53 99 Z" fill={node.roof} stroke="#6D594A" strokeWidth="5" strokeLinejoin="round" />
      <rect x="55" y="85" width="110" height="126" rx="13" fill="#EFE4D0" stroke="#8C7562" strokeWidth="5" />
      <path d="M75 211 V145 Q75 110 110 110 Q145 110 145 145 V211 Z" fill="#675044" />
      <DogFace visual={node.visual as Exclude<WeekVisual, "shelter">} />
      <rect x="63" y="77" width="94" height="35" rx="16" fill="#F6EAD5" stroke="#8C7562" strokeWidth="4" />
      <text x="110" y="101" textAnchor="middle" fontSize="18" fontWeight="800" fill="#3C332D" style={{ fontFamily: "NotoSerifTC, serif" }}>
        {node.label}
      </text>
    </svg>
  );
}

function ShelterGate({ node }: { node: WeekMapNode }) {
  return (
    <svg viewBox="0 0 240 245" className="h-auto w-full" aria-hidden="true">
      <ellipse cx="120" cy="226" rx="92" ry="11" fill="#5F5A52" opacity="0.18" />
      <rect x="45" y="78" width="150" height="130" rx="10" fill="#E7E4DE" stroke="#74716C" strokeWidth="5" />
      <path d="M34 86 L120 22 L206 86 L190 99 L120 48 L50 99 Z" fill="#89979A" stroke="#666D6E" strokeWidth="5" />
      <circle cx="120" cy="75" r="18" fill="#F3EFE6" stroke="#77736D" strokeWidth="3" />
      <circle cx="120" cy="75" r="7" fill="#746B62" />
      <circle cx="108" cy="65" r="5" fill="#746B62" />
      <circle cx="132" cy="65" r="5" fill="#746B62" />
      <rect x="58" y="122" width="124" height="86" fill="#5D6365" />
      {[72,92,112,132,152,172].map((x) => <rect key={x} x={x} y="122" width="7" height="86" rx="2" fill="#C7CBC9" />)}
      <rect x="55" y="151" width="130" height="8" fill="#C7CBC9" />
      <rect x="69" y="198" width="102" height="33" rx="15" fill="#F4E8D3" stroke="#807469" strokeWidth="4" />
      <text x="120" y="221" textAnchor="middle" fontSize="18" fontWeight="800" fill="#3C332D" style={{ fontFamily: "NotoSerifTC, serif" }}>
        {node.label}
      </text>
    </svg>
  );
}

function VectorNode({ node }: { node: WeekMapNode }) {
  return node.visual === "shelter" ? <ShelterGate node={node} /> : <DogHouse node={node} />;
}

function NodeVisual({ node }: { node: WeekMapNode }) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = `/student-map/week-${node.week}.webp?v=20260915-lock-overlay-only-v2`;

  if (imageFailed) return <VectorNode node={node} />;

  return (
    <img
      src={src}
      alt=""
      className="h-auto w-full select-none"
      draggable={false}
      onError={() => setImageFailed(true)}
    />
  );
}

function StatusBadge({ status }: { status: WeekStatus }) {
  const config = status === "locked"
    ? { symbol: "🔒", cls: "bg-[#6F6C68]" }
    : status === "pending"
      ? { symbol: "⌛", cls: "bg-[#C58F3D]" }
      : status === "completed"
        ? { symbol: "✓", cls: "bg-[#5E9163]" }
        : { symbol: "▶", cls: "bg-[#E0B14C]" };

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-lg font-black text-white shadow-md ${config.cls}`} title={statusText[status]}>
      {config.symbol}
    </div>
  );
}

function WeekNodeButton({ node }: { node: WeekMapNode }) {
  const router = useRouter();
  const locked = node.status === "locked";

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => !locked && router.push(node.route)}
      aria-label={`${node.label} ${node.title}，${statusText[node.status]}`}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-[28%] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E0B14C]/70"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: node.visual === "shelter" ? "clamp(135px, 15.5vw, 245px)" : "clamp(118px, 13.7vw, 218px)"
      }}
    >
      <div className={`relative transition-all duration-200 ease-out ${statusClass[node.status]}`}>
        <NodeVisual node={node} />
        <div className="absolute left-1/2 top-[-5%] -translate-x-1/2"><StatusBadge status={node.status} /></div>
        {node.status === "completed" && (
          <div className="absolute right-[2%] top-[25%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#F2C94C] text-lg shadow-md" aria-label="完成寶石" title="完成寶石">◆</div>
        )}
        {node.status === "pending" && (
          <div className="absolute bottom-[-4%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#D4B477] bg-[#FFF9EA]/95 px-3 py-1 text-[11px] font-bold text-[#755B2F] shadow-sm">等待審核</div>
        )}
        {node.status === "in_progress" && (
          <div className="absolute bottom-[-4%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#E1C477] bg-[#FFF9E7]/95 px-3 py-1 text-[11px] font-bold text-[#6F592A] opacity-0 shadow-sm transition group-hover:opacity-100">點擊進入</div>
        )}
      </div>
    </button>
  );
}

export default function StudentMap({ progress }: { progress: StudentMapProgress }) {
  const nodes = buildWeekMapNodes(progress.weeks);
  const completed = getCompletedCount(progress.weeks);
  const progressPercent = Math.round((completed / 6) * 100);

  return (
    <main className="min-h-screen bg-[#F6F1E8] px-3 py-3 sm:px-6 sm:py-6">
      <section className="mx-auto w-full max-w-[1680px]">
        <div className="overflow-x-auto rounded-[28px]">
          <div className="relative aspect-[16/9] min-h-[560px] min-w-[900px] overflow-hidden rounded-[28px] border border-[#D9D1C6] bg-[#C9D9AF] shadow-[0_14px_40px_rgba(78,65,49,0.10)]">
            <MapBackground />

            <div className="absolute left-4 top-4 z-30 flex flex-wrap gap-2 sm:left-6 sm:top-6">
              <div className="rounded-full border border-white/60 bg-[#FFFDF8]/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#51483F] sm:text-sm"><span aria-hidden="true">◆</span><span>進度 {completed}/6</span></div>
                <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[#E7E0D7] sm:w-32"><div className="h-full rounded-full bg-[#6C9270] transition-all duration-300" style={{ width: `${progressPercent}%` }} /></div>
              </div>
            </div>

            {nodes.map((node) => <WeekNodeButton key={node.week} node={node} />)}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-[#5A6E46]/20 to-transparent" />
          </div>
        </div>
      </section>
    </main>
  );
}
