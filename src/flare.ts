import { CFError } from './error';
import {
  CloudFlareResponse, DeletedDNSRecord, DNSRecord, Zone,
} from './flareResponse';
import { getParsedError, simplifyDomain } from './uitls';

export default class Flare {
  constructor(
    private apiToken: string,
  ) { }

  private async request<T>(
    method: string, path: string, data?: any, raw?: false
  ): Promise<T>

  private async request<T>(
    method: string, path: string, data?: any, raw?: true
  ): Promise<CloudFlareResponse<T>>

  private async request<T>(method: string, path: string, data?: any, raw = false) {
    const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: data,
    });
    const clone = response.clone();
    try {
      if (!response.ok) throw new Error('not ok');
      const parsedResponse = await response.json() as CloudFlareResponse<T>;
      return raw ? parsedResponse : parsedResponse.result;
    } catch {
      throw new CFError(await getParsedError(clone), `Upstream invalid response (status code: ${response.status})`);
    }
  }

  public async listZones(): Promise<CloudFlareResponse<Zone[]>>

  public async listZones(name: ''): Promise<CloudFlareResponse<Zone[]>>

  public async listZones(name: string): Promise<Zone[]>

  public async listZones(name?: string) {
    if (!name) return this.request<Zone[]>('GET', '/zones', undefined, true);
    return this.request<Zone[]>('GET', `/zones?name=${encodeURIComponent(name)}`);
  }

  /**
   * List the first page of dns records in specified zone
   * @param zoneId zone id
   * @param domain name to search
   * @param rType record type
   * @returns the first page of list of matching DNS record
   */
  public async listRecords(zoneId: string, domain: string, rType: string) {
    return this.request<DNSRecord[]>(
      'GET',
      `/zones/${encodeURIComponent(zoneId)}/dns_records?name=${encodeURIComponent(simplifyDomain(domain))}&type=${encodeURIComponent(rType)}`,
    );
  }

  public async createRecord(
    zoneId: string, rType: string, domain: string, content: string,
  ) {
    return this.request<DNSRecord>(
      'POST',
      `/zones/${encodeURIComponent(zoneId)}/dns_records`,
      { type: rType, name: simplifyDomain(domain), content },
    );
  }

  public async updateRecord(
    zoneId: string, recordId: string, rType: string, domain: string, content: string,
  ) {
    return this.request<DNSRecord>(
      'PUT',
      `/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(recordId)}`,
      { type: rType, name: simplifyDomain(domain), content },
    );
  }

  public async deleteRecord(zoneId: string, recordId: string) {
    return this.request<DeletedDNSRecord>('DELETE', `/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(recordId)}`);
  }
}
