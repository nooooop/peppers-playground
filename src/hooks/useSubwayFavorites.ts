"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeStationName } from "../data/seoulSubwayStations";

export type SubwayFavorite = {
  id: string;
  name: string;
};

const STORAGE_KEY = "peppers-subway-favorites-v1";
export const MAX_SUBWAY_FAVORITES = 5;

function loadFavorites(): SubwayFavorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is SubwayFavorite => {
        return (
          typeof x === "object" &&
          x !== null &&
          typeof (x as SubwayFavorite).id === "string" &&
          typeof (x as SubwayFavorite).name === "string"
        );
      })
      .slice(0, MAX_SUBWAY_FAVORITES);
  } catch {
    return [];
  }
}

export function useSubwayFavorites() {
  const [favorites, setFavorites] = useState<SubwayFavorite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const addFavorite = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false as const, reason: "역명을 입력하세요." };
    setFavorites((prev) => {
      if (prev.some((f) => f.name === trimmed)) {
        return prev;
      }
      if (prev.length >= MAX_SUBWAY_FAVORITES) {
        return prev;
      }
      return [...prev, { id: crypto.randomUUID(), name: trimmed }];
    });
    return { ok: true as const };
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const isFull = favorites.length >= MAX_SUBWAY_FAVORITES;
  const hasDuplicate = useCallback(
    (name: string) => favorites.some((f) => f.name === normalizeStationName(name)),
    [favorites]
  );

  return {
    favorites,
    hydrated,
    addFavorite,
    removeFavorite,
    isFull,
    hasDuplicate,
  };
}
