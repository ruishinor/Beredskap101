/** Serve a cached full archive to PMTiles GET/HEAD and single-range requests. */
export async function archiveResponse(request: Request, cached: Response): Promise<Response> {
  const bytes = await cached.arrayBuffer();
  const size = bytes.byteLength;
  const headers = new Headers({
    'Content-Type': 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Content-Length': String(size),
  });
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
  const range = request.headers.get('range');
  if (!range) return new Response(bytes, { status: 200, headers });

  const unsatisfiable = () => new Response(null, {
    status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' },
  });
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!match || (!match[1] && !match[2])) return unsatisfiable();
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if ((first !== null && !Number.isSafeInteger(first)) ||
      (last !== null && !Number.isSafeInteger(last))) return unsatisfiable();

  const start = first === null ? Math.max(0, size - last!) : first;
  const end = first === null || last === null ? size - 1 : Math.min(last, size - 1);
  if (size === 0 || start > end || start >= size || (first === null && last === 0)) return unsatisfiable();
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(bytes.slice(start, end + 1), { status: 206, headers });
}
