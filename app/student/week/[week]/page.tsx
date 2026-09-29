import { notFound } from "next/navigation";
import Link from "next/link";
import WeekOneExperience from "./_components/week-one-experience";
import WeekTwoExperience from "./_components/week-two-experience";
import WeekThreeExperience from "./_components/week-three-experience";
import WeekFourExperience from "./_components/week-four-experience";
import WeekFiveExperience from "./_components/week-five-experience";
import WeekSixExperience from "./_components/week-six-experience";
import GuidedWeekCourse from "./_components/guided-week-course";
import WeekAuditTracker from "./_components/week-audit-tracker";
import { isEvaluatorAccount, requirePageAccount } from "@/lib/classroom/auth";
import { RequestError } from "@/lib/classroom/http";
import { studentWeek } from "@/lib/classroom/service";
import { parseStudentReviewFeedback } from "@/lib/classroom/review-guidelines";
import type { WeekNumber } from "@/lib/student-map";

type WeekPageProps = {
  params: Promise<{ week: string }>;
  searchParams: Promise<{ evaluator?: string; auditDemo?: string }>;
};

function isWeekNumber(value: number): value is WeekNumber {
  return value >= 1 && value <= 6 && Number.isInteger(value);
}

export default async function WeekPage({ params, searchParams }: WeekPageProps) {
  const { week } = await params;
  const weekNumber = Number(week);
  if (!isWeekNumber(weekNumber)) notFound();

  const account = await requirePageAccount("student");
  const evaluatorMode = isEvaluatorAccount(account);
  const query = await searchParams;
  const evaluatorPreview = evaluatorMode && query.evaluator === "1";
  const auditDemo = evaluatorPreview && query.auditDemo === "1";
  let work: Awaited<ReturnType<typeof studentWeek>>;
  try {
    work = await studentWeek(account.id, weekNumber, evaluatorPreview);
  } catch (error) {
    if (error instanceof RequestError) {
      return (
        <main className="mx-auto max-w-xl p-10">
          <h1 className="text-2xl font-bold">此關卡尚未開放</h1>
          <p className="my-5">{error.message}</p>
          <Link href="/student" className="underline">返回六週地圖</Link>
        </main>
      );
    }
    throw error;
  }

  const formallyReturned = !evaluatorPreview && (work.status === "returned" || parseStudentReviewFeedback(work.feedback)?.decision === "reject" || (work.status === "in_progress" && Boolean(work.feedback?.trim())));
  const experience = weekNumber === 1 ? <WeekOneExperience auditDemo={auditDemo} evaluatorPreview={evaluatorPreview} skipIntro={formallyReturned} completedReview={!evaluatorPreview && work.status === "completed"} />
    : weekNumber === 2 ? <WeekTwoExperience auditDemo={auditDemo} />
      : weekNumber === 3 ? <WeekThreeExperience auditDemo={auditDemo} />
        : weekNumber === 4 ? <WeekFourExperience auditDemo={auditDemo} />
          : weekNumber === 5 ? <WeekFiveExperience auditDemo={auditDemo} />
            : weekNumber === 6 ? <WeekSixExperience auditDemo={auditDemo} />
              : <GuidedWeekCourse week={weekNumber} />;

  return <WeekAuditTracker accountId={account.id} week={weekNumber} status={work.status} reviewFeedback={work.feedback} submittedAudit={work.gameAudit} evaluatorMode={evaluatorMode} evaluatorPreview={evaluatorPreview} auditDemo={auditDemo}>{experience}</WeekAuditTracker>;
}
