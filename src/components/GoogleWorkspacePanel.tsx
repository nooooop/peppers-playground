/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const LINKS = [
  {
    href: "https://keep.google.com/",
    title: "Google Keep",
    description: "메모와 체크리스트",
  },
  {
    href: "https://tasks.google.com/",
    title: "Google 할 일",
    description: "할 일 목록 (Tasks)",
  },
  {
    href: "https://calendar.google.com/",
    title: "Google 캘린더",
    description: "일정",
  },
] as const;

export function GoogleWorkspacePanel() {
  const { data: session, status } = useSession();
  const [taskListsText, setTaskListsText] = useState<string>("(로그인 후 불러옵니다)");

  useEffect(() => {
    if (status !== "authenticated") return;
    setTaskListsText("불러오는 중…");
    fetch("/api/google/tasks/tasklists")
      .then(async (r) => {
        if (!r.ok) throw new Error(`불러오기 실패 (${r.status})`);
        return (await r.json()) as { items: Array<{ id: string; title: string }> };
      })
      .then((data) => {
        const lines = data.items.map((x) => `• ${x.title}`).join("\n");
        setTaskListsText(lines || "(목록이 비어있습니다)");
      })
      .catch((e) => setTaskListsText(e instanceof Error ? e.message : "알 수 없는 오류"));
  }, [status]);

  return (
    <section className="panel">
      <h2 className="panel-title">구글 바로가기</h2>
      <p className="panel-desc">PWA에서도 유지되는 앱 세션(쿠키)로 로그인합니다. 새 탭 링크 + 앱 내부 목록 예시를 제공합니다.</p>

      <div className="panel-row">
        {status === "loading" ? (
          <span className="muted">세션 확인 중…</span>
        ) : status === "authenticated" ? (
          <>
            <span className="muted">
              로그인됨: {session.user?.name ?? session.user?.email ?? "Google 계정"}
              {session.refreshError ? " (세션 갱신 실패: 재로그인 필요)" : ""}
            </span>
            <button className="panel-btn" type="button" onClick={() => void signOut({ callbackUrl: "/" })}>
              로그아웃
            </button>
          </>
        ) : (
          <button className="panel-btn" type="button" onClick={() => void signIn("google", { callbackUrl: "/" })}>
            Google로 로그인
          </button>
        )}
      </div>

      <div className="panel-row" style={{ marginTop: "0.25rem" }}>
        <div style={{ width: "100%" }}>
          <div className="muted" style={{ marginBottom: "0.4rem" }}>
            내 Google Tasks 목록(예시)
          </div>
          <pre className="panel-output">{taskListsText}</pre>
        </div>
      </div>

      <ul className="link-grid">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link className="link-card" href={item.href} target="_blank" rel="noopener noreferrer">
              <span className="link-card-title">{item.title}</span>
              <span className="link-card-desc">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
