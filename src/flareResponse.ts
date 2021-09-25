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
