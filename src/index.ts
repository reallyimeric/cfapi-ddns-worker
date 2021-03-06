import { CLOUDFLARE_API_TOKEN } from './env';
import { ClientError } from './error';
import Flare from './flare';
import registerSchedule from './schedule';
import {
  canonicalizeDomain, getEffectiveDomain, simplifyDomain,
} from './uitls';

const flare = new Flare(CLOUDFLARE_API_TOKEN);

async function handleAction(
  action: string,
  token: string,
  domain: string,
  rType: string,
  content: string,
) {
  let parsedAction = action;
  const canonDomain = canonicalizeDomain(domain);
  const effectiveDomain = await getEffectiveDomain(token, canonDomain);
  if (effectiveDomain === undefined) {
    throw new ClientError('Invalid token');
  }
  const zones = (await flare.listZones({ name: effectiveDomain })).result;
  if (zones.length !== 1) throw new ClientError('Zone not unique or not found');
  if (zones[0].name !== domain && zones[0].name !== simplifyDomain(domain)) throw new ClientError('Zone not found');
  const zoneId = zones[0].id;
  const records = await flare.listRecords(zoneId, domain, rType);
  if (parsedAction === 'upsert' && records.length === 0) {
    parsedAction = 'create';
  } else {
    parsedAction = 'update';
  }
  let result;
  switch (parsedAction) {
    case 'create':
      if (records.length > 0) {
        throw new ClientError('Record Already Existing');
      }
      result = await flare.createRecord(zoneId, rType, domain, content);
      break;
    case 'update':
    case 'delete': {
      if (records.length > 1) {
        throw new ClientError('Record Not Unique');
      } else if (records.length === 0) {
        throw new ClientError('Record Not Found');
      }
      const recordId = records[0].id;
      if (parsedAction === 'update') {
        result = await flare.updateRecord(zoneId, recordId, rType, domain, content);
      } else { // delete
        result = await flare.deleteRecord(zoneId, recordId);
      }
      break;
    }
    default:
  }
  return new Response(`Successfully Updated at ${new Date()}`, { status: 200 });
}

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request: Request) {
  const url = new URL(request.url);
  if (url.pathname === '/' && request.method === 'GET') {
    return new Response('cfapi-ddns-worker is up');
  } if (request.method === 'POST') {
    try {
      const path = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
      const [action, token, domain, rType, content] = path.split('/', 5);
      if (['update', 'create', 'delete', 'upsert'].includes(action)) {
        if ([token, domain, rType, content].some((e) => e === undefined)) {
          throw new ClientError('Parameters Missing');
        }
        return await handleAction(action, token, domain, rType, content);
      }

      throw new ClientError(`Unsupported action: ${action}`);
    } catch (e) {
      if (e instanceof ClientError) {
        return new Response(e as any, { status: 400 });
      }

      return new Response(e as any, { status: 500 });
    }
  } else {
    return new Response('', { status: 405 });
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
registerSchedule(flare);
