export default function AdminLicensePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">License administration</h1>
      <p className="mt-3 text-slate-700">Admins may revoke or restore licenses. Students cannot edit license status.</p>
      <form className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span>Certificate code</span>
          <input aria-label="Certificate code" className="rounded border p-2" name="certificateCode" />
        </label>
        <label className="grid gap-1">
          <span>Revocation reason</span>
          <input aria-label="Revocation reason" className="rounded border p-2" name="reason" />
        </label>
        <button className="rounded border bg-white px-4 py-2" type="submit">Revoke license</button>
      </form>
    </main>
  );
}
