export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const data = url.searchParams.get('data');
  if (!data) return new Response(JSON.stringify({elements:[],debug:'no data'}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(data));
    const text = await res.text();
    return new Response(text, {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  } catch(e) {
    return new Response(JSON.stringify({elements:[],debug:e.message}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
}
