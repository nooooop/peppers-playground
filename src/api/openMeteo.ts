/** Open-Meteo: 키 없이 사용 (https://open-meteo.com/) */

export type GeocodeHit = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export async function searchCity(query: string): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "ko");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`지오코딩 실패 (${res.status})`);
  const data = (await res.json()) as {
    results?: Array<{
      name: string;
      country: string;
      latitude: number;
      longitude: number;
    }>;
  };
  const hit = data.results?.[0];
  if (!hit) return null;
  return {
    name: hit.name,
    country: hit.country,
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}

export type CurrentWeather = {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
};

export async function fetchCurrentWeather(
  lat: number,
  lon: number
): Promise<CurrentWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`날씨 조회 실패 (${res.status})`);
  const data = (await res.json()) as {
    current: {
      time: string;
      temperature_2m: number;
      weather_code: number;
      wind_speed_10m: number;
    };
  };
  const c = data.current;
  return {
    temperature: c.temperature_2m,
    windspeed: c.wind_speed_10m,
    weathercode: c.weather_code,
    time: c.time,
  };
}

/** WMO 코드 → 짧은 한글 설명 (일부만 매핑) */
export function weatherCodeLabel(code: number): string {
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
