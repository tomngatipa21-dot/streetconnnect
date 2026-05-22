// Street Connect — Incidents API
// Uses INCIDENTS_TABLE env var: 'incidents' on production, 'incidents_dev' on preview/dev.
// Falls back to 'incidents' if the var is missing.

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const TABLE = process.env.INCIDENTS_TABLE || 'incidents';
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  // How long each incident type stays visible (in hours) before auto-expiry.
  // Matched loosely on keywords in the type string (which includes emoji + label).
  function expiryHoursFor(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('dog') || t.includes('animal') || t.includes('suspicious') || t.includes('vehicle')) return 24;
    if (t.includes('theft') || t.includes('stolen') || t.includes('scam') || t.includes('break')) return 24 * 7;
    if (t.includes('vandal') || t.includes('graffiti')) return 24 * 3;
    if (t.includes('safety')) return 24 * 3;
    return 24 * 3; // sensible default: 3 days
  }

  try {
    // ── CREATE ────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { phone, address, type, description, lat, lng } = req.body;
      const row = { phone, address, type, description };
      if (lat !== undefined && lat !== null) row.lat = lat;
      if (lng !== undefined && lng !== null) row.lng = lng;
      row.status = 'active';
      row.resolved_count = 0;
      const response = await fetch(`${supabaseUrl}/rest/v1/${TABLE}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(row)
      });
      if (response.ok) return res.status(200).json({ success: true });
      const errText = await response.text();
      return res.status(500).json({ error: 'Failed to save incident', detail: errText });
    }

    // ── READ ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      // Only pull active ones, newest first.
      const url = `${supabaseUrl}/rest/v1/${TABLE}?select=*&status=eq.active&order=created_at.desc&limit=50`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      const now = Date.now();
      // Drop anything past its time-expiry for its type.
      const live = (Array.isArray(data) ? data : []).filter(function (inc) {
        if (!inc.created_at) return true;
        const created = new Date(inc.created_at).getTime();
        const ageHours = (now - created) / (1000 * 60 * 60);
        return ageHours <= expiryHoursFor(inc.type);
      });
      return res.status(200).json({ incidents: live });
    }

    // ── DELETE (reporter or admin removes their report) ───────
    if (req.method === 'DELETE') {
      const { id, phone } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      // Scope delete to the reporter's own phone for safety.
      let url = `${supabaseUrl}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`;
      if (phone) url += `&phone=eq.${encodeURIComponent(phone)}`;
      const response = await fetch(url, { method: 'DELETE', headers: { ...headers, 'Prefer': 'return=minimal' } });
      if (response.ok) return res.status(200).json({ success: true });
      const errText = await response.text();
      return res.status(500).json({ error: 'Failed to delete', detail: errText });
    }

    // ── PATCH (verify / resolve) ──────────────────────────────
    // action: 'resolve' increments resolved_count; at 3 the incident is marked resolved.
    if (req.method === 'PATCH') {
      const { id, action } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      // Read current row to get the count.
      const getUrl = `${supabaseUrl}/rest/v1/${TABLE}?select=*&id=eq.${encodeURIComponent(id)}`;
      const getRes = await fetch(getUrl, { headers });
      const rows = await getRes.json();
      if (!rows || !rows.length) return res.status(404).json({ error: 'Incident not found' });
      const inc = rows[0];

      let patch = {};
      if (action === 'resolve' || action === 'notthere') {
        const newCount = (inc.resolved_count || 0) + 1;
        patch.resolved_count = newCount;
        if (newCount >= 3) patch.status = 'resolved'; // consensus threshold = 3
      } else if (action === 'mark_resolved') {
        patch.status = 'resolved';
      } else {
        // 'confirm' / 'still' don't change lifecycle; just acknowledge.
        return res.status(200).json({ success: true, count: inc.resolved_count || 0, status: inc.status });
      }

      const patchUrl = `${supabaseUrl}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(patch)
      });
      if (patchRes.ok) return res.status(200).json({ success: true, count: patch.resolved_count, status: patch.status || inc.status });
      const errText = await patchRes.text();
      return res.status(500).json({ error: 'Failed to update', detail: errText });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
