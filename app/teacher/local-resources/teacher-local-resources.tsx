"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdoptionSnapshot, SchoolDirectorySnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";
import { DATA_SOURCE_LAYER_LABELS, ORGANIZATION_TYPE_LABELS, TAIWAN_COUNTIES, type ActionOrganization, type OrganizationMatch } from "@/lib/action-opportunities/types";
import { matchActionOrganizations } from "@/lib/action-opportunities/repository";
import { filterTeacherActivities, type TeacherActivity } from "@/lib/teacher-activities";
import { WEEK_SIX_SCHOOL_SNAPSHOT, WEEK_SIX_SCHOOL_SNAPSHOT_DATE } from "@/data/week-six-school-snapshot";
import WeekSixResourceCard from "@/app/student/week/[week]/_components/week-six-resource-card";
import weekSixStyles from "@/app/student/week/[week]/_components/week-six-experience.module.css";
import styles from "./teacher-local-resources.module.css";

const ResourceMap=dynamic(()=>import("@/app/student/week/[week]/_components/week-six-action-map"),{ssr:false,loading:()=> <div className={styles.mapFallback}>正在整理動保資源地圖…</div>});
const EMPTY_PROFILE={age:18,county:"",weeklyTime:"1_2" as const,participationModes:[],travelAbility:"cross_county" as const,skills:[],commitment:"both" as const,adultSupport:"confirmed" as const,preferredRole:"information" as const};
const fallbackSchools:SchoolDirectorySnapshot={source:{mode:"fallback",updatedAt:`${WEEK_SIX_SCHOOL_SNAPSHOT_DATE}（名錄備援）`,fallbackDate:WEEK_SIX_SCHOOL_SNAPSHOT_DATE,datasetUrl:"https://data.gov.tw/dataset/6089",apiUrl:"https://stats.moe.gov.tw/",message:"目前使用教育部名錄備援資料。"},schools:WEEK_SIX_SCHOOL_SNAPSHOT};

const json=<T,>(url:string,signal:AbortSignal)=>fetch(url,{signal}).then(response=>{if(!response.ok)throw new Error(`${url}: ${response.status}`);return response.json() as Promise<T>});

