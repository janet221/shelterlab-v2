import Link from "next/link";
import { PublicFooter, PublicHeader } from "./_components/public-shell";
import styles from "./not-found.module.css";

export default function NotFound() {
  return <div className={styles.page}>
    <PublicHeader />
    <main className={styles.main}>
      <div className={styles.card}>
        <span className={styles.label}>404 · 頁面不存在</span>
        <h1>這條路暫時走不通</h1>
        <p>你尋找的頁面可能已移動或不再提供。回到首頁，繼續探索動物生命與我們的社會吧。</p>
        <div className={styles.actions}>
          <Link href="/">返回首頁 <span aria-hidden="true">↗</span></Link>
          <Link href="/start">開始探究 <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </main>
    <PublicFooter />
  </div>;
}
