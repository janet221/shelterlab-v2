import { sprint6DatasetRegistry } from "@/lib/government-data/sprint6-fixtures";
import { defaultGovernmentDatasetSyncLocalTime } from "@/lib/government-data/sync";
import { syncGovernmentDatasetsNowAction } from "./actions";

export default function AdminDatasetsPage() {
  return (
    <main className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5"><div><p className="text-sm font-semibold text-cyan-700">Admin governance</p><h1 className="mt-1 text-2xl font-semibold">Admin dataset management</h1><p className="mt-2 text-sm text-slate-600">Scheduled synchronization is configured for {defaultGovernmentDatasetSyncLocalTime}. Failed runs preserve the last successful snapshot.</p></div><form action={syncGovernmentDatasetsNowAction}><input name="testCode" type="hidden" value="ADM-TEST-001"/><button className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium" type="submit">Sync Now</button></form></div>
      <div className="mt-6 grid gap-3">{sprint6DatasetRegistry.map((dataset) => <section className="grid gap-3 border border-slate-200 bg-white p-4 text-sm md:grid-cols-[140px_1fr_170px_120px]" key={dataset.datasetId}><div className="font-mono text-xs">{dataset.datasetId}</div><div><h2 className="font-semibold">{dataset.name}</h2><p className="mt-1 text-xs text-slate-500">{dataset.agency} · {dataset.adapterKey}</p></div><div><span className="border px-2 py-1 text-xs font-semibold">{dataset.verificationState}</span></div><div className="text-xs">{dataset.active ? "ACTIVE" : "DISABLED"}</div></section>)}</div>
      <p className="mt-4 text-xs text-slate-500">Sync Now imports validated verified fixtures for activated official datasets in offline demo mode. The source URL, retrieval time, source hash, and display mode remain attached.</p>
    </main>
  );
}
