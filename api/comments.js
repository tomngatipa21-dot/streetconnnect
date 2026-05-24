// Street Connect — Comments API
// Comments are discussion replies attached to an incident (incident_id).
// Uses COMMENTS_TABLE env var: 'comments' on production, 'comments_dev' on preview/dev.
// Falls back to 'comments' if the var is missing.

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const TABLE = process.env.COMMENTS_TABLE || 'comments';
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // ── READ (all comments for one incident, oldest first) ──
    if (req.method === 'GET') {
      const incidentId = req.query.incident_id;
      if (!incidentId) return res.status(400).json({ error: 'Missing incident_id' });
      const url = `${supabaseUrl}/rest/v1/${TABLE}?select=*&incident_id=eq.${encodeURIComponent(incidentId)}&order=created_at.asc`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      return res.status(200).json({ comments: Array.isArray(data) ? data : [] });
    }

    // ── CREATE ──
    if (req.method === 'POST') {
      const { incident_id, phone, display_name, content } = req.body;
      if (!incident_id || !content) return res.status(400).json({ error: 'Missing incident_id or content' });
      const row = { incident_id, phone, display_name, content };
      const response = await fetch(`${supabaseUrl}/rest/v1/${TABLE}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(row)
      });
      if (response.ok) return res.status(200).json({ success: true });
      const errText = await response.text();
      return res.status(500).json({ error: 'Failed to save comment', detail: errText });
    }

    // ── DELETE (own comment only) ──
    if (req.method === 'DELETE') {
      const { id, phone } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      // Verify ownership by reading the row first (digits-only phone compare, like incidents).
      const checkUrl = `${supabaseUrl}/rest/v1/${TABLE}?select=phone&id=eq.${encodeURIComponent(id)}`;
      const checkRes = await fetch(checkUrl, { headers });
      const checkRows = await checkRes.json();
      if (!checkRows || !checkRows.length) return res.status(404).json({ error: 'Comment not found' });
      const stored = (checkRows[0].phone || '').replace(/\D/g, '');
      const asked = (phone || '').replace(/\D/g, '');
      if (stored && asked && stored !== asked) {
        return res.status(403).json({ error: 'Not your comment' });
      }
      const url = `${supabaseUrl}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(url, { method: 'DELETE', headers: { ...headers, 'Prefer': 'return=minimal' } });
      if (response.ok) return res.status(200).json({ success: true });
      const errText = await response.text();
      return res.status(500).json({ error: 'Failed to delete', detail: errText });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
