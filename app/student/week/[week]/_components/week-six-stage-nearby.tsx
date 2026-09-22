"use client";

import dynamic from "next/dynamic";
import type { SchoolDirectorySnapshot } from "@/lib/government-open-data";
import { TAIWAN_COUNTIES, type ActionFilter, type ActionProfile, type Coordinates, type OrganizationMatch, type ResourceCategoryFilter } from "@/lib/action-opportunities/types";
import WeekSixMapBoundary from "./week-six-map-boundary";
import WeekSixResourceCard from "./week-six-resource-card";
import styles from "./week-six-experience.module.css";

const Map = dynamic(() => import("./week-six-action-map"), { ssr: false, loading: () => <div className={styles.mapFallback}>正在整理動保行動資源地圖…</div> });

type Props = { profile:ActionProfile; categoryFilter:ResourceCategoryFilter; actionFilter:ActionFilter; mapMatches:OrganizationMatch[]; visible:OrganizationMatch[]; usingNearbyFallback:boolean; location:Coordinates|null; selectedId:string; selectedSchoolId:string; schools:SchoolDirectorySnapshot|null; message:string; dataError:string; onProfile:(profile:ActionProfile)=>void; onSchool:(value:string)=>void; onCategory:(value:ResourceCategoryFilter)=>void; onAction:(value:ActionFilter)=>void; onLocate:()=>void; onSelect:(value:string)=>void };

export default function Nearby({ profile, categoryFilter, actionFilter, mapMatches, visible, usingNearbyFallback, location, selectedId, selectedSchoolId, schools, message, dataError, onProfile, onSchool, onCategory, onAction, onLocate, onSelect }:Props) {
  const ages=Array.from({length:11},(_,index)=>index+12);
  const availableSchools=schools?.schools.filter(school=>!profile.county||school.county===profile.county)??[];
  const selectedSchool=schools?.schools.find(school=>school.id===selectedSchoolId);
  return <div className={styles.workspace}>
    <div className={styles.mapColumn}><WeekSixMapBoundary><Map matches={mapMatches} location={location} selectedId={selectedId} onSelect={onSelect}/></WeekSixMapBoundary><p className={styles.mapNote}>地圖顯示單位，不等於每個單位目前都在招募。政府據點來自官方資料；民間單位會另外標示驗證層級與查核日期。定位只在本頁計算距離，不會儲存。</p></div>
    <aside className={styles.panel}><section className={styles.profile}><h2>找出適合詢問的動保資源</h2><div className={styles.filterGrid}>
      <label>單位類型<select aria-label="單位類型" value={categoryFilter} onChange={event=>onCategory(event.target.value as ResourceCategoryFilter)}><option value="all">全部</option><option value="government">政府單位</option><option value="public_care">公立收容／動物之家</option><option value="education_park">教育園區</option><option value="registered_nonprofit">民間動保團體</option><option value="rescue_group">救援／中途組織</option><option value="partner_managed">已進駐平台</option><option value="internal_application">可站內申請</option><option value="visit">可參訪</option><option value="volunteer">可志工服務</option><option value="school_outreach">可校園合作</option></select></label>
      <label>行動方式<select aria-label="行動方式" value={actionFilter} onChange={event=>onAction(event.target.value as ActionFilter)}><option value="all">全部</option><option value="visit">我想參訪</option><option value="volunteer">我想當志工</option><option value="material_donation">我想做物資募集</option><option value="school_outreach">我想做校園宣導</option><option value="reporting">我想學會通報</option><option value="adoption_promotion">我想協助認養曝光</option></select></label>
      <label>年齡<select aria-label="年齡" value={profile.age} onChange={event=>onProfile({...profile,age:Number(event.target.value)})}>{ages.map(age=><option key={age} value={age}>{age} 歲</option>)}</select></label>
      <label>所在縣市<select aria-label="所在縣市" value={profile.county} onChange={event=>onProfile({...profile,county:event.target.value})}><option value="">請選擇縣市</option>{TAIWAN_COUNTIES.map(county=><option key={county}>{county}</option>)}</select></label>
      <label>學校（選填）<select aria-label="學校" value={selectedSchoolId} disabled={!profile.county||!schools} onChange={event=>onSchool(event.target.value)}><option value="">{profile.county?"可直接用縣市搜尋":"請先選擇縣市"}</option>{availableSchools.map(school=><option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
      <label>可投入時間<select aria-label="可投入時間" value={profile.weeklyTime} onChange={event=>onProfile({...profile,weeklyTime:event.target.value as ActionProfile["weeklyTime"]})}><option value="under_1">每週少於 1 小時</option><option value="1_2">每週 1～2 小時</option><option value="3_5">每週 3～5 小時</option><option value="over_5">每週 5 小時以上</option></select></label>
      <label>成人或教師協助<select aria-label="成人或教師協助" value={profile.adultSupport} onChange={event=>onProfile({...profile,adultSupport:event.target.value as ActionProfile["adultSupport"]})}><option value="confirmed">已確認有人協助</option><option value="need_to_ask">還需要詢問</option><option value="not_available">目前沒有</option></select></label>
      <label>交通條件<select aria-label="交通條件" value={profile.travelAbility} onChange={event=>onProfile({...profile,travelAbility:event.target.value as ActionProfile["travelAbility"]})}><option value="online_only">只能線上參與</option><option value="within_county">可在縣市內移動</option><option value="guardian_accompanied">可由成人陪同</option><option value="cross_county">可跨縣市移動</option></select></label>
    </div><button type="button" onClick={onLocate}>使用我的約略位置找附近據點</button>{selectedSchool&&<p className={styles.locationBasis}><strong>{selectedSchool.name}</strong><br/>{selectedSchool.county} · {selectedSchool.address}<br/>目前以同縣市篩選；學校名錄沒有經緯度，因此不宣稱公里距離。</p>}{schools&&<div className={styles.dataSourceBox}><strong>{schools.source.mode==="live"?"政府開放資料":"政府資料備援快照"}</strong><span>提供機關：教育部統計處</span><span>資料期間：{schools.source.updatedAt}</span><a href={schools.source.datasetUrl} target="_blank" rel="noreferrer">查看一般高級中等學校名錄 ↗</a><small>這筆資料只用來確認學校與縣市，影響同縣市資源篩選；不計算虛構距離。</small></div>}{message&&<p role="status">{message}</p>}{dataError&&<p role="alert" className={styles.notice}>{dataError}</p>}</section></aside>
    <section className={`${styles.results} ${styles.fullWidth}`}><h2>選一個想先了解的動保資源</h2>{usingNearbyFallback&&<p className={styles.notice}>目前資料沒有符合所選縣市的據點，先顯示其他縣市可用的已查核資源。你仍可選擇線上詢問，或調整縣市與篩選條件。</p>}{visible.length===0&&<p className={styles.noMatch}>目前沒有符合這組條件的已查核資料。請調整單位類型或行動方式；這不代表當地沒有其他資源。</p>}<div className={styles.cardGrid}>{visible.map(match=><WeekSixResourceCard key={match.organization.id} match={match} selected={selectedId===match.organization.id} onSelect={()=>onSelect(match.organization.id)}/>)}</div></section>
  </div>;
}
