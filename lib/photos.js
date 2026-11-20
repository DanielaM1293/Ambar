// Solo servidor. La llave nunca llega al navegador.
const UTM = "?utm_source=ambar&utm_medium=referral";
const TTL = 24 * 3600e3;
const memo = new Map();
const usedIds = new Set();

const FALLBACK_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    alt: "Plato de cocina a las brasas",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    alt: "Plato servido en restaurante",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
    alt: "Corte a la parrilla",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  {
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
    alt: "Entrada gourmet",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  {
    url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
    alt: "Postre de chocolate",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  {
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
    alt: "Ambiente de cocina y restaurante",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  }
];

let fallbackIdx = 0;
function nextFallback() {
  const item = FALLBACK_PHOTOS[fallbackIdx % FALLBACK_PHOTOS.length];
  fallbackIdx += 1;
  return item;
}

async function fetchFromUnsplash(query, orientation, key) {
  const headers = { Authorization: `Client-ID ${key}` };
  const url = `https://api.unsplash.com/search/photos?per_page=10&orientation=${orientation}&query=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers, cache: "no-store" });
  if (!r.ok) {
    console.warn(`[unsplash] HTTP ${r.status} para "${query}" · restantes: ${r.headers.get("x-ratelimit-remaining")}`);
    return [];
  }
  const data = await r.json();
  return data.results || [];
}

export async function getPhoto(query, orientation = "squarish") {
  const cacheKey = `${orientation}:${query}`;
  const hit = memo.get(cacheKey);
  if (hit && hit.exp > Date.now()) return hit.v;

  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (key) {
    try {
      const results = await fetchFromUnsplash(query, orientation, key);
      const chosen = results.find(p => !usedIds.has(p.id)) || results[0];
      if (chosen && chosen.urls?.regular) {
        usedIds.add(chosen.id);
        fetch(chosen.links.download_location, { headers: { Authorization: `Client-ID ${key}` }, cache: "no-store" }).catch(() => {});
        const photo = {
          url: chosen.urls.regular,
          alt: chosen.alt_description || query,
          author: chosen.user?.name || "Unsplash",
          link: (chosen.user?.links?.html || "https://unsplash.com") + UTM
        };
        memo.set(cacheKey, { v: photo, exp: Date.now() + TTL });
        return photo;
      }
    } catch (e) {
      console.warn("[unsplash] error:", e.message);
    }
  }

  const fb = nextFallback();
  memo.set(cacheKey, { v: fb, exp: Date.now() + TTL });
  return fb;
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
