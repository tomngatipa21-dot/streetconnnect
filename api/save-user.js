export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, address, street, suburb, language, display_name } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase config' });
  }

  const base = supabaseUrl.replace(/\/$/, '');

  try {
    const response = await fetch(`${base}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        phone,
        address,
        street,
        suburb,
        language: language || 'en',
        display_name
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    const error = await response.text();
    return res.status(500).json({ error: 'Database error', details: error });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
