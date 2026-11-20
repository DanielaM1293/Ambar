// Solo servidor. La llave nunca llega al navegador.
const UTM="?utm_source=ambar&utm_medium=referral";
const TTL=24*3600e3, FAIL_TTL=5*60e3;
// Caché en memoria: 1 sola llamada por foto cada 24 h (el plan demo permite 50 peticiones/hora)
const memo=globalThis.__photos||(globalThis.__photos=new Map());

async function fetchPhoto(query,orientation,key){
  const headers={Authorization:`Client-ID ${key}`};
  const r=await fetch(`https://api.unsplash.com/search/photos?per_page=1&orientation=${orientation}&query=${encodeURIComponent(query)}`,{headers,cache:"no-store"});
  if(!r.ok){console.warn(`[unsplash] HTTP ${r.status} para "${query}" · peticiones restantes: ${r.headers.get("x-ratelimit-remaining")}`);return null}
  const p=(await r.json()).results?.[0];
  if(!p){console.warn(`[unsplash] sin resultados para "${query}"`);return null}
  fetch(p.links.download_location,{headers,cache:"no-store"}).catch(()=>{}); // requisito de Unsplash
  return {url:p.urls.regular,alt:p.alt_description||query,author:p.user.name,link:p.user.links.html+UTM};
}
export async function getPhoto(query,orientation="squarish"){
  const key=process.env.UNSPLASH_ACCESS_KEY?.trim();
  if(!key){console.warn("[unsplash] falta UNSPLASH_ACCESS_KEY");return null}
  const hit=memo.get(query);
  if(hit&&hit.exp>Date.now()) return hit.v;
  let v=null;
  try{v=await fetchPhoto(query,orientation,key)}catch(e){console.warn("[unsplash] error de red:",e.message)}
  memo.set(query,{v,exp:Date.now()+(v?TTL:FAIL_TTL)});
  return v;
}
export const QUERIES={
  dishes:["roasted onion fine dining dish","grilled trout plated restaurant","grilled pork belly fine dining","corn ash fine dining dish","chocolate cacao dessert plated"],
  hero:"open fire kitchen chef restaurant"};
