export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.query;
  
  if (password !== process.env.ADMIN_PASSWORD && password !== 'count_only') {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=*&order=joined_at.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await response.json();
    return res.status(200).json({ users: data, total: data.length });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
