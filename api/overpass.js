export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const data = url.searchParams.get('data');
  if (!data) return new Response(JSON.stringify({elements:[]}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint + '?data=' + encodeURIComponent(data));
      const text = await res.text();
      if (text.trim().startsWith('{')) {
        return new Response(text, {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
      }
    } catch(e) { continue; }
  }
  
  return new Response(JSON.stringify({elements:[]}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
}
