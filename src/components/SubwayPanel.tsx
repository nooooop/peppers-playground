"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterStationNames,
  isLikelyStationName,
  normalizeStationName,
} from "../data/seoulSubwayStations";
import { useDocumentVisible } from "../hooks/useDocumentVisible";
import {
  MAX_SUBWAY_FAVORITES,
  useSubwayFavorites,
} from "../hooks/useSubwayFavorites";
import { getStationDiagramLayout } from "../data/subwayStationLayouts";
import type { StationArrivalResult, SubwayArrivalRow } from "../lib/seoulSubway";
import { SubwayStationDiagram } from "./SubwayStationDiagram";

const REFRESH_SEC = 20;
const REFRESH_MS = REFRESH_SEC * 1000;

type ArrivalsResponse = {
  updatedAt: string;
  stations: StationArrivalResult[];
};

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  } catch {
    return iso;
  }
}

function ArrivalCard({ row }: { row: SubwayArrivalRow }) {
  return (
    <li className="arrival-item">
      <span className="arrival-line">{row.subwayNm}</span>
      <span className="arrival-dir">{row.trainLineNm}</span>
      <span className="arrival-msg">{row.arvlMsg2 || row.arvlMsg3}</span>
    </li>
  );
}

function StationBlock({ result }: { result: StationArrivalResult }) {
  const diagramLayout = getStationDiagramLayout(result.stationName);

  if (!result.ok && result.message) {
    return (
      <article className="station-block">
        <h3 className="station-name">{result.stationName}</h3>
        <p className="station-hint error">{result.message}</p>
      </article>
    );
  }

  if (result.ok && result.arrivals.length === 0 && result.message) {
    return (
      <article className="station-block">
        <h3 className="station-name">{result.stationName}</h3>
        <p className="station-hint">{result.message}</p>
      </article>
    );
  }

  if (diagramLayout && result.arrivals.length > 0) {
    return <SubwayStationDiagram result={result} layout={diagramLayout} />;
  }

  return (
    <article className="station-block">
      <h3 className="station-name">{result.stationName}</h3>
      {result.arrivals.length > 0 ? (
        <ul className="arrival-list">
          {result.arrivals.map((row, i) => (
            <ArrivalCard key={`${row.subwayId}-${row.updnLine}-${row.btrainSttus}-${i}`} row={row} />
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function SubwayPanel({ active }: { active: boolean }) {
  const visible = useDocumentVisible();
  const { favorites, hydrated, addFavorite, removeFavorite, isFull, hasDuplicate } =
    useSubwayFavorites();

  const [query, setQuery] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [data, setData] = useState<ArrivalsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_SEC);

  const suggestions = useMemo(() => filterStationNames(query), [query]);
  const stationNames = useMemo(() => favorites.map((f) => f.name), [favorites]);

  const fetchArrivals = useCallback(async () => {
    if (stationNames.length === 0) {
      setData(null);
      setFetchError(null);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/subway/arrivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stations: stationNames }),
      });
      const json = (await res.json()) as ArrivalsResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? `조회 실패 (${res.status})`);
      }
      setData(json);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
      setCountdown(REFRESH_SEC);
    }
  }, [stationNames]);

  const shouldPoll = active && visible && stationNames.length > 0;

  useEffect(() => {
    if (!shouldPoll) {
      setCountdown(REFRESH_SEC);
      return;
    }
    setCountdown(REFRESH_SEC);
    void fetchArrivals();
    const refreshId = window.setInterval(() => void fetchArrivals(), REFRESH_MS);
    return () => window.clearInterval(refreshId);
  }, [shouldPoll, fetchArrivals]);

  useEffect(() => {
    if (!shouldPoll) return;
    const tickId = window.setInterval(() => {
      setCountdown((sec) => (sec <= 1 ? REFRESH_SEC : sec - 1));
    }, 1000);
    return () => window.clearInterval(tickId);
  }, [shouldPoll]);

  function tryAddStation(name: string) {
    setAddError(null);
    const trimmed = normalizeStationName(name);
    if (!trimmed) {
      setAddError("역명을 입력하세요.");
      return;
    }
    if (!isLikelyStationName(trimmed)) {
      setAddError("역명이 너무 짧거나 깁니다.");
      return;
    }
    if (hasDuplicate(trimmed)) {
      setAddError("이미 즐겨찾기에 있습니다.");
      return;
    }
    if (isFull) {
      setAddError(`즐겨찾기는 최대 ${MAX_SUBWAY_FAVORITES}개까지입니다.`);
      return;
    }
    addFavorite(trimmed);
    setQuery("");
  }

  function onAddStation() {
    tryAddStation(query);
  }

  if (!hydrated) {
    return (
      <section className="panel">
        <p className="panel-placeholder">불러오는 중…</p>
      </section>
    );
  }

  return (
    <section className="panel subway-panel">
      <h2 className="panel-title">지하철 도착</h2>
      <p className="panel-desc">
        즐겨찾기 역(최대 {MAX_SUBWAY_FAVORITES}개). 화면이 보일 때만 {REFRESH_SEC}초마다
        갱신합니다. 자동완성은 주요 역만 보여 주며, 서울·수도권 역명(예: 증산, 증산역)을 입력해
        추가할 수 있습니다.
      </p>

      <div className="subway-add">
        <label className="field-label" htmlFor="subway-station-input">
          역 추가
        </label>
        <div className="panel-row">
          <input
            id="subway-station-input"
            className="subway-input"
            list="subway-station-suggestions"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAddError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddStation();
              }
            }}
            placeholder="역명 검색 (예: 증산, 강남)"
            disabled={isFull}
            autoComplete="off"
          />
          <datalist id="subway-station-suggestions">
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <button type="button" className="panel-btn" onClick={onAddStation} disabled={isFull}>
            추가
          </button>
        </div>

        {stationNames.length > 0 ? (
          <div className="refresh-timer" aria-live="polite">
            {!visible ? (
              <span className="refresh-timer-paused">백그라운드 — 갱신·타이머 일시정지</span>
            ) : loading ? (
              <span className="refresh-timer-active">갱신 중…</span>
            ) : (
              <span className="refresh-timer-active">
                다음 갱신까지 <strong className="refresh-timer-sec">{countdown}</strong>초
              </span>
            )}
          </div>
        ) : null}

        {suggestions.length > 0 && query.trim() ? (
          <ul className="suggestion-list" role="listbox" aria-label="역명 제안">
            {suggestions.map((name) => (
              <li key={name}>
                <button type="button" className="suggestion-btn" onClick={() => tryAddStation(name)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {addError ? <p className="field-error">{addError}</p> : null}
        {isFull ? (
          <p className="field-hint">즐겨찾기가 가득 찼습니다. 아래에서 삭제 후 추가하세요.</p>
        ) : null}
      </div>

      <section className="favorites-section" aria-label="즐겨찾기 역">
        <h3 className="section-title">
          즐겨찾기 ({favorites.length}/{MAX_SUBWAY_FAVORITES})
        </h3>
        {favorites.length === 0 ? (
          <p className="panel-placeholder">역을 추가하면 도착정보가 표시됩니다.</p>
        ) : (
          <ul className="favorite-chips">
            {favorites.map((f) => (
              <li key={f.id}>
                <span className="fav-chip">
                  {f.name}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => removeFavorite(f.id)}
                    aria-label={`${f.name} 삭제`}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data?.updatedAt && stationNames.length > 0 ? (
        <p className="status-time">마지막 갱신: {formatUpdatedAt(data.updatedAt)}</p>
      ) : null}

      {fetchError ? <p className="field-error">{fetchError}</p> : null}

      {stationNames.length > 0 && data?.stations ? (
        <div className="station-results">
          {data.stations.map((result) => (
            <StationBlock key={result.stationName} result={result} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
