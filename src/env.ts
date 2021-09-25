export const CLOUDFLARE_API_TOKEN = ENV_CLOUDFLARE_API_TOKEN;

export const DEBUG_MODE = ENV_DEBUG_MODE === 'false' || !!ENV_DEBUG_MODE;

// Currently, there seems not to be a way to get zone ids with tokens. So hardcode it here.
// https://community.cloudflare.com/t/bug-in-list-zones-endpoint-when-using-api-token/115048
// Trailing dots CANNOT BE OMITTED.
// UPDATE: seems api works
export const ZONES: Record<string, { id: string }> = {
  'example.org.': {
    id: 'TO_BE_FILLED',
  },
};
// Arbitrary API tokens, mapping domains to customizable tokens, which can be any text.
// Tokens for a domain can always be used to access its direct or indirect subdomains.
// Trailing dots CANNOT BE OMITTED.
export const TOKENS: Record<string, string> = /* TOKENS: */ {
  'example.org.': 'b69541a8-0acd-4e14-aecf-053d5e1b923d',
  'foo.example.org.': '144e7c59-7c2b-4360-9d16-00bbad549fb9',
  'foo.bar.example.org.': '218fa52e-d3c9-419d-a800-d8510e899a30',
};
// Time To Live in DNS record. 1 indictes automatic.
export const TTL = 1;
