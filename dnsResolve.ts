import { promises as dns } from 'node:dns';
import { writeFileSync } from 'node:fs';
import { dedupe } from './dedupe.ts';
import { type HostObj, type HostsObj, dnsServers, domains } from './params.ts';

async function resolve4(domain: string, server: string) {
  const resolver = new dns.Resolver();
  resolver.setServers([server]);
  const host: HostObj = {};
  try {
    host[server] = await resolver.resolve4(domain);
    return host;
  } catch (error) {
    host[server] = error;
    throw host;
  }
}

async function resolveWithServers(domain: string) {
  const promises = dnsServers.map((server) => resolve4(domain, server));
  const results = await Promise.allSettled(promises);

  const hostResolved: HostObj = {};
  const hostUnsolved: HostObj = {};

  for (const result of results) {
    if (result.status === 'fulfilled') {
      Object.assign(hostResolved, result.value);
    } else {
      Object.assign(hostUnsolved, result.reason);
    }
  }
  return { hostResolved, hostUnsolved };
}

async function resolveDomains() {
  const hostsResolved: HostsObj = {};
  const hostsUnsolved: HostsObj = {};

  for (const domain of domains) {
    const { hostResolved, hostUnsolved } = await resolveWithServers(domain);
    if (Object.keys(hostResolved).length) {
      hostsResolved[domain] = hostResolved;
    }
    if (Object.keys(hostUnsolved).length) {
      hostsUnsolved[domain] = hostUnsolved;
    }
  }
  if (Object.keys(hostsUnsolved).length) {
    console.error('Unsolved hosts:', hostsUnsolved);
  }
  return hostsResolved;
}

async function writeHostsJSON() {
  const hosts = await resolveDomains();
  writeFileSync('hosts.json', JSON.stringify(hosts, null, 2));
  writeFileSync('hosts_deduped.json', JSON.stringify(dedupe(hosts), null, 2));
}
writeHostsJSON();
