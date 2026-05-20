import { NextResponse } from "next/server";
import {
  fetchStationArrivals,
  getSeoulSubwayApiKey,
  isSampleApiKey,
  type StationArrivalResult,
} from "../../../../src/lib/seoulSubway";

const MAX_STATIONS = 5;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const stationsRaw = (body as { stations?: unknown }).stations;
  if (!Array.isArray(stationsRaw)) {
    return NextResponse.json({ error: "stations 배열이 필요합니다." }, { status: 400 });
  }

  const stations = [...new Set(stationsRaw.map((s) => String(s).trim()).filter(Boolean))].slice(
    0,
    MAX_STATIONS
  );

  if (stations.length === 0) {
    return NextResponse.json({ error: "조회할 역이 없습니다." }, { status: 400 });
  }

  const apiKey = getSeoulSubwayApiKey();
  const endIndex = isSampleApiKey(apiKey) ? 5 : 20;

  const results: StationArrivalResult[] = await Promise.all(
    stations.map((name) => fetchStationArrivals(apiKey, name, endIndex))
  );

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    usingSampleKey: isSampleApiKey(apiKey),
    stations: results,
  });
}
