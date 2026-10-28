/** Same-origin, uncached access to four read-only pricing endpoints.
 * Forward only the customer's bearer token, never browser cookies or proxy host
 * headers. Django continues to authenticate and calculate all prices itself.
 */
type RequestLike = { url?: string; method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> };
type ResponseLike = { setHeader(name: string, value: string): void; status(code: number): ResponseLike; send(body: string): void };
const routes = {
  config: { method: 'GET', path: 'config/' },
  active: { method: 'GET', path: 'active-coupons/' },
  quote: { method: 'POST', path: 'promotion-quote/' },
  validate: { method: 'POST', path: 'validate-coupon/' },
} as const;

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'private, no-store');
  const send = (status: number, error: string) => response.status(status).send(JSON.stringify({ error }));
  const action = new URL(request.url || '/', 'https://www.rastlina.com').searchParams.get('action') || '';
  if (!Object.prototype.hasOwnProperty.call(routes, action)) { send(400, 'Unknown pricing request.'); return; }
  const route = routes[action as keyof typeof routes];
  if (request.method !== route.method) { send(405, 'Method not allowed.'); return; }
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const authorization = Object.entries(request.headers || {}).find(([key]) => key.toLowerCase() === 'authorization')?.[1];
  if (authorization !== undefined) {
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') || authorization.length > 8192 || /[\r\n]/.test(authorization)) {
      send(401, 'Please sign in again.'); return;
    }
    headers.Authorization = authorization;
  }
  let body: string | undefined;
  if (route.method === 'POST') {
    try {
      const value = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid body');
      const fields = value as Record<string, unknown>;
      body = JSON.stringify(action === 'quote'
        ? { order_total: fields.order_total, coupon_code: fields.coupon_code }
        : { order_total: fields.order_total, code: fields.code });
      if (body.length > 2048) { send(413, 'Promo code request is too large.'); return; }
    } catch { send(400, 'Enter a valid promo code and cart value.'); return; }
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const upstream = await fetch(`https://admin.rastlina.com/api/store/${route.path}`, {
      method: route.method, headers, body, redirect: 'error', signal: controller.signal,
    });
    if (!upstream.headers.get('content-type')?.includes('application/json')) throw new Error('Invalid pricing response');
    const data = await upstream.json();
    response.status(upstream.status).send(JSON.stringify(data));
  } catch { send(503, 'Unable to check delivery and offers. Please retry.'); }
  finally { clearTimeout(timeout); }
}
