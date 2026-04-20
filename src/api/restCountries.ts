/** REST Countries: 키 없이 사용 (https://restcountries.com/) */

export type CountrySummary = {
  name: string;
  capital: string;
  region: string;
  population: number;
  flagEmoji: string;
};

function pickRandom<T>(items: T[]): T {
  const i = Math.floor(Math.random() * items.length);
  return items[i]!;
}

export async function fetchRandomCountry(): Promise<CountrySummary> {
  const res = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,region,population,cca2");
  if (!res.ok) throw new Error(`국가 목록 실패 (${res.status})`);
  const list = (await res.json()) as Array<{
    name: { common: string };
    capital?: string[];
    region: string;
    population: number;
    cca2: string;
  }>;
  const c = pickRandom(list);
  const capital = c.capital?.[0] ?? "—";
  const codePoints = [...c.cca2.toUpperCase()].map((ch) => 127397 + ch.charCodeAt(0));
  const flagEmoji = String.fromCodePoint(...codePoints);
  return {
    name: c.name.common,
    capital,
    region: c.region,
    population: c.population,
    flagEmoji,
  };
}
