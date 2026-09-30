"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { SchoolDirectorySnapshot } from "@/lib/government-open-data";
import { TAIWAN_COUNTIES, type ActionFilter, type ActionProfile, type Coordinates, type OrganizationMatch, type ResourceCategoryFilter } from "@/lib/week-six-action";
import WeekSixMapBoundary from "./week-six-map-boundary";
import WeekSixResourceCard from "./week-six-resource-card";
import styles from "./week-six-experience.module.css";

const Map = dynamic(() => import("./week-six-action-map"), { ssr: false, loading: () => <div className={styles.mapFallback}>正在整理動保行動資源地圖…</div> });

type Props = { profile:ActionProfile; categoryFilter:ResourceCategoryFilter; actionFilter:ActionFilter; mapMatches:OrganizationMatch[]; visible:OrganizationMatch[]; usingNearbyFallback:boolean; location:Coordinates|null; selectedId:string; selectedSchoolId:string; schools:SchoolDirectorySnapshot|null; message:string; dataError:string; onProfile:(profile:ActionProfile)=>void; onSchool:(value:string)=>void; onCategory:(value:ResourceCategoryFilter)=>void; onAction:(value:ActionFilter)=>void; onLocate:()=>void; onSelect:(value:string)=>void };

export default function Nearby({ profile, actionFilter, mapMatches, visible, usingNearbyFallback, location, selectedId, message, dataError, onProfile, onAction, onLocate, onSelect }:Props) {
  const hasLocation=Boolean(profile.county||location);
  const hasSelection=visible.some(match=>match.organization.id===selectedId);
  return <div className={styles.workspace}>
    <div className={styles.mapColumn}><Link className={styles.boardLink} href="/student/opportunities">查看收容所活動公告 →</Link><WeekSixMapBoundary><Map matches={mapMatches} location={location} selectedId={selectedId} onSelect={onSelect}/></WeekSixMapBoundary></div>
    <aside className={styles.panel}><section className={styles.profile}><div className={styles.taskIntro}><h2>環節一執行清單</h2><ol><li data-done={hasLocation}><b>{hasLocation?"✓":"1"}</b><span><strong>設定搜尋地區</strong><small>{hasLocation?`已設定：${profile.county||"目前位置"}`:"選擇縣市，或使用約略位置"}</small></span></li><li data-done={hasSelection}><b>{hasSelection?"✓":"2"}</b><span><strong>選擇一張資源卡</strong><small>{hasSelection?"已選好，可以前往下一環節":"到下方卡片按「選擇這個資源」"}</small></span></li></ol></div><div className={styles.coreFilters}>
      <label>① 我所在的縣市<select aria-label="所在縣市" value={profile.county} onChange={event=>onProfile({...profile,county:event.target.value})}><option value="">請選擇縣市</option>{TAIWAN_COUNTIES.map(county=><option key={county}>{county}</option>)}</select></label>
      <label>我想做什麼（選填）<select aria-label="行動方式" value={actionFilter} onChange={event=>onAction(event.target.value as ActionFilter)}><option value="all">先看看全部機會</option><option value="visit">參訪收容所</option><option value="volunteer">志工服務</option><option value="material_donation">物資募集</option><option value="school_outreach">校園宣導</option><option value="reporting">學習通報</option><option value="adoption_promotion">協助認養曝光</option></select></label>
    </div><button type="button" className={styles.locationButton} onClick={onLocate}>或使用我的約略位置</button>{message&&<p role="status">{message}</p>}{dataError&&<p role="alert" className={styles.notice}>{dataError}</p>}</section></aside>
    <section className={`${styles.results} ${styles.fullWidth}`}><div className={styles.resultTitle}><span>② 最後一步</span><h2>選一個想先了解的動保資源</h2><p>不用先讀完全部卡片；選一個最想了解的，再到下一環節比較需求。</p></div>{usingNearbyFallback&&<p className={styles.notice}>目前資料沒有符合所選縣市的據點，先顯示其他縣市可用的已查核資源。你仍可選擇線上詢問，或調整縣市與篩選條件。</p>}{visible.length===0&&<p className={styles.noMatch}>請先選擇縣市；若仍沒有結果，再調整選填篩選條件。</p>}<div className={styles.cardGrid}>{visible.map(match=><WeekSixResourceCard key={match.organization.id} match={match} selected={selectedId===match.organization.id} onSelect={()=>onSelect(match.organization.id)}/>)}</div></section>
  </div>;
}
