// Generator function yielding a canonicalized domain and all of its parent-domains.

import { TOKENS, ZONES } from './env';

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

// Search predefined ZONES for matching domain, returning the matched zone.
export function getZoneByDomain(domain: string): Record<'id', string> | undefined {
  for (const parentDomain of parentDomains(domain)) {
    if (ZONES[parentDomain] !== undefined) {
      return ZONES[parentDomain];
    }
  }
  return undefined;
}

// Search TOKENS for matching token, serving as authentication process.
export function getEffectiveDomain(token: string, domain: string): string | undefined {
  for (const parentDomain of parentDomains(domain)) {
    if (TOKENS[parentDomain] && TOKENS[parentDomain] === token) {
      return parentDomain;
    }
  }
  return undefined;
}
