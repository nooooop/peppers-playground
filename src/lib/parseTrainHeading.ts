import type { SubwayArrivalRow } from "./seoulSubway";

/** trainLineNm 에서 진행 방면 역명 (예: "녹사평방면" → "녹사평") */
export function parseTrainHeading(trainLineNm: string): string {
  const trimmed = trainLineNm.trim();
  if (!trimmed) return "";

  const afterDash = trimmed.includes("-") ? trimmed.split("-").pop()!.trim() : trimmed;
  return afterDash.replace(/방면$/u, "").trim();
}

export function parseTrainHeadingFromRow(row: SubwayArrivalRow): string {
  const fromLine = parseTrainHeading(row.trainLineNm);
  if (fromLine) return fromLine;

  const dest = row.bstatnNm?.trim();
  if (dest && !dest.includes("순환")) {
    return dest.replace(/행$/u, "").trim();
  }

  return "";
}

/** 헤더·키워드 매칭용 짧은 키워드 */
export function headingKeywords(heading: string): string[] {
  if (!heading) return [];
  const keys = new Set<string>([heading]);

  const beforeParen = heading.split("(")[0]?.trim();
  if (beforeParen && beforeParen !== heading) keys.add(beforeParen);

  const inside = heading.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (inside) keys.add(inside);

  return [...keys].filter((k) => k.length >= 2);
}
