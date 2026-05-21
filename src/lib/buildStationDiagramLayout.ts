import type { StationDiagramLayout, StationLineLayout } from "./classifyArrivalSide";
import { headingKeywords, parseTrainHeadingFromRow } from "./parseTrainHeading";
import type { SubwayArrivalRow } from "./seoulSubway";

type UpdnGroup = {
  updn: string;
  count: number;
  headings: Map<string, number>;
};

function dominantHeading(group: UpdnGroup): string {
  let best = "";
  let bestCount = 0;
  for (const [heading, count] of group.headings) {
    if (count > bestCount) {
      best = heading;
      bestCount = count;
    }
  }
  return best;
}

function collectUpdnGroups(rows: SubwayArrivalRow[]): UpdnGroup[] {
  const map = new Map<string, UpdnGroup>();

  for (const row of rows) {
    const updn = row.updnLine?.trim() || "";
    const heading = parseTrainHeadingFromRow(row);
    if (!updn) continue;

    let group = map.get(updn);
    if (!group) {
      group = { updn, count: 0, headings: new Map() };
      map.set(updn, group);
    }
    group.count += 1;
    if (heading) {
      group.headings.set(heading, (group.headings.get(heading) ?? 0) + 1);
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** 상·하행 그룹이 없을 때 방면(heading) 통계로 폴백 */
function collectHeadingOnlyGroups(rows: SubwayArrivalRow[]): { left: string; right: string } | null {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const heading = parseTrainHeadingFromRow(row);
    if (!heading) continue;
    counts.set(heading, (counts.get(heading) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  return {
    left: sorted[0][0],
    right: sorted[1]?.[0] ?? sorted[0][0],
  };
}

function orderTwoUpdnGroups(a: UpdnGroup, b: UpdnGroup): [UpdnGroup, UpdnGroup] {
  const ha = dominantHeading(a);
  const hb = dominantHeading(b);
  if (ha && hb && ha !== hb) {
    return ha.localeCompare(hb, "ko") <= 0 ? [a, b] : [b, a];
  }
  const rank = (u: string) => (u === "상행" || u === "0" ? 0 : u === "하행" || u === "1" ? 1 : 2);
  return rank(a.updn) <= rank(b.updn) ? [a, b] : [b, a];
}

function buildLineLayout(subwayId: string, rows: SubwayArrivalRow[]): StationLineLayout | null {
  const updnGroups = collectUpdnGroups(rows);

  if (updnGroups.length >= 2) {
    const [leftGroup, rightGroup] = orderTwoUpdnGroups(updnGroups[0], updnGroups[1]);
    const leftHeading = dominantHeading(leftGroup);
    const rightHeading = dominantHeading(rightGroup);

    return {
      subwayId,
      leftEndpoint: leftHeading,
      rightEndpoint: rightHeading,
      leftKeywords: headingKeywords(leftHeading),
      rightKeywords: headingKeywords(rightHeading),
      leftUpdnLines: [leftGroup.updn],
      rightUpdnLines: [rightGroup.updn],
    };
  }

  if (updnGroups.length === 1) {
    const g = updnGroups[0];
    const heading = dominantHeading(g);
    return {
      subwayId,
      leftEndpoint: heading,
      rightEndpoint: heading,
      leftKeywords: headingKeywords(heading),
      rightKeywords: headingKeywords(heading),
      leftUpdnLines: [g.updn],
      rightUpdnLines: [g.updn],
    };
  }

  const headings = collectHeadingOnlyGroups(rows);
  if (!headings) return null;

  return {
    subwayId,
    leftEndpoint: headings.left,
    rightEndpoint: headings.right,
    leftKeywords: headingKeywords(headings.left),
    rightKeywords: headingKeywords(headings.right),
    leftUpdnLines: [],
    rightUpdnLines: [],
  };
}

const LINE_SORT_ORDER: Record<string, number> = {
  "1001": 1,
  "1002": 2,
  "1003": 3,
  "1004": 4,
  "1005": 5,
  "1006": 6,
  "1007": 7,
  "1008": 8,
  "1009": 9,
  "1063": 10,
  "1065": 11,
  "1071": 12,
  "1077": 13,
};

function lineSortKey(subwayId: string): number {
  return LINE_SORT_ORDER[subwayId] ?? 100 + parseInt(subwayId, 10);
}

/**
 * API 도착 목록만으로 역별 노선도 레이아웃 생성 (즐겨찾기 역 동적 대응)
 */
export function buildStationDiagramLayout(
  stationName: string,
  arrivals: SubwayArrivalRow[]
): StationDiagramLayout | null {
  if (arrivals.length === 0) return null;

  const byLine = new Map<string, SubwayArrivalRow[]>();
  for (const row of arrivals) {
    const id = row.subwayId?.trim() || "unknown";
    const list = byLine.get(id) ?? [];
    list.push(row);
    byLine.set(id, list);
  }

  const lines: StationLineLayout[] = [];
  for (const [subwayId, lineRows] of byLine) {
    const layout = buildLineLayout(subwayId, lineRows);
    if (layout) lines.push(layout);
  }

  if (lines.length === 0) return null;

  lines.sort((a, b) => lineSortKey(a.subwayId) - lineSortKey(b.subwayId));

  return { stationName, lines };
}
