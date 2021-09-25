declare function addEventListener(
  type: 'fetch',
  listener: (evt: FetchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void;

declare const ENV_DEBUG_MODE: string;

declare const ENV_CLOUDFLARE_API_TOKEN: string;
