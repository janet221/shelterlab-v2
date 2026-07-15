import type { Metadata } from "next";
import { InquiryReportView } from "../../_components/inquiry-report-view";

export const metadata: Metadata = { title: "One Health 探究公開報告", description: "經隱私篩選且可追溯來源的 One Health 探究報告。" };

export default async function InquiryReportPage({ params }: { params: Promise<{ id: string }> }) {
  return <InquiryReportView projectId={(await params).id} />;
}
