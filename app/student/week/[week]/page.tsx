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
import { requirePageAccount } from "@/lib/classroom/auth";
import { RequestError } from "@/lib/classroom/http";
import { studentWeek } from "@/lib/classroom/service";
import type { WeekNumber } from "@/lib/student-map";

type WeekPageProps = {
  params: Promise<{ week: string }>;
};

function isWeekNumber(value: number): value is WeekNumber {
  return value >= 1 && value <= 6 && Number.isInteger(value);
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { week } = await params;
  const weekNumber = Number(week);
  if (!isWeekNumber(weekNumber)) notFound();

  const account = await requirePageAccount("student");
  try {
    await studentWeek(account.id, weekNumber);
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

  const experience = weekNumber === 1 ? <WeekOneExperience />
    : weekNumber === 2 ? <WeekTwoExperience />
      : weekNumber === 3 ? <WeekThreeExperience />
        : weekNumber === 4 ? <WeekFourExperience />
          : weekNumber === 5 ? <WeekFiveExperience />
            : weekNumber === 6 ? <WeekSixExperience />
              : <GuidedWeekCourse week={weekNumber} />;

  return <WeekAuditTracker accountId={account.id} week={weekNumber}>{experience}</WeekAuditTracker>;
}
