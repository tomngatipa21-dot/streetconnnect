// Street Connect — Get Users
// Two modes:
//   ?password=count_only   → returns only { total } (used by the public-facing neighbour count)
//   ?password=<admin>      → returns full user list including trust columns (admin-only)
// Uses USERS_TABLE env var: 'users' on production, 'users_dev' on preview.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.query;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const TABLE = process.env.USERS_TABLE || 'users';
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };

  try {
    // ── Public mode: count only, no row data exposed. ──
    if (password === 'count_only') {
      // 'select=id' minimises bytes; we ignore the rows and just use the count.
      const response = await fetch(`${supabaseUrl}/rest/v1/${TABLE}?select=id`, { headers });
      const data = await response.json();
      const total = Array.isArray(data) ? data.length : 0;
      return res.status(200).json({ total });
    }

    // ── Admin mode: full list including the new trust columns. ──
    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorised' });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/${TABLE}?select=*&order=joined_at.desc`, { headers });
    const data = await response.json();
    return res.status(200).json({ users: data, total: Array.isArray(data) ? data.length : 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
