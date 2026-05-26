// Street Connect — Photo Upload API
// Receives a base64 image, uploads it to the Supabase Storage bucket 'incident-photos',
// and returns the public URL. Keeps the Supabase key server-side.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const BUCKET = 'incident-photos';

  try {
    const { image, ext } = req.body; // image = base64 string (no data: prefix), ext = 'jpg'
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Decode base64 to binary.
    const buffer = Buffer.from(image, 'base64');
    // Guard: cap server-side at ~3MB to avoid abuse (front-end compresses first).
    if (buffer.length > 3 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image too large' });
    }

    // Unique filename.
    const safeExt = (ext || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
    const filename = 'inc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + safeExt;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${filename}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': safeExt === 'png' ? 'image/png' : 'image/jpeg'
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return res.status(500).json({ error: 'Upload failed', detail: errText });
    }

    // Public URL for a public bucket.
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filename}`;
    return res.status(200).json({ success: true, url: publicUrl });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
