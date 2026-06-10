// Street Connect — Admin Trust API
// Handles admin-only writes for the trust system:
//   POST { action, password, phone, ... }
// Actions:
//   set-trust     → update trust_tier (0/1/2)
//   set-identity  → update identity_type (resident/business/council/police/ses/fire)
//   set-banned    → toggle is_banned (true/false)
//   vouch         → record vouched_by (voucher's phone) and bump tier to >= 1
//
// All actions require the admin password (same one used by get-users).
// Uses USERS_TABLE env var: 'users' on production, 'users_dev' on preview.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const TABLE = process.env.USERS_TABLE || 'users';
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const { action, password, phone, value, voucher_phone } = req.body || {};

    // ── Admin gate ──
    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    if (!phone) return res.status(400).json({ error: 'Missing phone (target user)' });

    // Allowed actions and the patch shape they produce.
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
      // Vouching also lifts trust to at least 1 (verified) — the whole point of vouching.
      patch = { vouched_by: voucher_phone, trust_tier: 1 };
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    // Apply the patch via Supabase REST. Targets by phone.
    const url = `${supabaseUrl}/rest/v1/${TABLE}?phone=eq.${encodeURIComponent(phone)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(patch)
    });

    if (response.ok) return res.status(200).json({ success: true, action, applied: patch });
    const errText = await response.text();
    return res.status(500).json({ error: 'Failed to update', detail: errText });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
