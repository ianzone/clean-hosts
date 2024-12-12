import type { HostsObj } from './params.ts';

export function dedupe(hostsObj: HostsObj) {
  const dedupedHosts: { [key: string]: string[] } = {};

  for (const domain in hostsObj) {
    if (Object.hasOwn(hostsObj, domain)) {
      const ipSet = new Set<string>();
      for (const dnsServer in hostsObj[domain]) {
        if (Object.hasOwn(hostsObj[domain], dnsServer)) {
          for (const ip of hostsObj[domain][dnsServer]) {
            ipSet.add(ip);
          }
        }
      }
      dedupedHosts[domain] = Array.from(ipSet);
    }
  }
  return dedupedHosts;
}
