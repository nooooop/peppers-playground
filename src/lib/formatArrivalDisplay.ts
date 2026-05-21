import type { SubwayArrivalRow } from "./seoulSubway";

/** API 행 → "응암행", "봉화산행" 등 */
export function formatDestinationLabel(row: SubwayArrivalRow): string {
  const lineMatch = row.trainLineNm.match(/^(.+?행)/);
  if (lineMatch?.[1]) return lineMatch[1];

  const dest = row.bstatnNm?.trim();
  if (dest && !dest.includes("순환") && !dest.includes("(")) {
    return dest.endsWith("행") ? dest : `${dest}행`;
  }

  const beforeDash = row.trainLineNm.split("-")[0]?.trim();
  if (beforeDash) return beforeDash.replace(/방면$/, "");

  return "열차";
}

function formatSecondsFromBarvl(totalSec: number): string {
  if (totalSec <= 0) return "곧 도착";
  if (totalSec < 60) return `${totalSec}초`;

  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}분 ${s}초`;
}

/**
 * API 조회 시점의 남은 시간만 표시 (갱신 전까지 고정, 클라이언트 추정 없음)
 * - barvlDt(초) 우선, 없으면 arvlMsg2/3 문구
 */
export function formatArrivalTime(row: SubwayArrivalRow): string {
  const barvl = parseInt(row.barvlDt, 10);
  if (!Number.isNaN(barvl) && barvl > 0) {
    return formatSecondsFromBarvl(barvl);
  }

  const msg = (row.arvlMsg2 || row.arvlMsg3 || "").replace(/\(.*?\)/g, "").trim();

  if (/전역\s*출발|도착$|진입|출발/.test(msg) && !/\d/.test(msg)) {
    return "곧 도착";
  }

  const minSec = msg.match(/(\d+)\s*분\s*(\d+)\s*초/);
  if (minSec) return `${minSec[1]}분 ${minSec[2]}초`;

  const minOnly = msg.match(/(\d+)\s*분/);
  if (minOnly) return `${minOnly[1]}분`;

  const secOnly = msg.match(/(\d+)\s*초/);
  if (secOnly) return `${secOnly[1]}초`;

  if (msg) return msg;

  return "—";
}
