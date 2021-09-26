import { CFError } from './error';
import { DeletedDNSRecord, DNSRecord, Zone } from './flareResponse';
import { getParsedError, simplifyDomain } from './uitls';

export default class Flare {
  constructor(
    private apiToken: string,
  ) { }

  private async request(method: string, path: string, data?: any): Promise<unknown> {
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
      return (await response.json()).result;
    } catch {
      throw new CFError(await getParsedError(clone), `Upstream invalid response (status code: ${response.status})`);
    }
  }

  public async listZones(name: string): Promise<Zone[]> {
    return this.request('GET', `/zones?name=${encodeURIComponent(name)}`) as Promise<Zone[]>;
  }

  public async listRecords(zoneId: string, domain: string, rType: string): Promise<DNSRecord[]> {
    return this.request(
      'GET',
      `/zones/${encodeURIComponent(zoneId)}/dns_records?name=${encodeURIComponent(simplifyDomain(domain))}&type=${encodeURIComponent(rType)}`,
    ) as Promise<DNSRecord[]>;
  }

  public async createRecord(
    zoneId: string, rType: string, domain: string, content: string,
  ): Promise<DNSRecord> {
    return this.request(
      'POST',
      `/zones/${encodeURIComponent(zoneId)}/dns_records`,
      { type: rType, name: simplifyDomain(domain), content },
    ) as Promise<DNSRecord>;
  }

  public async updateRecord(
    zoneId: string, recordId: string, rType: string, domain: string, content: string,
  ): Promise<DNSRecord> {
    return this.request(
      'PUT',
      `/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(recordId)}`,
      { type: rType, name: simplifyDomain(domain), content },
    ) as Promise<DNSRecord>;
  }

  public async deleteRecord(zoneId: string, recordId: string): Promise<DeletedDNSRecord> {
    return this.request('DELETE', `/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(recordId)}`) as Promise<DeletedDNSRecord>;
  }
}
