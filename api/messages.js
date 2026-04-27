export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing env vars', hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });
  }

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
    const text = await response.text();
    if (response.ok) return res.status(200).json({ success: true });
    return res.status(500).json({ error: 'Supabase error', details: text, status: response.status });
  }

  if (req.method === 'GET') {
    const { suburb } = req.query;
    let url = `${supabaseUrl}/rest/v1/messages?select=*&order=created_at.asc&limit=50`;
    if (suburb) url += `&suburb=eq.${encodeURIComponent(suburb)}`;
    const response = await fetch(url, { headers });
    const text = await response.text();
    if (!response.ok) return res.status(500).json({ error: 'Supabase error', details: text });
    return res.status(200).json({ messages: JSON.parse(text) });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
