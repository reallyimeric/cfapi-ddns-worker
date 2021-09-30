export interface Zone {
  name: string,
  id: string,
}

export interface DNSRecord {
  id: string,
  type: string,
  name: string,
  content: any,
  proxiable: boolean,
  proxied: boolean,
  ttl: number,
}

export interface DeletedDNSRecord {
  id: string,
}

export interface CloudFlareResponse<T> {
  result: T,
  /* eslint-disable-next-line camelcase */
  result_info: {
    page: number,
    /* eslint-disable-next-line camelcase */
    per_page: number,
    count: number,
    /* eslint-disable-next-line camelcase */
    total_count: number,
    /* eslint-disable-next-line camelcase */
    total_pages: number,

  }
}

interface RequestParameter {
  page?: number;
  size?: number;
}

export interface ListZonesParameter extends RequestParameter {
  name?: string;
}