export default function TeacherLocalResources(){
  const [county,setCounty]=useState("臺北市"),[schoolId,setSchoolId]=useState(""),[selectedId,setSelectedId]=useState(""),[query,setQuery]=useState("");
  const mapAnchor=useRef<HTMLDivElement>(null);
  const [schoolLocation,setSchoolLocation]=useState<{latitude:number;longitude:number}|null>(null);
  const [schoolLocationMessage,setSchoolLocationMessage]=useState("");
  const [suggestionsOpen,setSuggestionsOpen]=useState(false);
  const [focusRequest,setFocusRequest]=useState(0);
  const [activities,setActivities]=useState<TeacherActivity[]>([]);
  const [activitiesStatus,setActivitiesStatus]=useState<"loading"|"ready"|"error">("loading");
  const [adoptions,setAdoptions]=useState<AdoptionSnapshot|null>(null),[stats,setStats]=useState<ShelterStatsSnapshot|null>(null),[needs,setNeeds]=useState<ShelterNeedsSnapshot|null>(null),[schools,setSchools]=useState<SchoolDirectorySnapshot>(fallbackSchools),[error,setError]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    const failed=()=>{if(!controller.signal.aborted)setError("部分資料暫時無法載入，請稍後重新整理。")};
    json<AdoptionSnapshot>("/api/open-data/adoptions",controller.signal).then(setAdoptions).catch(failed);
    json<ShelterStatsSnapshot>("/api/open-data/shelter-stats",controller.signal).then(setStats).catch(failed);
    json<ShelterNeedsSnapshot>("/api/open-data/shelter-needs",controller.signal).then(setNeeds).catch(failed);
    json<SchoolDirectorySnapshot>("/api/open-data/schools",controller.signal).then(result=>{if(result.schools?.length)setSchools(result)}).catch(()=>{});
    json<{activities:TeacherActivity[]}>("/api/shelter/activities?teacher=1",controller.signal).then(result=>{setActivities(result.activities);setActivitiesStatus("ready")}).catch(()=>{if(!controller.signal.aborted)setActivitiesStatus("error")});
    return()=>controller.abort();
  },[]);
  const countySchools=useMemo(()=>schools.schools.filter(school=>school.county.replace(/台/g,"臺")===county.replace(/台/g,"臺")),[schools,county]);
  const selectedSchool=schools?.schools.find(school=>school.id===schoolId);
  useEffect(()=>{
    setSchoolLocation(null);
    if(!selectedSchool){setSchoolLocationMessage("");return;}
    const controller=new AbortController();
    setSchoolLocationMessage("正在查詢學校概略位置…");
    const params=new URLSearchParams({q:`${selectedSchool.name} ${selectedSchool.address}`,format:"jsonv2",limit:"1",countrycodes:"tw"});
    fetch(`https://nominatim.openstreetmap.org/search?${params}`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then((rows:{lat:string;lon:string}[])=>{if(controller.signal.aborted)return;const latitude=Number(rows[0]?.lat),longitude=Number(rows[0]?.lon);if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||!rows.length)throw Error();setSchoolLocation({latitude,longitude});setSchoolLocationMessage("學校概略位置由 OpenStreetMap 查詢，請以實際地址為準。");}).catch(()=>{if(!controller.signal.aborted)setSchoolLocationMessage("暫時找不到學校位置，請確認地址或稍後再試。");});
    return()=>controller.abort();
  },[selectedSchool?.id,selectedSchool?.name,selectedSchool?.address]);
  const allMatches=useMemo(()=>matchActionOrganizations((adoptions?.organizations??[]).filter(organization=>!organization.isDemo),{...EMPTY_PROFILE,county}),[adoptions,county]);
  const countyMatches=useMemo(()=>allMatches.filter(match=>match.organization.county===county),[allMatches,county]);
  const matches=useMemo(()=>{const term=query.trim().toLocaleLowerCase();return term?countyMatches.filter(match=>`${match.organization.name} ${match.organization.county} ${match.organization.address}`.toLocaleLowerCase().includes(term)):countyMatches},[countyMatches,query]);
  const selected=matches.find(match=>match.organization.id===selectedId)?.organization??matches[0]?.organization;
  const need=needs?.latestByCounty.find(row=>row.county===county),stat=stats?.latestByCounty.find(row=>row.county===county);
  const count=(value:number|null|undefined)=>value===null||value===undefined?"資料未提供":value.toLocaleString("zh-TW");
  const handleCounty=(value:string)=>{setCounty(value);setSchoolId("");setSelectedId("");setSchoolLocation(null);setFocusRequest(0)};
  const teacherActivities=useMemo(()=>filterTeacherActivities(activities,{county,crossCounty:false,query}),[activities,county,query]);
  return <main className={styles.page}><header className={styles.hero}><p>學校與在地資源</p><h1>從學校所在縣市規劃動保行動</h1></header>
    <section className={styles.controls}><label>縣市<select value={county} onChange={event=>handleCounty(event.target.value)}>{TAIWAN_COUNTIES.map(item=><option key={item}>{item}</option>)}</select></label><label>學校<select value={schoolId} onChange={event=>{setFocusRequest(0);setSelectedId("");setSchoolId(event.target.value)}}><option value="">{schools ? (countySchools.length ? "選擇學校" : "此縣市沒有學校資料") : "正在載入學校名錄…"}</option>{countySchools.map(school=><option key={school.id} value={school.id}>{school.name}</option>)}</select></label><label className={styles.searchLabel}>搜尋收容所或活動<input type="search" value={query} onChange={event=>{setQuery(event.target.value);setSuggestionsOpen(true)}} onFocus={()=>setSuggestionsOpen(true)} placeholder="輸入機構名稱、地址或活動名稱"/>{suggestionsOpen&&query.trim()&&<div className={styles.suggestions} role="listbox" aria-label="收容所搜尋結果">{matches.length?matches.slice(0,8).map(({organization})=><button type="button" role="option" aria-selected={selectedId===organization.id} key={organization.id} onClick={()=>{setQuery(organization.name);setSuggestionsOpen(false);setSchoolLocation(null);setSelectedId(organization.id);setFocusRequest(value=>value+1)}}>{organization.name}<small>{organization.address}</small></button>):<span>找不到符合的收容所</span>}</div>}</label>{selectedSchool&&<p><strong>{selectedSchool.name}</strong><br/>{selectedSchool.county} · {selectedSchool.address}<br/><small role="status">{schoolLocationMessage}</small></p>}</section>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <section className={styles.grid}><div ref={mapAnchor}><ResourceMap matches={matches as OrganizationMatch[]} location={schoolLocation} locationZoom={15} locationLabel="學校概略位置（OpenStreetMap）" selectedId={selectedId} onSelect={setSelectedId} focusRequest={focusRequest} clusterMarkers={false}/><p className={styles.mapNote}>目前只顯示 {county} 的動保資源。 地圖位置沿用第六週的農業部公立動物收容所資料（資料集 134284），學校名錄用於選擇縣市；選擇學校時，名稱與地址會送至 OpenStreetMap 查詢概略位置；未計算距離。 <a href="https://data.gov.tw/dataset/134284" target="_blank" rel="noreferrer">查看收容所資料來源 ↗</a></p></div><aside className={styles.summary}><span>政府開放資料</span><h2>{county}收容需求摘要</h2><div><article><small>月底在養數</small><strong>{count(need?.currentTotal)}</strong></article><article><small>可留容動物最大值</small><strong>{count(need?.maxCapacity)}</strong></article><article><small>當月合計入所</small><strong>{count(need?.totalIntake)}</strong></article><article><small>最近一期認領養</small><strong>{count(stat?.adoptedCount)}</strong></article></div><p>統計期間：細項表 {needs?.source.updatedAt??"載入中"}{needs?`（${needs.source.mode==="live"?"官方資料":"既有快照"}）`:""}；認領養統計 {stats?.source.updatedAt??"載入中"}{stats?`（${stats.source.mode==="live"?"官方資料":"既有快照"}）`:""}。</p><p>這些數字只用來設計查證問題與課程討論，不做縣市好壞排名，也不推論志工名額。</p><div className={styles.sources}><a href="https://data.gov.tw/dataset/41236" target="_blank" rel="noreferrer">收容處理統計 ↗</a><a href="https://data.gov.tw/dataset/73396" target="_blank" rel="noreferrer">收容處理統計表（細項） ↗</a><a href="https://data.gov.tw/dataset/6089" target="_blank" rel="noreferrer">高中名錄 ↗</a></div></aside></section>
    <section className={styles.resources}><h2>{county}動保資源</h2>{!adoptions&&!error&&<p>正在讀取政府資料…</p>}{matches.slice(0,12).map(({organization})=><ResourceCard key={organization.id} organization={organization} selected={selected?.id===organization.id} onSelect={()=>{setSchoolLocation(null);setSelectedId(organization.id);setFocusRequest(value=>value+1);mapAnchor.current?.scrollIntoView({behavior:"smooth",block:"center"})}}/>)}</section>
    <section className={styles.teacherActivities}><header><div><span>收容所已發布活動</span><h2>可由教師帶班參訪</h2><p>查看收容所發布的帶班參訪公告，並透過公告聯絡方式洽詢。下方另提供標示清楚的模擬情境。</p></div><strong>{activitiesStatus==="loading"?"載入中":activitiesStatus==="error"?"無法讀取":`${teacherActivities.length} 筆`}</strong></header><div className={styles.teacherActivityGrid}>{teacherActivities.map(activity=>{const shelter=activity.shelters;const email=activity.contact_email||shelter?.contact_email||"";const phone=activity.contact_phone||"";const subject=encodeURIComponent(`教師帶班參訪洽詢｜${activity.title}`);const body=encodeURIComponent(`您好：\n\n我是＿＿學校教師，想洽詢「${activity.title}」教師帶班參訪的日期、名額與安全規範。\n\n學校／年級：\n預計人數：\n希望日期：\n聯絡電話：\n\n謝謝。`);return <article key={activity.id}><span className={styles.teacherVisitBadge}>可由教師帶班參訪</span><h3>{activity.title}</h3><p><strong>{shelter?.name||"收容所"}</strong> · {shelter?.address||"地址未提供"}</p><p>{activity.summary||activity.description}</p><dl><div><dt>活動時間</dt><dd>{activity.event_start_at?new Date(activity.event_start_at).toLocaleString("zh-TW"):"請直接洽詢"}</dd></div><div><dt>名額</dt><dd>{activity.capacity?`${activity.capacity} 人`:"公告未提供"}</dd></div><div><dt>洽詢期限</dt><dd>{activity.application_deadline?new Date(activity.application_deadline).toLocaleDateString("zh-TW"):"請直接洽詢"}</dd></div></dl><div className={styles.externalContact}>{email&&<a href={`mailto:${email}?subject=${subject}&body=${body}`}>以 Email 聯絡收容所 ↗</a>}{phone&&<a href={`tel:${phone.replace(/[^\d+]/g,"")}`}>電話洽詢 {phone}</a>}{!email&&!phone&&<span>此公告未提供 Email 或電話，請查看收容所官方資訊。</span>}</div><small>此為收容所發布公告；ShelterLab 不收件、不代送申請，也不處理審核。</small></article>})}{activitiesStatus==="loading"&&<p className={styles.noTeacherActivities}>正在讀取收容所公告…</p>}{activitiesStatus==="error"&&<p role="alert" className={styles.noTeacherActivities}>目前無法載入收容所公告，請稍後重試。</p>}</div>{countyMatches.length>0&&<div className={styles.simulatedActivities}><p className={styles.simulationNotice}>模擬資料｜以下為帶班參訪練習，非收容所發布的真實招募。</p><div className={weekSixStyles.cardGrid}>{matches.map(match=><WeekSixResourceCard key={match.organization.id} match={match} selected={selectedId===match.organization.id} teacherDemo onSelect={()=>{setSchoolLocation(null);setSelectedId(match.organization.id);setFocusRequest(value=>value+1);mapAnchor.current?.scrollIntoView({behavior:"smooth",block:"center"})}} />)}</div></div>}</section>
  </main>;
}

function ResourceCard({organization,selected,onSelect}:{organization:ActionOrganization;selected:boolean;onSelect:()=>void}){return <article data-selected={selected}><div><span>{DATA_SOURCE_LAYER_LABELS[organization.sourceLayer]}</span><span>{ORGANIZATION_TYPE_LABELS[organization.organizationType]}</span></div><h3>{organization.name}</h3><p>{organization.county} · {organization.address}</p><p>{organization.phone}</p><p>查核日期：{organization.verifiedAt}</p><p><strong>資料如何影響顯示：</strong>縣市決定同縣市篩選；單位類型與公開標籤只供教學規劃，不代表目前有志工名額。</p><div><button type="button" onClick={onSelect}>在地圖查看</button><a href={organization.sourceUrl} target="_blank" rel="noreferrer">查看原始資料 ↗</a></div></article>}
