"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterStationNames,
  SEOUL_SUBWAY_STATION_NAMES,
} from "../data/seoulSubwayStations";
import { useDocumentVisible } from "../hooks/useDocumentVisible";
import {
  MAX_SUBWAY_FAVORITES,
  useSubwayFavorites,
} from "../hooks/useSubwayFavorites";
import type { StationArrivalResult, SubwayArrivalRow } from "../lib/seoulSubway";

const REFRESH_MS = 10_000;
const STATION_SET = new Set<string>(SEOUL_SUBWAY_STATION_NAMES);

type ArrivalsResponse = {
  updatedAt: string;
  usingSampleKey?: boolean;
  stations: StationArrivalResult[];
};

type KeyConfig = {
  mode: "sample" | "development";
  configured: boolean;
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
  return (
    <article className="station-block">
      <h3 className="station-name">{result.stationName}</h3>
      {!result.ok && result.message ? (
        <p className="station-hint error">{result.message}</p>
      ) : null}
      {result.ok && result.arrivals.length === 0 && result.message ? (
        <p className="station-hint">{result.message}</p>
      ) : null}
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
  const [keyConfig, setKeyConfig] = useState<KeyConfig | null>(null);

  useEffect(() => {
    if (!active) return;
    void fetch("/api/subway/config")
      .then((r) => r.json())
      .then((json: KeyConfig) => setKeyConfig(json))
      .catch(() => setKeyConfig(null));
  }, [active]);

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
    }
  }, [stationNames]);

  const shouldPoll = active && visible && stationNames.length > 0;

  useEffect(() => {
    if (!shouldPoll) return;
    void fetchArrivals();
    const id = window.setInterval(() => void fetchArrivals(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [shouldPoll, fetchArrivals]);

  function tryAddStation(name: string) {
    setAddError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setAddError("역명을 입력하세요.");
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
    if (!STATION_SET.has(trimmed)) {
      setAddError("목록에 있는 역명을 정확히 입력하세요. (예: 강남, 홍대입구)");
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
        즐겨찾기 역(최대 {MAX_SUBWAY_FAVORITES}개). 화면이 보일 때만 {REFRESH_MS / 1000}초마다
        갱신합니다.
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
            placeholder="역명 검색 (예: 강남)"
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

      <div className="status-row">
        {loading ? <span className="status-pill">갱신 중…</span> : null}
        {!visible && stationNames.length > 0 ? (
          <span className="status-pill muted">백그라운드 — 갱신 일시중지</span>
        ) : null}
        {shouldPoll && !loading ? (
          <span className="status-pill live">화면 켜짐 — 자동 갱신</span>
        ) : null}
        {data?.updatedAt ? (
          <span className="status-time">마지막 갱신: {formatUpdatedAt(data.updatedAt)}</span>
        ) : null}
      </div>

      {keyConfig?.mode === "development" || (data && !data.usingSampleKey) ? (
        <p className="api-notice api-notice--ok">정식 인증키(개발계정)로 조회 중입니다.</p>
      ) : (
        <p className="api-notice">
          지금은 <strong>sample</strong> 키입니다. 공공데이터포털에서 발급한 키를{" "}
          <code>SEOUL_OPEN_API_KEY</code>에 넣으세요.{" "}
          <a
            className="api-notice-link"
            href="https://www.data.go.kr/data/15125683/openapi.do"
            target="_blank"
            rel="noopener noreferrer"
          >
            활용신청
          </a>
          · 로컬: <code>.env.local</code> · 배포: 호스팅 환경 변수 후 재배포
        </p>
      )}

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
