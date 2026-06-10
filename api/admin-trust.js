// Street Connect — Admin Trust API (v5 — digits-only matching, bypasses + URL encoding bug)
// We can't use phone=eq.+61... because PostgREST decodes + as space.
// Workaround: fetch all users, find by digits-only match, then PATCH by id.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const TABLE = process.env.USERS_TABLE || 'users';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase env vars (need SUPABASE_URL + SUPABASE_SECRET_KEY)' });
  }
  if (!adminPassword) {
    return res.status(500).json({ error: 'Missing ADMIN_PASSWORD env var' });
  }

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const digitsOnly = s => (s || '').replace(/\D/g, '');

  try {
    const { action, password, phone, value, voucher_phone } = req.body || {};

    if (password !== adminPassword) return res.status(401).json({ error: 'Unauthorised' });
    if (!phone) return res.status(400).json({ error: 'Missing phone' });

    let patch = null;
    if (action === 'set-trust') {
      const tier = Number(value);
      if (![0, 1, 2].includes(tier)) return res.status(400).json({ error: 'trust_tier must be 0, 1 or 2' });
      patch = { trust_tier: tier };
    } else if (action === 'set-identity') {
      const allowed = ['resident', 'business', 'council', 'police', 'ses', 'fire'];
      if (!allowed.includes(value)) return res.status(400).json({ error: 'invalid identity_type' });
      patch = { identity_type: value };
    } else if (action === 'set-banned') {
      patch = { is_banned: !!value };
    } else if (action === 'vouch') {
      if (!voucher_phone) return res.status(400).json({ error: 'Missing voucher_phone' });
      patch = { vouched_by: voucher_phone, trust_tier: 1 };
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    // STEP 1: Find the user by digits-only phone match (bypasses + URL encoding bug)
    const fetchAllRes = await fetch(`${supabaseUrl}/rest/v1/${TABLE}?select=id,phone`, { headers });
    if (!fetchAllRes.ok) {
      const errBody = await fetchAllRes.text();
      return res.status(500).json({ error: 'Failed to fetch users for matching', detail: errBody });
    }
    const users = await fetchAllRes.json();
    const targetDigits = digitsOnly(phone);
    const match = users.find(u => digitsOnly(u.phone) === targetDigits);

    if (!match) {
      return res.status(404).json({ error: 'No user matched (digits-only)', searched: targetDigits, table: TABLE, totalUsers: users.length });
    }

    // STEP 2: PATCH by id (uuid — no + character issues)
    const patchUrl = `${supabaseUrl}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(match.id)}`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(patch)
    });

    const patchText = await patchRes.text();
    let patchData = null;
    try { patchData = JSON.parse(patchText); } catch (e) { patchData = patchText; }

    if (!patchRes.ok) {
      return res.status(500).json({ error: 'Supabase rejected the PATCH', supabaseStatus: patchRes.status, supabaseBody: patchData });
    }

    const rowsChanged = Array.isArray(patchData) ? patchData.length : 0;
    return res.status(200).json({ success: true, action, applied: patch, rowsChanged, matched: { id: match.id, phone: match.phone } });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
