import Link from "next/link";

export default function StudentActionNav() {
  return (
    <nav className="fixed left-1/2 top-4 z-[75] flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#2b675d]/30 bg-[#fffdf8]/95 p-1.5 text-sm font-bold text-[#285f57] shadow-md backdrop-blur-md" aria-label="學生行動導覽">
      <Link className="rounded-full px-3 py-2 transition hover:bg-[#e4f0ea]" href="/student/opportunities">行動機會</Link>
    </nav>
  );
}
