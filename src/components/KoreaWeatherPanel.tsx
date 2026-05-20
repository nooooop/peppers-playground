"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type City = { id: string; label: string; lat: number; lon: number };

const KOREA_CITIES: City[] = [
  { id: "seoul", label: "서울", lat: 37.5665, lon: 126.978 },
  { id: "busan", label: "부산", lat: 35.1796, lon: 129.0756 },
  { id: "incheon", label: "인천", lat: 37.4563, lon: 126.7052 },
  { id: "daegu", label: "대구", lat: 35.8714, lon: 128.6014 },
  { id: "daejeon", label: "대전", lat: 36.3504, lon: 127.3845 },
  { id: "gwangju", label: "광주", lat: 35.1595, lon: 126.8526 },
  { id: "jeju", label: "제주", lat: 33.4996, lon: 126.5312 },
];

type CurrentWeather = {
  temperature_2m: number;
  wind_speed_10m: number;
  weather_code: number;
  time: string;
};

function weatherCodeLabel(code: number): string {
  const map: Record<number, string> = {
    0: "맑음",
    1: "대체로 맑음",
    2: "부분적으로 흐림",
    3: "흐림",
    45: "안개",
    48: "안개",
    51: "이슬비 약함",
    53: "이슬비",
    55: "이슬비 강함",
    61: "비 약함",
    63: "비",
    65: "비 강함",
    71: "눈 약함",
    73: "눈",
    75: "눈 강함",
    80: "소나기 약함",
    81: "소나기",
    82: "소나기 강함",
    95: "천둥번개 동반 비",
    96: "우박 동반 천둥번개",
    99: "우박 동반 천둥번개",
  };
  return map[code] ?? `기상코드 ${code}`;
}

async function fetchWeather(lat: number, lon: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set("timezone", "Asia/Seoul");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`날씨 조회 실패 (${res.status})`);
  const data = (await res.json()) as { current: CurrentWeather };
  return data.current;
}

export function KoreaWeatherPanel() {
  const [cityId, setCityId] = useState<string>("seoul");
  const city = useMemo(() => KOREA_CITIES.find((c) => c.id === cityId) ?? KOREA_CITIES[0]!, [cityId]);

  const [weatherText, setWeatherText] = useState<string>("불러오는 중…");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const w = await fetchWeather(city.lat, city.lon);
      setWeatherText(
        [
          `${city.label}, 대한민국`,
          `기온: ${w.temperature_2m.toFixed(1)} °C`,
          `상태: ${weatherCodeLabel(w.weather_code)}`,
          `풍속: ${w.wind_speed_10m.toFixed(1)} km/h`,
          `관측 시각(Asia/Seoul): ${w.time}`,
        ].join("\n")
      );
    } catch (err) {
      setWeatherText(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="panel">
      <h2 className="panel-title">한국 날씨</h2>
      <p className="panel-desc">기본 지역은 서울입니다. 다른 지역은 아래에서 선택하세요. (Open‑Meteo, 키 불필요)</p>
      <div className="panel-row">
        <select
          className="panel-select"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          aria-label="지역 선택"
          disabled={loading}
        >
          {KOREA_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button className="panel-btn" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? "새로고침 중…" : "새로고침"}
        </button>
      </div>
      <pre className="panel-output" aria-live="polite">
        {weatherText}
      </pre>
    </section>
  );
}
