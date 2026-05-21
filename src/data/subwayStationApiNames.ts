import { normalizeStationName } from "./seoulSubwayStations";

/**
 * 앱에서 쓰는 역명 → 서울시 Open API 공식 역명(STATN_NM)
 * API는 "이수" 대신 "총신대입구(이수)"처럼 병기명을 요구하는 경우가 많음.
 * (서울 열린데이터 역명 엑셀 기준)
 */
export const STATION_API_ALIASES: Record<string, string> = {
  이수: "총신대입구(이수)",
  증산: "증산(명지대앞)",
  명지대: "증산(명지대앞)",
  명지대앞: "증산(명지대앞)",
  총신대입구: "총신대입구(이수)",
};

export function resolveApiStationName(displayOrApiName: string): string {
  const key = normalizeStationName(displayOrApiName);
  return STATION_API_ALIASES[key] ?? displayOrApiName.trim();
}

/** API 역명이 별칭이 있으면 짧은 표기(즐겨찾기용) */
export function toDisplayStationName(name: string): string {
  const n = normalizeStationName(name);
  for (const [display, api] of Object.entries(STATION_API_ALIASES)) {
    if (api === name || api === n) return display;
  }
  const short = name.match(/^(.+?)\([^)]+\)$/);
  return short ? short[1]! : name;
}

export function getApiNameHint(displayName: string): string | null {
  const api = resolveApiStationName(displayName);
  if (api !== normalizeStationName(displayName)) return api;
  return null;
}
