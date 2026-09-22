"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { opportunityFitScore, opportunityRepository, preferenceRepository } from "@/lib/action-opportunities/browser-repository";
import { OPPORTUNITY_CATEGORY_LABELS, type ActionOpportunity } from "@/lib/action-opportunities/types";

export default function StudentOpportunityPreview() {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<"new"|"fit"|"deadline"|"nearby"|"hours"|"indirect">("fit");
  const [items, setItems] = useState<ActionOpportunity[]>([]);
  useEffect(() => setItems(opportunityRepository.list()), []);
  const featured = useMemo(() => {
    const preferences = preferenceRepository.get();
    const active=items.filter((item) => item.status === "published"),days=(value?:string)=>value?Math.ceil((new Date(value).getTime()-Date.now())/86400000):9999;
    const selected=group==="new"?active.filter(item=>days(item.publishedAt)>=-7):group==="deadline"?active.filter(item=>days(item.applicationDeadline)>=0&&days(item.applicationDeadline)<=3):group==="nearby"?active.filter(item=>item.city===preferences.city||item.city==="全國"):group==="hours"?active.filter(item=>item.serviceHoursProvided):group==="indirect"?active.filter(item=>["adoption_photo","social_media","data_support","school_outreach"].includes(item.category)):active;
    return selected.sort((a, b) => opportunityFitScore(b, preferences) - opportunityFitScore(a, preferences)).slice(0, 3);
  }, [items,group]);
  const groups=[{id:"new",label:"剛剛上架"},{id:"fit",label:"適合你的機會"},{id:"deadline",label:"即將截止"},{id:"nearby",label:"學校附近"},{id:"hours",label:"可取得服務時數"},{id:"indirect",label:"不接觸動物也能參與"}] as const;

  return <aside className="fixed bottom-4 left-1/2 z-[68] w-[min(94vw,760px)] -translate-x-1/2 rounded-3xl border border-[#2b675d]/40 bg-[#fffaf0]/95 p-3 text-[#3e392f] shadow-xl backdrop-blur-md">
    <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left font-black text-[#285f57]" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
      <span>活動布告欄 <span className="ml-2 text-sm font-medium">從地圖資料走到真實行動</span></span><span>{open ? "收合" : "查看 3 項"}</span>
    </button>
    {open && <div className="mt-2 grid gap-2 sm:grid-cols-3">
      <div className="sm:col-span-3 flex flex-wrap gap-1.5">{groups.map(item=><button type="button" key={item.id} onClick={()=>setGroup(item.id)} className={`rounded-full border border-[#287567] px-2.5 py-1 text-xs font-black ${group===item.id?"bg-[#287567] text-white":"bg-white text-[#285f57]"}`}>{item.label}</button>)}</div>
      {featured.map((item) => <Link href={`/student/opportunities?opportunity=${item.id}`} key={item.id} className="rounded-2xl border border-[#8d826f] bg-white p-3 transition hover:-translate-y-0.5">
        <span className="text-xs font-black text-[#287567]">{OPPORTUNITY_CATEGORY_LABELS[item.category]} · {item.city}</span><strong className="mt-1 block text-sm">{item.title}</strong><span className="mt-2 block text-xs">最低 {item.minimumAge} 歲</span>
      </Link>)}
      {featured.length===0&&<p className="sm:col-span-3 rounded-2xl bg-white p-3 text-sm">這個分類目前沒有示範資料，可到活動布告欄調整條件查看其他機會。</p>}
      <Link href="/student/opportunities" className="sm:col-span-3 rounded-full bg-[#287567] px-4 py-2 text-center font-black text-white">開啟完整活動布告欄</Link>
    </div>}
  </aside>;
}
