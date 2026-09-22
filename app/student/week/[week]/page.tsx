import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePageAccount } from "@/lib/classroom/auth";
import { studentWeek } from "@/lib/classroom/service";
import { RequestError } from "@/lib/classroom/http";
import WeekSubmission from "./_components/week-submission";
export default async function WeekPage({params}:{params:Promise<{week:string}>}) {
 const week=Number((await params).week);if(!Number.isInteger(week)||week<1||week>6)notFound();
 const account=await requirePageAccount("student");
 try { await studentWeek(account.id,week); } catch(e) { if(e instanceof RequestError)return <main className="mx-auto max-w-xl p-10"><h1 className="text-2xl font-bold">此關卡尚未開放</h1><p className="my-5">{e.message}</p><Link href="/student" className="underline">返回地圖</Link></main>;throw e; }
 return <WeekSubmission week={week}/>;
}
