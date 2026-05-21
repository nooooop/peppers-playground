/** 서울시 지하철 실시간 도착정보 (열린데이터 / swopenapi.seoul.go.kr) */

import { getApiNameHint, resolveApiStationName } from "../data/subwayStationApiNames";

export type SubwayArrivalRow = {
  subwayId: string;
  subwayNm: string;
  statnNm: string;
  updnLine: string;
  trainLineNm: string;
  arvlMsg2: string;
  arvlMsg3: string;
  btrainSttus: string;
  barvlDt: string;
  bstatnNm: string;
};

export type StationArrivalResult = {
  stationName: string;
  ok: boolean;
  message?: string;
  arrivals: SubwayArrivalRow[];
};

/** 신·구 API 응답 (서울시 포맷 변경 대응) */
type SeoulApiPayload = {
  realtimeStationArrival?: {
    RESULT?: { CODE?: string; MESSAGE?: string };
    row?: RawArrival | RawArrival[];
  };
  errorMessage?: { code?: string; message?: string; status?: number };
  realtimeArrivalList?: RawArrival[];
  /** INFO-200 등 오류 시 최상위 필드 */
  code?: string;
  message?: string;
  status?: number;
};

type RawArrival = Partial<SubwayArrivalRow> & Record<string, unknown>;

const SEOUL_SUBWAY_BASE = "http://swopenapi.seoul.go.kr/api/subway";

const SUBWAY_LINE_NAMES: Record<string, string> = {
  "1001": "1호선",
  "1002": "2호선",
  "1003": "3호선",
  "1004": "4호선",
  "1005": "5호선",
  "1006": "6호선",
  "1007": "7호선",
  "1008": "8호선",
  "1009": "9호선",
  "1063": "경의중앙선",
  "1065": "공항철도",
  "1067": "인천1호선",
  "1069": "인천2호선",
  "1071": "수인분당선",
  "1075": "수인선",
  "1077": "신분당선",
  "1092": "우이신설선",
  "1093": "김포골드라인",
  "1032": "GTX-A",
};

function lineNameFromId(subwayId: string): string {
  return SUBWAY_LINE_NAMES[subwayId] ?? (subwayId ? `노선 ${subwayId}` : "지하철");
}

function normalizeRawRow(raw: RawArrival): SubwayArrivalRow {
  const subwayId = String(raw.subwayId ?? "");
  const subwayNm = String(raw.subwayNm ?? "").trim() || lineNameFromId(subwayId);
  return {
    subwayId,
    subwayNm,
    statnNm: String(raw.statnNm ?? ""),
    updnLine: String(raw.updnLine ?? ""),
    trainLineNm: String(raw.trainLineNm ?? ""),
    arvlMsg2: String(raw.arvlMsg2 ?? ""),
    arvlMsg3: String(raw.arvlMsg3 ?? ""),
    btrainSttus: String(raw.btrainSttus ?? ""),
    barvlDt: String(raw.barvlDt ?? ""),
    bstatnNm: String(raw.bstatnNm ?? ""),
  };
}

function normalizeRows(row: RawArrival | RawArrival[] | undefined): SubwayArrivalRow[] {
  if (!row) return [];
  const list = Array.isArray(row) ? row : [row];
  return list.map(normalizeRawRow);
}

export function parseSeoulSubwayResponse(data: SeoulApiPayload): {
  code: string;
  message: string;
  arrivals: SubwayArrivalRow[];
} {
  const legacy = data.realtimeStationArrival;
  if (legacy) {
    return {
      code: legacy.RESULT?.CODE ?? "",
      message: legacy.RESULT?.MESSAGE ?? "",
      arrivals: normalizeRows(legacy.row),
    };
  }

  const code = data.errorMessage?.code ?? data.code ?? "";
  const message = data.errorMessage?.message ?? data.message ?? "";

  return {
    code,
    message,
    arrivals: (data.realtimeArrivalList ?? []).map(normalizeRawRow),
  };
}

async function fetchStationArrivalsOnce(
  apiKey: string,
  apiStationName: string,
  endIndex: number
): Promise<{ code: string; message: string; arrivals: SubwayArrivalRow[] }> {
  const url = `${SEOUL_SUBWAY_BASE}/${encodeURIComponent(apiKey)}/json/realtimeStationArrival/0/${endIndex}/${encodeURIComponent(apiStationName)}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    return { code: "HTTP_ERROR", message: `조회 실패 (HTTP ${res.status})`, arrivals: [] };
  }

  const data = (await res.json()) as SeoulApiPayload;
  return parseSeoulSubwayResponse(data);
}

export async function fetchStationArrivals(
  apiKey: string,
  stationName: string,
  endIndex = 20
): Promise<StationArrivalResult> {
  const displayName = stationName.trim();
  if (!displayName) {
    return { stationName: displayName, ok: false, message: "역명이 비어 있습니다.", arrivals: [] };
  }

  const apiName = resolveApiStationName(displayName);

  let parsed: { code: string; message: string; arrivals: SubwayArrivalRow[] };
  try {
    parsed = await fetchStationArrivalsOnce(apiKey, apiName, endIndex);
  } catch {
    return {
      stationName: displayName,
      ok: false,
      message: "서울시 API에 연결할 수 없습니다.",
      arrivals: [],
    };
  }

  const { code, message: apiMessage, arrivals } = parsed;

  if (code && code !== "INFO-000") {
    const hint = getApiNameHint(displayName);
    const extra =
      code === "INFO-200" && hint
        ? ` API 공식 역명은 「${hint}」 입니다. 즐겨찾기를 삭제 후 다시 추가해 보세요.`
        : "";
    return {
      stationName: displayName,
      ok: false,
      message: (apiMessage || `API 오류 (${code})`) + extra,
      arrivals: [],
    };
  }

  if (arrivals.length === 0) {
    return {
      stationName: displayName,
      ok: true,
      message: "도착 예정 열차가 없거나 운행이 종료되었을 수 있습니다.",
      arrivals: [],
    };
  }

  return { stationName: displayName, ok: true, arrivals };
}

export function getSeoulSubwayApiKey(): string {
  const key = process.env.SEOUL_OPEN_API_KEY?.trim();
  if (!key || key === "sample" || key === "your-api-key") {
    return "sample";
  }
  return key;
}

export function isSampleApiKey(key: string): boolean {
  return key === "sample";
}

export type SeoulSubwayKeyMode = "sample" | "development";

export function getSeoulSubwayKeyMode(): SeoulSubwayKeyMode {
  return isSampleApiKey(getSeoulSubwayApiKey()) ? "sample" : "development";
}
