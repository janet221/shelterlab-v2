import { getCurriculumStoreSnapshot } from "@/lib/curriculum-library/demo-store";
import Link from "next/link";

export default function TeacherCourseWeeksPage() {
  const { coursePlan, courseWeeks } = getCurriculumStoreSnapshot();
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">{coursePlan.title}</h1>
      <Link className="mt-3 inline-block text-sm underline" href="/teacher/curriculum/standards">Review standard verification labels</Link>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Week</th>
            <th className="p-2">Title</th>
            <th className="p-2">Module</th>
            <th className="p-2">Focus</th>
          </tr>
        </thead>
        <tbody>
          {courseWeeks.map((week) => (
            <tr className="border-b" key={week.id}>
              <td className="p-2">{week.weekNumber}</td>
              <td className="p-2">{week.title}</td>
              <td className="p-2">{week.moduleCode ?? "cross-module"}</td>
              <td className="p-2">{week.focus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
