// src/utils/locationSearch.js
export const searchLocation = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: { "User-Agent": "IGP-App" },
    });
    return await res.json();
  } catch (e) {
    console.log("Nominatim error:", e);
    return [];
  }
};
