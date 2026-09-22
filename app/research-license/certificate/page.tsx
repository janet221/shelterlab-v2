export default function CertificatePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">License certificate and status</h1>
      <p className="mt-3 text-slate-700">Level 1 license is issued only after a valid passing attempt and remains valid for 180 days unless suspended or revoked.</p>
      <dl className="mt-6 grid gap-2">
        <div><dt className="font-medium">Demo status</dt><dd>Eligible after passing attempt</dd></div>
        <div><dt className="font-medium">Observation eligibility</dt><dd>Derived from active license status</dd></div>
      </dl>
    </main>
  );
}
