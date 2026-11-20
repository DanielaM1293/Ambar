// Solo servidor. La llave nunca llega al navegador.
const UTM = "?utm_source=ambar&utm_medium=referral";
const TTL = 24 * 3600e3;
const memo = new Map();
const usedIds = new Set();

// Respaldos temáticos por plato / sección
const CURATED_BY_QUERY = {
  "smoked onion fine dining plate": {
    url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    alt: "Cebolla y vegetales asados en plato gourmet",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  "grilled trout plated restaurant": {
    url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80",
    alt: "Pescado a la plancha con hierbas en plato de restaurante",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  "iberico pork grilled dish": {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    alt: "Corte de cerdo asado al fuego",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  "corn ash fine dining dish": {
    url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80",
    alt: "Preparación con maíz tostado",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  "chocolate cacao dessert plated": {
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    alt: "Postre de chocolate oscuro",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  },
  "open fire kitchen chef restaurant": {
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
    alt: "Cocina de restaurante y fuego",
    author: "Unsplash",
    link: "https://unsplash.com" + UTM
  }
};

const FALLBACK_LIST = Object.values(CURATED_BY_QUERY);
let fallbackIdx = 0;

function getCuratedFor(query) {
  if (CURATED_BY_QUERY[query]) return CURATED_BY_QUERY[query];
  const item = FALLBACK_LIST[fallbackIdx % FALLBACK_LIST.length];
  fallbackIdx += 1;
  return item;
}

async function fetchFromUnsplash(query, orientation, key) {
  const headers = { Authorization: `Client-ID ${key}` };
  const url = `https://api.unsplash.com/search/photos?per_page=10&orientation=${orientation}&query=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers, cache: "no-store" });
  if (!r.ok) {
    console.warn(`[unsplash] HTTP ${r.status} para "${query}"`);
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

  const curated = getCuratedFor(query);
  memo.set(cacheKey, { v: curated, exp: Date.now() + TTL });
  return curated;
}

export const QUERIES = {
  dishes: [
    "smoked onion fine dining plate",
    "grilled trout plated restaurant",
    "iberico pork grilled dish",
    "corn ash fine dining dish",
    "chocolate cacao dessert plated"
  ],
  hero: "open fire kitchen chef restaurant"
};
