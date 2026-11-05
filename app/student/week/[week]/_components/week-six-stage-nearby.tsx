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
    <div className={styles.mapColumn}><Link className={styles.boardLink} href="/student/opportunities">查閱收容機構活動公告 →</Link><WeekSixMapBoundary><Map matches={mapMatches} location={location} selectedId={selectedId} onSelect={onSelect}/></WeekSixMapBoundary></div>
    <aside className={styles.panel}><section className={styles.profile}><div className={styles.taskIntro}><h2>環節一執行任務</h2><ol><li data-done={hasLocation}><b>{hasLocation?"✓":"1"}</b><span><strong>設定搜尋區域</strong><small>{hasLocation?`目前設定：${profile.county||"概略位置"}`:"選擇行政區，或開啟概略定位"}</small></span></li><li data-done={hasSelection}><b>{hasSelection?"✓":"2"}</b><span><strong>選取資源卡片</strong><small>{hasSelection?"已完成選取，可進入下一環節":"點擊下方卡片「選取此項資源」"}</small></span></li></ol></div><div className={styles.coreFilters}>
      <label>① 所屬行政區<select aria-label="所屬行政區" value={profile.county} onChange={event=>onProfile({...profile,county:event.target.value})}><option value="">請選擇行政區</option>{TAIWAN_COUNTIES.map(county=><option key={county}>{county}</option>)}</select></label>
      <label>擬參與類型（選填）<select aria-label="擬參與類型" value={actionFilter} onChange={event=>onAction(event.target.value as ActionFilter)}><option value="all">檢視全部機會</option><option value="visit">參訪收容機構</option><option value="volunteer">志工服務諮詢</option><option value="material_donation">物資募集行動</option><option value="school_outreach">校園生命教育宣導</option><option value="reporting">通報流程學習</option><option value="adoption_promotion">協助認養推廣</option></select></label>
    </div><button type="button" className={styles.locationButton} onClick={onLocate}>使用本機概略定位</button>{message&&<p role="status">{message}</p>}{dataError&&<p role="alert" className={styles.notice}>{dataError}</p>}</section></aside>
    <section className={`${styles.results} ${styles.fullWidth}`}><div className={styles.resultTitle}><span>② 選取研究標的</span><h2>選取欲深入了解之動保資源</h2><p>請選取一項符合研習動機之資源，以利於下一環節進行需求比對。</p></div>{usingNearbyFallback&&<p className={styles.notice}>所選行政區暫無完全符合之據點，系統呈現其他區域已查核之資源供參。亦可調整篩選條件或進行線上諮詢。</p>}{visible.length===0&&<p className={styles.noMatch}>請先選擇行政區；若無對應結果，請調整選填之篩選條件。</p>}<div className={styles.cardGrid}>{visible.map(match=><WeekSixResourceCard key={match.organization.id} match={match} selected={selectedId===match.organization.id} onSelect={()=>onSelect(match.organization.id)}/>)}</div></section>
  </div>;
}
