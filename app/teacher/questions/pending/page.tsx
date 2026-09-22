export default function PendingReviewPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Pending review queue</h1>
      <p className="mt-3 text-slate-700">Teachers and admins can approve or reject pending questions. Rejection requires a reason.</p>
      <form className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span>Rejection reason</span>
          <input aria-label="Question rejection reason" className="rounded border p-2" name="reason" />
        </label>
        <button className="rounded border bg-white px-4 py-2" type="submit">Review selected question</button>
      </form>
    </main>
  );
}
