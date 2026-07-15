import { behaviorCodes } from "@/lib/observations/behavior-codes";

export default function ObservationFormPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Observation 表單頁</h1>
      <p className="mt-3 text-slate-700">第一版 behavior code 字典共 {behaviorCodes.length} 項。</p>
      <a className="mt-4 inline-block rounded border bg-white px-4 py-2" href="/today">Go to Today&apos;s Tasks</a>
    </main>
  );
}
