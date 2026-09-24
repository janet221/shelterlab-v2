"use client";
import { api } from "@/app/_components/classroom-ui";
import { learningStorage, setLearningStorageScope, clearLearningDrafts } from "@/lib/classroom/browser-storage";


import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { getLearningTool, type LearningToolKind, type WeekNumber } from "@/lib/student-map";

export type EvidenceBucket = "data" | "supported" | "inference" | "unknown";

export type WeekOneProgress = {
  stage: number;
  currentClue: number;
  firstImpression: string;
  sealedFirstImpression: string;
  classificationAnswers: Record<number, EvidenceBucket>;
  datasetChoice: number | null;
  boundaryChoice: boolean | null;
  mediaChoice: "doubt" | "forward" | "headline" | null;
  sourceTags: string[];
  responsibleRewrite: string;
  rewriteChecks: string[];
  completed: boolean;
  completedAt: string | null;
};

export type StudentLearningProgress = {
  schemaVersion: 2;
  completedWeeks: WeekNumber[];
  unlockedTools: LearningToolKind[];
  weekOne: WeekOneProgress;
};

type LearningProgressContextValue = {
  progress: StudentLearningProgress;
  ready: boolean;
  updateWeekOne: (patch: Partial<WeekOneProgress>) => void;
  replaceWeekOne: (recipe: (current: WeekOneProgress) => WeekOneProgress) => void;
  completeWeek: (week: WeekNumber) => Promise<boolean>;
  completeWeekOne: () => Promise<boolean>;
  resetWeekOne: () => void;
};

export const STUDENT_LEARNING_STORAGE_KEY = "shelterlab-learning-progress-v2";
const LEGACY_WEEK_ONE_STORAGE_KEY = "shelterlab-week1-v1";

export const INITIAL_WEEK_ONE_PROGRESS: WeekOneProgress = {
  stage: 0,
  currentClue: 0,
  firstImpression: "",
  sealedFirstImpression: "",
  classificationAnswers: {},
  datasetChoice: null,
  boundaryChoice: null,
  mediaChoice: null,
  sourceTags: [],
  responsibleRewrite: "",
  rewriteChecks: [],
  completed: false,
  completedAt: null
};

export const INITIAL_STUDENT_LEARNING_PROGRESS: StudentLearningProgress = {
  schemaVersion: 2,
  completedWeeks: [],
  unlockedTools: [],
  weekOne: INITIAL_WEEK_ONE_PROGRESS
};

const LearningProgressContext = createContext<LearningProgressContextValue | null>(null);

function normalizeWeekNumbers(value: unknown): WeekNumber[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is WeekNumber =>
    item === 1 || item === 2 || item === 3 || item === 4 || item === 5 || item === 6
  );
}

function normalizeLearningTools(value: unknown): LearningToolKind[] {
  const allowed: LearningToolKind[] = [
    "data-lens",
    "hypothesis-notes",
    "care-planner",
    "label-folder",
    "observation-lens"
  ];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is LearningToolKind => allowed.includes(item as LearningToolKind));
}

function normalizeWeekOne(value: unknown): WeekOneProgress {
  const source = value && typeof value === "object" ? value as Partial<WeekOneProgress> : {};
  const stage = typeof source.stage === "number" ? Math.min(Math.max(Math.trunc(source.stage), 0), 6) : 0;
  const currentClue = typeof source.currentClue === "number"
    ? Math.min(Math.max(Math.trunc(source.currentClue), 0), 5)
    : 0;
  const firstImpression = typeof source.firstImpression === "string" ? source.firstImpression.slice(0, 400) : "";
  const sealedFirstImpression = typeof source.sealedFirstImpression === "string" && source.sealedFirstImpression.trim()
    ? source.sealedFirstImpression.slice(0, 400)
    : (stage >= 2 || source.completed === true ? firstImpression : "");

  return {
    ...INITIAL_WEEK_ONE_PROGRESS,
    ...source,
    stage,
    currentClue,
    firstImpression,
    sealedFirstImpression,
    classificationAnswers:
      source.classificationAnswers && typeof source.classificationAnswers === "object"
        ? source.classificationAnswers
        : {},
    datasetChoice: source.datasetChoice === 0 || source.datasetChoice === 1 || source.datasetChoice === 2
      ? source.datasetChoice
      : null,
    boundaryChoice: typeof source.boundaryChoice === "boolean" ? source.boundaryChoice : null,
    mediaChoice:
      source.mediaChoice === "doubt" || source.mediaChoice === "forward" || source.mediaChoice === "headline"
        ? source.mediaChoice
        : null,
    sourceTags: Array.isArray(source.sourceTags)
      ? source.sourceTags.filter((item): item is string => typeof item === "string").slice(0, 8)
      : [],
    responsibleRewrite:
      typeof source.responsibleRewrite === "string" ? source.responsibleRewrite.slice(0, 500) : "",
    rewriteChecks: Array.isArray(source.rewriteChecks)
      ? source.rewriteChecks.filter((item): item is string => typeof item === "string").slice(0, 6)
      : [],
    completed: source.completed === true,
    completedAt: typeof source.completedAt === "string" ? source.completedAt : null
  };
}

