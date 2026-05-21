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
};

export type StationDiagramLayout = {
  stationName: string;
  lines: StationLineLayout[];
};

function haystack(arrival: SubwayArrivalRow): string {
  return `${arrival.trainLineNm} ${arrival.bstatnNm} ${arrival.arvlMsg2} ${arrival.arvlMsg3}`;
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => k.length > 0 && text.includes(k));
}

/** trainLineNm 의 "OOO방면" 구간 */
function headingFragment(trainLineNm: string): string {
  const part = trainLineNm.split("-").pop()?.trim() ?? trainLineNm;
  return part.replace(/방면$/, "");
}

export function classifyArrivalSide(
  arrival: SubwayArrivalRow,
  line: StationLineLayout
): ArrivalSide {
  const text = haystack(arrival);
  const heading = headingFragment(arrival.trainLineNm);

  if (matchesAny(heading, line.rightKeywords) || matchesAny(text, line.rightKeywords)) {
    return "right";
  }
  if (matchesAny(heading, line.leftKeywords) || matchesAny(text, line.leftKeywords)) {
    return "left";
  }

  return "left";
}
