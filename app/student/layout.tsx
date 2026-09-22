import { StudentLearningProgressProvider } from "./_components/student-learning-progress";
import { requirePageAccount } from "@/lib/classroom/auth";
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
 const account = await requirePageAccount("student");
 return <StudentLearningProgressProvider accountId={account.id}>{children}</StudentLearningProgressProvider>;
}
