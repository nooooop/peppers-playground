"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export type BottomNavTab = {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
};

type Props = {
  /** 탭을 추가할 때는 이 배열에 항목만 더하면 됩니다. */
  tabs: BottomNavTab[];
  /** 초기 활성 탭 id (없으면 첫 번째 탭) */
  defaultTabId?: string;
};

export function BottomNavShell({ tabs, defaultTabId }: Props) {
  const firstId = tabs[0]?.id ?? "";
  const [activeId, setActiveId] = useState(defaultTabId ?? firstId);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const panelId = "main-tab-panel";

  return (
    <div className="app-shell">
      <div className="app-shell-main">
        {active ? (
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            className="app-shell-panel-wrap"
          >
            {active.content}
          </div>
        ) : null}
      </div>

      <nav className="bottom-nav" aria-label="주 메뉴">
        <div className="bottom-nav-scroll" role="tablist">
          {tabs.map((tab) => {
            const selected = tab.id === active?.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className={`bottom-nav-tab${selected ? " bottom-nav-tab--active" : ""}`}
                onClick={() => setActiveId(tab.id)}
              >
                {tab.icon ? (
                  <span className="bottom-nav-tab-icon" aria-hidden="true">
                    {tab.icon}
                  </span>
                ) : null}
                <span className="bottom-nav-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
