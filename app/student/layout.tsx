import { StudentLearningProgressProvider } from "./_components/student-learning-progress";
import StudentActionNav from "./_components/student-action-nav";
import { isEvaluatorAccount, requirePageAccount } from "@/lib/classroom/auth";
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
 const account = await requirePageAccount("student");
 return <StudentLearningProgressProvider accountId={account.id} evaluatorMode={isEvaluatorAccount(account)}><StudentActionNav />{children}</StudentLearningProgressProvider>;
}
