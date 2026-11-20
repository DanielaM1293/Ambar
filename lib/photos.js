// Solo servidor. La llave nunca llega al navegador.
const UTM = "?utm_source=ambar&utm_medium=referral";
const TTL = 24 * 3600e3, FAIL_TTL = 5 * 60e3;
const memo = globalThis.__photos || (globalThis.__photos = new Map());
const shownIds = globalThis.__photoIds || (globalThis.__photoIds = new Set());

async function fetchPhotos(query, orientation, key) {
  const headers = { Authorization: `Client-ID ${key}` };
  const url = `https://api.unsplash.com/search/photos?per_page=8&orientation=${orientation}&query=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers, cache: "no-store" });
  if (!r.ok) {
    console.warn(`[unsplash] HTTP ${r.status} para "${query}"`);
    return [];
  }
  const data = await r.json();
  return (data.results || []).map(p => ({
    id: p.id,
    url: p.urls.regular,
    alt: p.alt_description || query,
    author: p.user?.name || "Unsplash",
    link: (p.user?.links?.html || "https://unsplash.com") + UTM,
    dl: p.links?.download_location
  }));
}

async function getList(query, orientation, key) {
  const cacheKey = `${orientation}:${query}`;
  const hit = memo.get(cacheKey);
  if (hit && hit.exp > Date.now() && hit.v.length > 0) {
    return hit.v;
  }
  let list = [];
  try {
    list = await fetchPhotos(query, orientation, key);
  } catch (e) {
    console.warn("[unsplash] error de red:", e.message);
  }
  memo.set(cacheKey, { v: list, exp: Date.now() + (list.length ? TTL : FAIL_TTL) });
  return list;
}

export async function getPhoto(query, orientation = "squarish", fallbackQuery = "gourmet food plating") {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) {
    console.warn("[unsplash] falta UNSPLASH_ACCESS_KEY");
    return null;
  }

  let list = await getList(query, orientation, key);
  let pick = list.find(item => !shownIds.has(item.id));

  if (!pick && fallbackQuery) {
    const fallbackList = await getList(fallbackQuery, orientation, key);
    pick = fallbackList.find(item => !shownIds.has(item.id)) || fallbackList[0];
  }

  if (!pick) {
    pick = list[0] || null;
  }
  if (!pick) return null;

  shownIds.add(pick.id);
  if (pick.dl) {
    fetch(pick.dl, { headers: { Authorization: `Client-ID ${key}` }, cache: "no-store" }).catch(() => {});
  }

  return {
    url: pick.url,
    alt: pick.alt,
    author: pick.author,
    link: pick.link
  };
}

export const QUERIES = {
  dishes: [
    "roasted onion gourmet dish",
    "grilled fish fillet herbs",
    "pork belly glaze restaurant",
    "grilled corn starter dish",
    "dark chocolate mousse dessert"
  ],
  hero: "open fire kitchen chef restaurant"
};
