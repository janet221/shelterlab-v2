"use client";

import { useState } from "react";
import styles from "./learning-video-card.module.css";

export type LearningVideo = {
  title: string;
  description: string;
  provider: string;
  href: string;
  thumbnail: string;
  youtubeId?: string;
  duration?: string;
};

export default function LearningVideoCard({ video }: { video: LearningVideo }) {
  const [playing, setPlaying] = useState(false);
  const canEmbed = Boolean(video.youtubeId);

  return <article className={styles.card}>
    <div className={styles.media}>
      {playing && video.youtubeId ? <iframe
        className={styles.player}
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
        title={`${video.title}｜影片播放器`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      /> : <>
        <img src={video.thumbnail} alt={`${video.title} 官方影片縮圖`} loading="lazy" referrerPolicy="no-referrer" />
        <span className={styles.providerBadge}>{video.provider}</span>
        {canEmbed ? <button type="button" className={styles.playButton} onClick={() => setPlaying(true)} aria-label={`在本網站播放：${video.title}`}>▶</button> : <a className={styles.posterLink} href={video.href} target="_blank" rel="noreferrer" aria-label={`前往${video.provider}播放：${video.title}`} />}
        {video.duration && <span className={styles.duration}>{video.duration}</span>}
      </>}
    </div>
    <div className={styles.details}>
      <div className={styles.heading}><small>{video.provider}{video.duration ? ` · ${video.duration}` : " · 官方影片"}</small><h3>{video.title}</h3></div>
      <p>{video.description}</p>
      <div className={styles.actions}>
        {canEmbed && <button type="button" onClick={() => setPlaying((current) => !current)}>{playing ? "關閉網站播放器" : "在網站內播放"}</button>}
        <a href={video.href} target="_blank" rel="noreferrer">前往官方影片 ↗</a>
      </div>
      <small className={styles.note}>{canEmbed ? "點選播放後由 YouTube 提供影片；也可開啟官方頁面。" : "縮圖取自愛學網官方頁面，點選後前往官方播放器。"}</small>
    </div>
  </article>;
}
