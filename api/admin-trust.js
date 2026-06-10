// Street Connect — Admin Trust API (v2 — verbose errors)
// Returns the actual Supabase error if the PATCH fails, instead of swallowing it.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const TABLE = process.env.USERS_TABLE || 'users';

  // Surface env-var problems clearly instead of silently failing.
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase env vars', supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  }
  if (!adminPassword) {
    return res.status(500).json({ error: 'Missing ADMIN_PASSWORD env var' });
  }

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'   // ← Supabase returns the changed rows so we can SEE if any matched
  };

  try {
    const { action, password, phone, value, voucher_phone } = req.body || {};

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    if (!phone) return res.status(400).json({ error: 'Missing phone (target user)' });

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

    const url = `${supabaseUrl}/rest/v1/${TABLE}?phone=eq.${encodeURIComponent(phone)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(patch)
    });

    const responseText = await response.text();
    let responseData = null;
    try { responseData = JSON.parse(responseText); } catch (e) { responseData = responseText; }

    // CRITICAL: check if Supabase actually changed any rows. With return=representation, success means an array of changed rows.
    if (!response.ok) {
      return res.status(500).json({ error: 'Supabase rejected the write', supabaseStatus: response.status, supabaseBody: responseData, table: TABLE });
    }

    // If we got an array back, count rows actually changed
    const rowsChanged = Array.isArray(responseData) ? responseData.length : 0;
    if (rowsChanged === 0) {
      return res.status(404).json({ error: 'No rows matched — phone not found in this table', table: TABLE, phone: phone });
    }

    return res.status(200).json({ success: true, action, applied: patch, rowsChanged, table: TABLE });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
