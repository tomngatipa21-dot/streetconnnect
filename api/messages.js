export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  if (req.method === 'POST') {
    const { phone, address, suburb, content } = req.body;
    const response = await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ phone, address, suburb, content })
    });
    if (response.ok) return res.status(200).json({ success: true });
    return res.status(500).json({ error: 'Failed to save message' });
  }

  if (req.method === 'GET') {
    const { suburb } = req.query;
    let url = `${supabaseUrl}/rest/v1/messages?select=*&order=created_at.asc&limit=50`;
    if (suburb) url += `&suburb=eq.${encodeURIComponent(suburb)}`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    return res.status(200).json({ messages: data });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
