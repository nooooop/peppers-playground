import { headingKeywords, parseTrainHeadingFromRow } from "./parseTrainHeading";
import type { SubwayArrivalRow } from "./seoulSubway";

export type ArrivalSide = "left" | "right";

export type StationLineLayout = {
  subwayId: string;
  /** 노선 막대 왼쪽 끝 역명 (지도·안내용) */
  leftEndpoint: string;
  /** 노선 막대 오른쪽 끝 역명 (지도·안내용) */
  rightEndpoint: string;
  /** 열차가 이 방향(이웃 역 쪽)에서 오면 왼쪽 열에 도착 표시 */
  leftKeywords: string[];
  /** 열차가 이 방향에서 오면 오른쪽 열에 도착 표시 */
  rightKeywords: string[];
  /** API 상·하행 등 — 좌우 분류의 1순위 */
  leftUpdnLines: string[];
  rightUpdnLines: string[];
};

export type StationDiagramLayout = {
  stationName: string;
  lines: StationLineLayout[];
};

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => k.length > 0 && text.includes(k));
}

function normalizeUpdnLine(updnLine: string): string {
  return updnLine.trim();
}

function matchesEndpoint(heading: string, endpoint: string): boolean {
  if (!heading || !endpoint) return false;
  if (heading === endpoint) return true;
  return matchesAny(heading, headingKeywords(endpoint));
}

export function classifyArrivalSide(
  arrival: SubwayArrivalRow,
  line: StationLineLayout
): ArrivalSide {
  const updn = normalizeUpdnLine(arrival.updnLine);
  const heading = parseTrainHeadingFromRow(arrival);

  const hasDistinctSides =
    line.rightEndpoint &&
    line.leftEndpoint &&
    line.rightEndpoint !== line.leftEndpoint;

  if (hasDistinctSides && line.leftUpdnLines.length > 0 && line.rightUpdnLines.length > 0) {
    if (updn && line.leftUpdnLines.includes(updn)) return "left";
    if (updn && line.rightUpdnLines.includes(updn)) return "right";
  }

  if (hasDistinctSides && heading) {
    if (matchesEndpoint(heading, line.rightEndpoint) || matchesAny(heading, line.rightKeywords)) {
      return "right";
    }
    if (matchesEndpoint(heading, line.leftEndpoint) || matchesAny(heading, line.leftKeywords)) {
      return "left";
    }
  }

  return "left";
}
