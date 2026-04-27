export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, address, street, suburb, language } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase config' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
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
        language: language || 'en'
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    const error = await response.json();
    return res.status(500).json({ error: 'Database error', details: error });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
