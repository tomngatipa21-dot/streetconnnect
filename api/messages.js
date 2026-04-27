export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing config' });
  }

  const base = supabaseUrl.replace(/\/$/, '');
  const headers = {
    'apikey': supabaseKey,
    'Authorization': 'Bearer ' + supabaseKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    if (req.method === 'DELETE') {
      const { id, phone } = req.body;
      const r = await fetch(base + '/rest/v1/messages?id=eq.' + id + '&phone=eq.' + encodeURIComponent(phone), {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(8000)
      });
      if (r.ok) return res.status(200).json({ success: true });
      return res.status(500).json({ error: 'Failed to delete' });
    }

    if (req.method === 'POST') {
      const { phone, address, suburb, content, display_name } = req.body;
      const r = await fetch(base + '/rest/v1/messages', {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ phone, address, suburb, content, display_name }),
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      if (r.ok) return res.status(200).json({ success: true });
      return res.status(500).json({ error: text });
    }

    if (req.method === 'GET') {
      const r = await fetch(base + '/rest/v1/messages?select=*&order=created_at.asc&limit=50', {
        headers,
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      if (!r.ok) return res.status(500).json({ error: text });
      return res.status(200).json({ messages: JSON.parse(text) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) {
    return res.status(500).json({ error: e.message, type: e.constructor.name });
  }
}
