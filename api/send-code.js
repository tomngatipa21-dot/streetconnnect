export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, code } = req.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE;

  if (code) {
    // Verify code
    const stored = global.codes && global.codes[phone];
    if (stored && stored === code) {
      delete global.codes[phone];
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid code' });
  }

  // Generate and send code
  const generated = Math.floor(100000 + Math.random() * 900000).toString();
  if (!global.codes) global.codes = {};
  global.codes[phone] = generated;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: phone,
        Body: `Your Street Connect code is: ${generated}`,
      }),
    }
  );

  if (response.ok) {
    return res.status(200).json({ success: true });
  }

  return res.status(500).json({ error: 'Failed to send SMS' });
}
