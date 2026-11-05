import { useEffect, useRef } from "react";

export default function WeekSixSafetyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);
  if (!open) return null;
  return <div role="presentation" className="safety-backdrop" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="safety-title" onMouseDown={(event) => event.stopPropagation()}>
      <span>1959 安全通報</span><h2 id="safety-title">發現受傷、受虐或危及交通安全之動物時之應變程序</h2>
      <ol><li>保持安全距離。</li><li>切勿自行追趕或徒手捕捉。</li><li>在確保自身安全前提下，記錄時間、地點與動物狀況。</li><li>即時通知家長、教師或權責成人。</li><li>必要時撥打 1959 動物保護專線通報。</li></ol>
      <p>本系統不提供自動撥號與自動通報功能。</p>
      <div><a href="tel:1959">撥打 1959 專線</a><a href="https://animal.moa.gov.tw/Frontend/Know/AnimalResource" target="_blank" rel="noreferrer">查閱通報前準備事項</a><button ref={closeRef} type="button" onClick={onClose}>關閉窗口</button></div>
    </section>
  </div>;
}
