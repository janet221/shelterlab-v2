import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#e2bd70", borderRadius: 7, display: "flex", height: "100%", justifyContent: "center", position: "relative", width: "100%" }}>
      <div style={{ background: "#fff8e9", border: "3px solid #493a2b", borderRadius: 99, display: "flex", height: 20, left: 4, position: "absolute", top: 3, width: 20 }} />
      <div style={{ background: "#493a2b", borderRadius: 99, display: "flex", height: 4, position: "absolute", right: 3, top: 21, transform: "rotate(45deg)", width: 11 }} />
      <div style={{ background: "#c58e36", borderRadius: "55% 55% 48% 48%", display: "flex", height: 7, left: 10, position: "absolute", top: 11, width: 9 }} />
      <div style={{ background: "#c58e36", borderRadius: 99, display: "flex", height: 4, left: 8, position: "absolute", top: 7, width: 4 }} />
      <div style={{ background: "#c58e36", borderRadius: 99, display: "flex", height: 4, left: 13, position: "absolute", top: 6, width: 4 }} />
      <div style={{ background: "#c58e36", borderRadius: 99, display: "flex", height: 4, left: 18, position: "absolute", top: 8, width: 4 }} />
    </div>,
    size
  );
}
