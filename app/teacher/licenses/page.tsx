export default function ClassLicenseStatusPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Class license status</h1>
      <p className="mt-3 text-slate-700">Students are displayed by test code only. Real student names are not stored.</p>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <tbody>
          <tr className="border-b"><td className="p-2">STU-TEST-001</td><td className="p-2">Demo eligible after pass</td></tr>
        </tbody>
      </table>
    </main>
  );
}
