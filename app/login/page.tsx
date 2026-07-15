export default function LoginPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Demo login</h1>
      <p className="mt-3 text-slate-700">Use test-code demo roles. No real student names are stored.</p>
      <div className="mt-6 grid gap-3">
        <a className="rounded border bg-white p-4" href="/research-license?testCode=STU-TEST-001">
          Student: STU-TEST-001
        </a>
        <a className="rounded border bg-white p-4" href="/teacher/questions">
          Teacher: TEA-TEST-001
        </a>
        <a className="rounded border bg-white p-4" href="/admin/modules">
          Admin: ADM-TEST-001
        </a>
      </div>
    </main>
  );
}
