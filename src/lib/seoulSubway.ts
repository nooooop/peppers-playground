/** 서울시 지하철 실시간 도착정보 (열린데이터 / swopenapi.seoul.go.kr) */

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
};

export type StationArrivalResult = {
  stationName: string;
  ok: boolean;
  message?: string;
  arrivals: SubwayArrivalRow[];
};

type SeoulApiRoot = {
  realtimeStationArrival?: {
    RESULT?: { CODE?: string; MESSAGE?: string };
    row?: SubwayArrivalRow | SubwayArrivalRow[];
  };
};

const SEOUL_SUBWAY_BASE = "http://swopenapi.seoul.go.kr/api/subway";

function normalizeRows(row: SubwayArrivalRow | SubwayArrivalRow[] | undefined): SubwayArrivalRow[] {
  if (!row) return [];
  return Array.isArray(row) ? row : [row];
}

export async function fetchStationArrivals(
  apiKey: string,
  stationName: string,
  endIndex = 20
): Promise<StationArrivalResult> {
  const name = stationName.trim();
  if (!name) {
    return { stationName: name, ok: false, message: "역명이 비어 있습니다.", arrivals: [] };
  }

  const url = `${SEOUL_SUBWAY_BASE}/${encodeURIComponent(apiKey)}/json/realtimeStationArrival/0/${endIndex}/${encodeURIComponent(name)}`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 0 } });
  } catch {
    return { stationName: name, ok: false, message: "서울시 API에 연결할 수 없습니다.", arrivals: [] };
  }

  if (!res.ok) {
    return { stationName: name, ok: false, message: `조회 실패 (HTTP ${res.status})`, arrivals: [] };
  }

  let data: SeoulApiRoot;
  try {
    data = (await res.json()) as SeoulApiRoot;
  } catch {
    return { stationName: name, ok: false, message: "응답을 해석할 수 없습니다.", arrivals: [] };
  }

  const block = data.realtimeStationArrival;
  const code = block?.RESULT?.CODE ?? "";
  const apiMessage = block?.RESULT?.MESSAGE ?? "";

  if (code && code !== "INFO-000") {
    return {
      stationName: name,
      ok: false,
      message: apiMessage || `API 오류 (${code})`,
      arrivals: [],
    };
  }

  const arrivals = normalizeRows(block?.row);
  if (arrivals.length === 0) {
    return {
      stationName: name,
      ok: true,
      message: "도착 예정 열차가 없거나 운행이 종료되었을 수 있습니다.",
      arrivals: [],
    };
  }

  return { stationName: name, ok: true, arrivals };
}

export function getSeoulSubwayApiKey(): string {
  const key = process.env.SEOUL_OPEN_API_KEY?.trim();
  return key || "sample";
}

export function isSampleApiKey(key: string): boolean {
  return key === "sample";
}
