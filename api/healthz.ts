export default function handler(req: any, res: any) {
  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
