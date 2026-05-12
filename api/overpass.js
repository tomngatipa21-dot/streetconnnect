export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const data = url.searchParams.get('data');
  if (!data) return new Response(JSON.stringify({elements:[]}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  try {
    const response = await fetch('https://overpass.kumi.systems/api/interpreter?data='+encodeURIComponent(data));
    const text = await response.text();
    return new Response(text, {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  } catch(e) {
    return new Response(JSON.stringify({elements:[]}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
}
