"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="zh-TW"><body><main style={{ alignItems: "center", background: "#ffffff", color: "#0f172a", display: "flex", minHeight: "100vh", padding: 24 }}><section style={{ borderBottom: "1px solid #cbd5e1", borderTop: "1px solid #cbd5e1", margin: "0 auto", maxWidth: 680, padding: "40px 0", width: "100%" }}><p style={{ color: "#be123c", fontFamily: "monospace", fontSize: 14 }}>500 · ShelterLab 錯誤</p><h1 style={{ fontSize: 36, marginTop: 16 }}>服務暫時無法使用。</h1><p style={{ color: "#475569", lineHeight: 1.7, marginTop: 16 }}>錯誤處理不會變更示範或正式資料，請稍後重試。</p><button onClick={reset} style={{ background: "#0f172a", border: 0, color: "white", cursor: "pointer", fontWeight: 700, marginTop: 24, padding: "12px 18px" }} type="button">重試</button></section></main></body></html>;
}
