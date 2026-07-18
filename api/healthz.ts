// Single healthz implementation (module 5.3): used directly as the Vercel
// serverless function AND delegated to by the local Express server
// (server.js → /api/healthz). Keep the ISO timestamp + no-store contract.
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
