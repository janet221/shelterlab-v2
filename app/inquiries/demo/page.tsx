import type { Metadata } from "next";
import Link from "next/link";
import { InquiryReportView } from "../_components/inquiry-report-view";

export const metadata: Metadata = { title: "One Health 探究報告", description: "以已驗證政府開放資料與可追溯證據建立的 One Health 學生探究示範。" };

export default function InquiryDemo() {
  return (
    <main>
      <nav aria-label="探究報告相關頁面" className="mx-auto flex max-w-6xl flex-wrap gap-3 border-b p-5 text-sm print:hidden">
        <Link className="border px-3 py-2" href="/student/inquiries">學生探究工作區</Link>
        <Link className="border px-3 py-2" href="/teacher/inquiries">教師審核</Link>
        <Link className="border px-3 py-2" href="/shelter/inquiries">收容所確認</Link>
        <Link className="border px-3 py-2" href="/competition/impact">影響力儀表板</Link>
        <span className="border px-3 py-2 text-slate-500">可使用瀏覽器列印或輸出 PDF</span>
      </nav>
      <InquiryReportView projectId="inquiry_synthetic_41236_complete" />
    </main>
  );
}
