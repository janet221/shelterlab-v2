import { useEffect, useRef } from "react";

export default function WeekSixSafetyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);
  if (!open) return null;
  return <div role="presentation" className="safety-backdrop" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="safety-title" onMouseDown={(event) => event.stopPropagation()}>
      <span>1959 安全通報</span><h2 id="safety-title">遇到受傷、受虐或可能危及交通安全的動物？</h2>
      <ol><li>保持安全距離。</li><li>不自行追趕或徒手捕捉。</li><li>在安全情況下記錄時間、位置與動物特徵。</li><li>通知家長、教師或可信任成人。</li><li>必要時撥打1959動物保護專線。</li></ol>
      <p>系統不會自動撥號，也不會自動送出通報。</p>
      <div><a href="tel:1959">撥打1959</a><a href="https://animal.moa.gov.tw/Frontend/Know/AnimalResource" target="_blank" rel="noreferrer">查看通報前準備事項</a><button ref={closeRef} type="button" onClick={onClose}>關閉</button></div>
    </section>
  </div>;
}
