// Solo servidor. La llave nunca llega al navegador.
const UTM="?utm_source=ambar&utm_medium=referral";
const TTL=24*3600e3, FAIL_TTL=5*60e3;
const memo=globalThis.__photos||(globalThis.__photos=new Map());

async function fetchPhotos(query,orientation,key){
  const headers={Authorization:`Client-ID ${key}`};
  const r=await fetch(`https://api.unsplash.com/search/photos?per_page=8&orientation=${orientation}&query=${encodeURIComponent(query)}`,{headers,cache:"no-store"});
  if(!r.ok){console.warn(`[unsplash] HTTP ${r.status} para "${query}"`);return []}
  const results=(await r.json()).results||[];
  return results.map(p=>({
    id:p.id,
    url:p.urls.regular,
    alt:p.alt_description||query,
    author:p.user.name,
    link:p.user.links.html+UTM,
    dl:p.links.download_location
  }));
}

export async function getPhoto(query,orientation="squarish",excludeIds=null){
  const key=process.env.UNSPLASH_ACCESS_KEY?.trim();
  if(!key){console.warn("[unsplash] falta UNSPLASH_ACCESS_KEY");return null}
  const cacheKey=`${orientation}:${query}`;
  const hit=memo.get(cacheKey);
  let list=hit&&hit.exp>Date.now()?hit.v:null;
  if(!list){
    try{list=await fetchPhotos(query,orientation,key)}catch(e){list=[];console.warn("[unsplash] error de red:",e.message)}
    memo.set(cacheKey,{v:list,exp:Date.now()+(list.length?TTL:FAIL_TTL)});
  }
  const p=(excludeIds?list.find(item=>!excludeIds.has(item.id)):list[0])||list[0];
  if(!p)return null;
  if(excludeIds)excludeIds.add(p.id);
  fetch(p.dl,{headers:{Authorization:`Client-ID ${key}`},cache:"no-store"}).catch(()=>{});
  return {url:p.url,alt:p.alt,author:p.author,link:p.link};
}

export const QUERIES={
  dishes:[
    "roasted onion gourmet dish",
    "grilled fish fillet herbs",
    "pork belly glaze restaurant",
    "grilled corn starter dish",
    "dark chocolate mousse dessert"
  ],
  hero:"open fire kitchen chef restaurant"
};
