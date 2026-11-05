"use client";

import { Component, type ReactNode } from "react";

export default class WeekSixMapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // The nearby resource cards remain usable when the map or tile library fails.
  }

  render() {
    if (this.state.failed) {
      return <div role="status" className="week6-map-error"><strong>地圖模組暫無法載入</strong><p>仍可運用右側篩選條件與下方機構卡片查閱資源、聯絡電話及導航連結。</p></div>;
    }
    return this.props.children;
  }
}
