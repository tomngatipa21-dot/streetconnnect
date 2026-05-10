export default async function handler(req, res) {
  const query = req.query.data;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    const json = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
