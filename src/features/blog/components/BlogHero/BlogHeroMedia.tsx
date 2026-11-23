"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import styles from "./BlogHero.module.css";

const MOTION_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const DATA_QUERY = "(prefers-reduced-data: reduce)";
const CLIP = "/blog/hero/blog-hero-v5.mp4";

function connection() {
  return (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } })
    .connection;
}

function canAnimate() {
  return (
    matchMedia(MOTION_QUERY).matches && !matchMedia(DATA_QUERY).matches && !connection()?.saveData
  );
}

function subscribe(listener: () => void) {
  const sources = [matchMedia(MOTION_QUERY), matchMedia(DATA_QUERY), connection()];
  sources.forEach((source) => source?.addEventListener("change", listener));
  return () => sources.forEach((source) => source?.removeEventListener("change", listener));
}

function Player({ userPausedRef }: { userPausedRef: RefObject<boolean> }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [control, setControl] = useState<"play" | "pause" | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || failed) return;
    let visible = false;
    let active = true;
    function sync() {
      if (!video) return;
      if (!visible || document.hidden) {
        video.pause();
        return;
      }
      if (!video.hasAttribute("src")) video.src = CLIP;
      if (userPausedRef.current) {
        setControl("play");
        return;
      }
      void video.play().catch((error: DOMException) => {
        if (active && error.name === "NotAllowedError") setControl("play");
      });
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [failed, userPausedRef]);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    userPausedRef.current = !video.paused;
    if (userPausedRef.current) video.pause();
    else void video.play().catch(() => setControl("play"));
  }

  if (failed) return null;
  return (
    <>
      <video
        ref={ref}
        className={styles.video}
        data-started={started}
        aria-hidden="true"
        muted
        playsInline
        loop
        preload="none"
        onPlaying={() => {
          setStarted(true);
          setControl("pause");
        }}
        onPause={() => setControl("play")}
        onError={() => setFailed(true)}
      />
      {control && (
        <button
          type="button"
          className={styles.control}
          onClick={toggle}
          aria-label={control === "pause" ? "Pausar animación" : "Reproducir animación"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d={control === "pause" ? "M6 4h4v16H6zm8 0h4v16h-4z" : "M7 4v16l13-8z"} />
          </svg>
        </button>
      )}
    </>
  );
}

export function BlogHeroMedia() {
  const allowed = useSyncExternalStore(subscribe, canAnimate, () => false);
  const [posterReady, setPosterReady] = useState(false);
  const userPausedRef = useRef(false);
  return (
    <div className={styles.scene}>
      <Image
        src="/blog/hero/blog-hero-poster-v5.webp"
        alt=""
        fill
        unoptimized
        loading="eager"
        fetchPriority="high"
        onLoad={() => setPosterReady(true)}
      />
      {allowed && posterReady && <Player userPausedRef={userPausedRef} />}
    </div>
  );
}
