// Generator function yielding a canonicalized domain and all of its parent-domains.

import { TOKENS, USE_KV, ZONES } from './env';

// e.g. parentDomains("www.example.org.") -> ["www.example.org.", "example.org"., "org.", "."]*
export function* parentDomains(domain: string) {
  if (!domain.endsWith('.')) return;
  let currentSegment = domain;
  let nextStart = 0;

  while (nextStart !== currentSegment.length) {
    currentSegment = currentSegment.substring(nextStart);
    yield currentSegment;
    nextStart = currentSegment.indexOf('.') + 1;
  }
  yield '.';
}

// Strip the trailing dot indicating root domain, if it is present.
// Necessary because the poor CloudFlare cannot understand canonicalized domains.
export function simplifyDomain(domain: string) {
  if (domain.endsWith('.')) {
    return domain.substring(0, domain.length - 1);
  }
  return domain;
}

// Canonicalize the domain by add trailing dot indicating root domain, if it is not present.
export function canonicalizeDomain(domain: string) {
  if (!domain.endsWith('.')) {
    return `${domain}.`;
  }
  return domain;
}

/**
 * Search predefined ZONES for matching domain, returning the matched zone.
 * @deprecated we can get zoneId from api now
 * @param domain domain
 * @returns matched zone
 */
export function getZoneByDomain(domain: string): Record<'id', string> | undefined {
  for (const parentDomain of parentDomains(domain)) {
    if (ZONES[parentDomain] !== undefined) {
      return ZONES[parentDomain];
    }
  }
  return undefined;
}

// Search TOKENS for matching token, serving as authentication process.
// Key: example.com, value: RANDOM_TOKEN
async function getEffectiveDomainFromCode(
  token: string, domain: string,
): Promise<string | undefined> {
  if (!token) return undefined;
  for (const parentDomain of parentDomains(domain)) {
    if (TOKENS[parentDomain] && TOKENS[parentDomain] === token) {
      return parentDomain;
    }
  }
  return undefined;
}

// Key: RANDOM_TOKEN, value: example.com
async function getEffectiveDomainFromKV(
  token: string, domain: string,
): Promise<string | undefined> {
  if (!token) return undefined;
  const tokenDomain = canonicalizeDomain(await CFAPI_DDNS_WORKER_STORE.get(token));
  for (const parentDomain of parentDomains(domain)) {
    if (parentDomain === tokenDomain) return tokenDomain;
  }
  return undefined;
}

export const getEffectiveDomain = USE_KV ? getEffectiveDomainFromKV : getEffectiveDomainFromCode;

export async function getParsedError(failedResponse: Response): Promise<string> {
  const clone = failedResponse.clone();
  const clone2 = failedResponse.clone();
  try {
    const json = await clone.json();
    return JSON.stringify(json, null, 2);
  } catch {
    return clone2.text();
  }
}
