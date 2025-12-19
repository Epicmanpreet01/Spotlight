// src/utils/locationSearch.js

const normalizeQuery = (query) =>
  query.toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ").trim();

const filterValidResults = (results) =>
  results
    .filter(
      (r) =>
        r.lat &&
        r.lon &&
        !Number.isNaN(Number(r.lat)) &&
        !Number.isNaN(Number(r.lon))
    )
    .sort((a, b) => {
      const score = (r) =>
        r.type === "city" || r.type === "administrative" || r.class === "place"
          ? 1
          : 0;
      return score(b) - score(a);
    });

const runNominatim = async (q, retry = 1) => {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q
    )}&format=json&addressdetails=1&limit=6`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "IGP-App",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) throw new Error("Nominatim error");

    return await res.json();
  } catch {
    if (retry > 0) {
      return runNominatim(q, retry - 1);
    }
    return [];
  }
};

export const searchLocation = async (query) => {
  if (!query || query.length < 2) return [];

  const normalized = normalizeQuery(query);

  // Progressive fallback strategies
  const cityFallback = normalized.split(" ").slice(-2).join(" ");

  const attempts = [
    normalized,
    normalized.replace(/\d+/g, "").trim(), // remove house numbers
    cityFallback,
  ].filter(Boolean);

  for (const attempt of attempts) {
    const results = await runNominatim(attempt);
    if (results.length) {
      return filterValidResults(results);
    }
  }

  return [];
};
