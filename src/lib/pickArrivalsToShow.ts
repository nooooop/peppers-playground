import type { SubwayArrivalRow } from "./seoulSubway";

export const MAX_ARRIVALS_PER_COLUMN = 2;

/** 작을수록 더 곧 도착 */
export function getArrivalSortKey(row: SubwayArrivalRow): number {
  const barvl = parseInt(row.barvlDt, 10);
  const msg = (row.arvlMsg2 || row.arvlMsg3 || "").replace(/\(.*?\)/g, "").trim();

  if (!Number.isNaN(barvl) && barvl > 0) return barvl;

  if (/전역\s*출발|도착$|진입|출발/.test(msg) && !/\d+\s*분/.test(msg)) {
    return 0;
  }

  const minSec = msg.match(/(\d+)\s*분\s*(\d+)\s*초/);
  if (minSec) return parseInt(minSec[1], 10) * 60 + parseInt(minSec[2], 10);

  const minOnly = msg.match(/(\d+)\s*분/);
  if (minOnly) return parseInt(minOnly[1], 10) * 60;

  const nth = msg.match(/\[(\d+)\]번째\s*전역/);
  if (nth) return 8_000 + parseInt(nth[1], 10) * 90;

  const secOnly = msg.match(/(\d+)\s*초/);
  if (secOnly) return parseInt(secOnly[1], 10);

  if (!Number.isNaN(barvl) && barvl === 0) return 9_000;

  return 99_999;
}

/** 방향별로 가장 가까운 열차만 최대 N개 */
export function pickArrivalsToShow(
  rows: SubwayArrivalRow[],
  limit = MAX_ARRIVALS_PER_COLUMN
): SubwayArrivalRow[] {
  return [...rows].sort((a, b) => getArrivalSortKey(a) - getArrivalSortKey(b)).slice(0, limit);
}
