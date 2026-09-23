import { notFound } from "next/navigation";
import WeekOneExperience from "./_components/week-one-experience";
import WeekTwoExperience from "./_components/week-two-experience";
import WeekThreeExperience from "./_components/week-three-experience";
import WeekFourExperience from "./_components/week-four-experience";
import WeekFiveExperience from "./_components/week-five-experience";
import WeekSixExperience from "./_components/week-six-experience";
import GuidedWeekCourse from "./_components/guided-week-course";
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

  if (weekNumber === 1) return <WeekOneExperience />;
  if (weekNumber === 2) return <WeekTwoExperience />;
  if (weekNumber === 3) return <WeekThreeExperience />;
  if (weekNumber === 4) return <WeekFourExperience />;
  if (weekNumber === 5) return <WeekFiveExperience />;
  if (weekNumber === 6) return <WeekSixExperience />;
  return <GuidedWeekCourse week={weekNumber} />;
}
