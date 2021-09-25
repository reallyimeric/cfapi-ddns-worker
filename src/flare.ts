export default class Flare {
  constructor(
    private apiToken: string,
  ) { }

  public async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data: any) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Upstream response error (status code: ${response.status})`);
    }
    try {
      return await response.json();
    } catch (e) {
      throw new Error('Upstream invalid response');
    }
  }

  public get(path: string, data: any) {
    return this.request('GET', path, data);
  }

  public post(path: string, data: any) {
    return this.request('POST', path, data);
  }

  public put(path: string, data: any) {
    return this.request('PUT', path, data);
  }

  public delete(path: string, data: any) {
    return this.request('DELETE', path, data);
  }
}
