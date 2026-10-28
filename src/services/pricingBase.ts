/** Live shoppers use the existing backend connection; previews need same-origin forwarding. */
export function pricingBase(hostname: string, apiBase = 'https://admin.rastlina.com/api') {
  return ['rastlina.com', 'www.rastlina.com'].includes(hostname.toLowerCase())
    ? `${apiBase.replace(/\/+$/, '')}/store`
    : '/api/store';
}
