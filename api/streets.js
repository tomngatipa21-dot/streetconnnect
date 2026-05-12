export default async function handler(req, res) {
  const { lat, lng } = req.query;
  const query = `[out:json][timeout:10];way["highway"]["name"](around:2000,${lat},${lng});out geom;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch(e) {
    res.status(500).json({elements:[]});
  }
}
