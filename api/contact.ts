const EMAIL = 'info@holf.services';

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed.slice(0, maxLength);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const subject = clean(body.subject, 180);
  const message = clean(body.message, 4000);

  if (!name || !email || !message) {
    res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'email', 'message']
    });
    return;
  }

  const safeSubject = subject || 'Beredskap101 contact request';
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(safeSubject)}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  )}`;

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    mailto
  });
}
