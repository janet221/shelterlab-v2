import { requirePageAccount } from "@/lib/classroom/auth";
import { ClassroomNav } from "@/app/_components/classroom-ui";
export default async function TeacherLayout({ children }: { children: React.ReactNode }) { await requirePageAccount("teacher"); return <div className="min-h-screen bg-[#f7f4ef] text-stone-800"><ClassroomNav teacher />{children}</div>; }
