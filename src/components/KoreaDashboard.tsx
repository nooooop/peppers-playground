"use client";

import { useMemo, useState } from "react";

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

async function fetchSeoulTimeWeather(lat: number, lon: number) {
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

type KoreaCountry = {
  name: string;
  capital: string;
  region: string;
  population: number;
  flagEmoji: string;
};

async function fetchKorea(): Promise<KoreaCountry> {
  const res = await fetch("https://restcountries.com/v3.1/alpha/KR?fields=name,capital,region,population,cca2");
  if (!res.ok) throw new Error(`국가 정보 실패 (${res.status})`);
  const c = (await res.json()) as Array<{
    name: { common: string };
    capital?: string[];
    region: string;
    population: number;
    cca2: string;
  }>;
  const k = c[0];
  if (!k) throw new Error("국가 정보를 찾을 수 없습니다.");
  const capital = k.capital?.[0] ?? "—";
  const codePoints = [...k.cca2.toUpperCase()].map((ch) => 127397 + ch.charCodeAt(0));
  const flagEmoji = String.fromCodePoint(...codePoints);
  return {
    name: k.name.common,
    capital,
    region: k.region,
    population: k.population,
    flagEmoji,
  };
}

export function KoreaDashboard() {
  const [cityId, setCityId] = useState<string>("seoul");
  const city = useMemo(() => KOREA_CITIES.find((c) => c.id === cityId) ?? KOREA_CITIES[0]!, [cityId]);

  const [weatherText, setWeatherText] = useState<string>("도시를 선택하고 조회를 눌러보세요.");
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [countryText, setCountryText] = useState<string>("버튼을 눌러 대한민국 정보를 불러오세요.");
  const [countryLoading, setCountryLoading] = useState(false);

  async function onWeather() {
    setWeatherLoading(true);
    setWeatherText("불러오는 중…");
    try {
      const w = await fetchSeoulTimeWeather(city.lat, city.lon);
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
      setWeatherLoading(false);
    }
  }

  async function onCountry() {
    setCountryLoading(true);
    setCountryText("불러오는 중…");
    try {
      const k = await fetchKorea();
      setCountryText(
        [
          `${k.flagEmoji} ${k.name}`,
          `수도: ${k.capital}`,
          `지역: ${k.region}`,
          `인구: ${k.population.toLocaleString("ko-KR")}`,
        ].join("\n")
      );
    } catch (err) {
      setCountryText(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setCountryLoading(false);
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2 className="card-title">한국 도시 날씨</h2>
        <p className="card-desc">대한민국 주요 도시를 선택해 현재 기온·풍속·하늘 상태를 봅니다. (키 없이 동작)</p>
        <div className="row">
          <select
            className="select"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            aria-label="도시 선택"
          >
            {KOREA_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <button className="btn primary" onClick={() => void onWeather()} disabled={weatherLoading}>
            {weatherLoading ? "조회 중…" : "조회"}
          </button>
        </div>
        <pre className="output">{weatherText}</pre>
      </section>

      <section className="card">
        <h2 className="card-title">대한민국 정보</h2>
        <p className="card-desc">REST Countries에서 대한민국 요약 정보를 가져옵니다. (키 없이 동작)</p>
        <div className="row">
          <button className="btn ghost" onClick={() => void onCountry()} disabled={countryLoading}>
            {countryLoading ? "불러오는 중…" : "불러오기"}
          </button>
        </div>
        <pre className="output">{countryText}</pre>
      </section>
    </div>
  );
}