function normalizeProgress(value: unknown): StudentLearningProgress {
  const source = value && typeof value === "object" ? value as Partial<StudentLearningProgress> : {};
  const weekOne = normalizeWeekOne(source.weekOne);
  const completedWeeks = normalizeWeekNumbers(source.completedWeeks);
  const unlockedTools = normalizeLearningTools(source.unlockedTools);

  if (weekOne.completed && !completedWeeks.includes(1)) completedWeeks.push(1);
  if (weekOne.completed && !unlockedTools.includes("data-lens")) unlockedTools.push("data-lens");

  return {
    schemaVersion: 2,
    completedWeeks,
    unlockedTools,
    weekOne
  };
}

function migrateLegacyWeekOne(): StudentLearningProgress | null {
  try {
    const raw = window.localStorage.getItem(LEGACY_WEEK_ONE_STORAGE_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as Partial<WeekOneProgress>;
    const weekOne = normalizeWeekOne({
      ...legacy,
      stage: legacy.completed ? 6 : 0,
      completedAt: legacy.completed ? new Date().toISOString() : null
    });
    const migrated = normalizeProgress({
      schemaVersion: 2,
      weekOne,
      completedWeeks: weekOne.completed ? [1] : [],
      unlockedTools: weekOne.completed ? ["data-lens"] : []
    });
    window.localStorage.removeItem(LEGACY_WEEK_ONE_STORAGE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

export function StudentLearningProgressProvider({ children, accountId }: { children: React.ReactNode; accountId: string }) {
 const [progress,setProgress]=useState<StudentLearningProgress>(INITIAL_STUDENT_LEARNING_PROGRESS);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  setLearningStorageScope(accountId);
  try { const raw=learningStorage.getItem(STUDENT_LEARNING_STORAGE_KEY); if(raw) setProgress(normalizeProgress(JSON.parse(raw))); } catch {}
  setReady(true);
  let stopped=false;
  const refresh=async()=>{try{
   const result=await api<{generation?:number;weeks:Array<{week:WeekNumber;status:string}>}>("/api/classroom/progress");
   if(stopped)return;
   const previous=learningStorage.getItem("generation"),generation=String(result.generation??0);
   if(previous!==null&&previous!==generation){clearLearningDrafts();learningStorage.setItem("generation",generation);window.location.assign("/student");return;}
   learningStorage.setItem("generation",generation);
   const completedWeeks=result.weeks.filter(w=>w.status==="completed").map(w=>w.week);
   const earnedWeeks=result.weeks.filter(w=>w.status==="pending"||w.status==="completed").map(w=>w.week);
   setProgress(p=>({...p,completedWeeks,unlockedTools:earnedWeeks.filter(w=>w<=5).map(w=>getLearningTool(w).kind)}));
  }catch{/* No local fallback can approve a week; page/API gates remain authoritative. */}};
  void refresh();const timer=setInterval(refresh,5000);window.addEventListener("classroom-progress",refresh);
  return()=>{stopped=true;clearInterval(timer);window.removeEventListener("classroom-progress",refresh);};
 },[accountId]);
 useEffect(()=>{if(ready)try{learningStorage.setItem(STUDENT_LEARNING_STORAGE_KEY,JSON.stringify({...progress,completedWeeks:[],unlockedTools:[]}));}catch{}},[progress,ready]);
 const updateWeekOne=useCallback((patch:Partial<WeekOneProgress>)=>setProgress(p=>({...p,weekOne:normalizeWeekOne({...p.weekOne,...patch})})),[]);
 const replaceWeekOne=useCallback((recipe:(p:WeekOneProgress)=>WeekOneProgress)=>setProgress(p=>({...p,weekOne:normalizeWeekOne(recipe(p.weekOne))})),[]);
 const completeWeek=useCallback((week:WeekNumber)=>new Promise<boolean>((resolve)=>{
  let settled=false;
  const finish=(saved:boolean)=>{if(settled)return;settled=true;window.clearTimeout(timeout);resolve(saved);};
  const timeout=window.setTimeout(()=>finish(false),15000);
  window.dispatchEvent(new CustomEvent("shelterlab-week-complete",{detail:{week,resolve:finish}}));
 }),[]);
 const completeWeekOne=useCallback(()=>completeWeek(1),[completeWeek]);
 const resetWeekOne=useCallback(()=>setProgress(p=>({...p,weekOne:{...INITIAL_WEEK_ONE_PROGRESS}})),[]);
 const value=useMemo(()=>({progress,ready,updateWeekOne,replaceWeekOne,completeWeek,completeWeekOne,resetWeekOne}),[progress,ready,updateWeekOne,replaceWeekOne,completeWeek,completeWeekOne,resetWeekOne]);
 return <LearningProgressContext.Provider value={value}>{ready?children:<p className="p-8">正在載入個人學習資料…</p>}</LearningProgressContext.Provider>;
}

export function useStudentLearningProgress() {
  const value = useContext(LearningProgressContext);
  if (!value) {
    throw new Error("useStudentLearningProgress must be used within StudentLearningProgressProvider");
  }
  return value;
}
