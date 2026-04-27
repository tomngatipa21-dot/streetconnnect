export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  if (req.method === 'POST') {
    const { phone, address, type, description } = req.body;
    const response = await fetch(`${supabaseUrl}/rest/v1/incidents`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ phone, address, type, description })
    });
    if (response.ok) return res.status(200).json({ success: true });
    return res.status(500).json({ error: 'Failed to save incident' });
  }

  if (req.method === 'GET') {
    const url = `${supabaseUrl}/rest/v1/incidents?select=*&order=created_at.desc&limit=20`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    return res.status(200).json({ incidents: data });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
