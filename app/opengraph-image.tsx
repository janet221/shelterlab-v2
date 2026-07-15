import { ImageResponse } from "next/og";

export const alt = "ShelterLab 以證據驅動的 One Health 公民科學教育平台";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#0f172a", color: "white", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: 72, width: "100%" }}>
      <div style={{ color: "#fcd34d", display: "flex", fontSize: 24, fontWeight: 700 }}>以證據驅動的 One Health 公民科學教育平台</div>
      <div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>ShelterLab</div><div style={{ color: "#cbd5e1", display: "flex", fontSize: 32, marginTop: 18 }}>學習 -&gt; 觀察 -&gt; 審核 -&gt; 證據 -&gt; 影響力</div></div>
      <div style={{ color: "#99f6e4", display: "flex", fontSize: 22 }}>來源透明、人工作主、未知可見</div>
    </div>,
    size
  );
}
