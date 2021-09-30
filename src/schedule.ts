import Flare from './flare';
import { Zone } from './model';

async function fetchAllZones(flare: Flare): Promise<Zone[]> {
  let list: Zone[] = [];
  let currentPage = 0;
  let totalPage = 1;
  while (currentPage !== totalPage) {
    currentPage++;
    /* eslint-disable-next-line no-await-in-loop */
    const { result, result_info: resultInfo } = await flare.listZones({ page: currentPage });
    list = list.concat(result);
    totalPage = resultInfo.total_pages;
  }
  return list;
}

const ZONE_PREFIX = 'ZONE/';
const ZONE_ID_DIVIDER = ' ';
const ZONE_NAME_DIVIDER = '/';

async function writeZones(zones: Zone[]): Promise<any> {
  return Promise.all([
    ...zones.map((zone) => CFAPI_DDNS_WORKER_STORE.put(`${ZONE_PREFIX}${zone.id}`, JSON.stringify(zone))),
    CFAPI_DDNS_WORKER_STORE.put('zoneNameList', zones.map((zone) => zone.name).join(ZONE_NAME_DIVIDER)),
    CFAPI_DDNS_WORKER_STORE.put('zoneIdList', zones.map((zone) => zone.id).join(ZONE_ID_DIVIDER)),
  ]);
}

async function main(flare: Flare) {
  const zones = await fetchAllZones(flare);
  return writeZones(zones);
}

export async function readAllZoneName(): Promise<Zone['name'][]> {
  const zoneNameList = await CFAPI_DDNS_WORKER_STORE.get('zoneNameList');
  if (!zoneNameList) return [];
  return zoneNameList.split(ZONE_NAME_DIVIDER);
}

export default function registerSchedule(flare: Flare): void {
  addEventListener('scheduled', (evt) => {
    evt.waitUntil(main(flare));
  });
}
