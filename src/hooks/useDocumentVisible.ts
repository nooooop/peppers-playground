"use client";

import { useEffect, useState } from "react";

/** 탭·앱이 화면에 보일 때만 true (백그라운드·화면 꺼짐 시 false) */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return visible;
}
