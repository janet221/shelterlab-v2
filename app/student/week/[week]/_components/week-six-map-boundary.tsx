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
      return <div role="status" className="week6-map-error"><strong>地圖暫時無法載入</strong><p>你仍可使用右側條件與下方單位卡片查找資源、電話及導航連結。</p></div>;
    }
    return this.props.children;
  }
}
