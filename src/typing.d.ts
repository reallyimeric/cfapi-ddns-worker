declare function addEventListener(
  type: 'fetch',
  listener: (evt: FetchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void;

declare const ENV_DEBUG_MODE: string;
declare const ENV_USE_KV: string;
declare const ENV_CLOUDFLARE_API_TOKEN: string;
declare namespace CFAPI_DDNS_WORKER_STORE {
  async function get(s: string): string;
}
