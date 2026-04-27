const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const codes = {};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { phone, code } = req.body;

    if (code) {
      // Verify code
      if (codes[phone] && codes[phone] === code) {
        delete codes[phone];
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ error: 'Invalid code' });
      }
    } else {
      // Send code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      codes[phone] = generatedCode;

      await client.messages.create({
        body: `Your Street Connect verification code is: ${generatedCode}`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });

      return res.status(200).json({ success: true });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
