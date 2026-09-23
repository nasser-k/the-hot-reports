"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    // Never register SW in dev: it can cache old Next chunks and cause ChunkLoadError.
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {
            // ignore
          });
      };
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return null;
}
