/* Serves heavy course files (videos, PDFs) from the R2 bucket bound as MEDIA.
   The site keeps the same paths it always used (courses/<id>/media/..., courses/<id>/docs/...),
   so no lesson links or saved progress change. Supports Range requests so videos can seek. */
export async function serveFromR2({ request, env, params }) {
  const key = new URL(request.url).pathname.replace(/^\/+/, '');
  if (!env.MEDIA) return new Response('Media storage is not connected', { status: 503 });
  const headers = new Headers();
  let obj;
  if (request.method === 'HEAD') {
    obj = await env.MEDIA.head(key);
  } else {
    obj = await env.MEDIA.get(key, { range: request.headers, onlyIf: request.headers });
  }
  if (!obj) return new Response('Not found', { status: 404 });
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=604800');
  if (request.method === 'HEAD') { headers.set('content-length', obj.size); return new Response(null, { status: 200, headers }); }
  if (!('body' in obj)) return new Response(null, { status: 304, headers });   /* browser copy is still current */
  if (obj.range && (obj.range.offset !== undefined || obj.range.suffix !== undefined)) {
    const off = obj.range.suffix !== undefined ? obj.size - obj.range.suffix : obj.range.offset;
    const len = obj.range.length ?? (obj.size - off);
    headers.set('content-range', `bytes ${off}-${off + len - 1}/${obj.size}`);
    headers.set('content-length', len);
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('content-length', obj.size);
  return new Response(obj.body, { status: 200, headers });
}
